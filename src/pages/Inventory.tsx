import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  AlertTriangle, 
  Calendar,
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  Info
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  limit, 
  where 
} from 'firebase/firestore';
import { format, isBefore, addMonths } from 'date-fns';

const Inventory = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const [newMedicine, setNewMedicine] = useState({
    name: '',
    salt: '',
    company: '',
    category: 'Tablet',
    minStockLevel: 10,
    hsnCode: ''
  });

  const [newBatch, setNewBatch] = useState({
    batchNumber: '',
    medicineId: '',
    expiryDate: '',
    purchaseRate: 0,
    saleRate: 0,
    mrp: 0,
    currentStock: 0,
    gstPercentage: 12
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Fetch medicines and their batches
      const medSnap = await getDocs(query(collection(db, 'medicines'), orderBy('name')));
      const meds: any[] = [];
      medSnap.forEach(doc => meds.push({ id: doc.id, ...doc.data(), batches: [] }));

      const batchSnap = await getDocs(collection(db, 'batches'));
      batchSnap.forEach(bDoc => {
        const batchData = bDoc.data();
        const medIndex = meds.findIndex(m => m.id === batchData.medicineId);
        if (medIndex > -1) {
          meds[medIndex].batches.push({ id: bDoc.id, ...batchData });
        }
      });

      setMedicines(meds);
    } catch (error) {
      console.error('Error fetching inventory', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'medicines'), {
        ...newMedicine,
        createdAt: new Date().toISOString()
      });
      setShowAddModal(false);
      fetchInventory();
      alert('Medicine added successfully!');
    } catch (error) {
      console.error('Error adding medicine', error);
    }
  };

  const calculateTotalStock = (batches: any[]) => {
    return batches.reduce((sum, b) => sum + b.currentStock, 0);
  };

  const getExpiryStatus = (expiryDate: string) => {
    const exp = new Date(expiryDate);
    const today = new Date();
    const nearExpiryDate = addMonths(today, 3);

    if (isBefore(exp, today)) return 'Expired';
    if (isBefore(exp, nearExpiryDate)) return 'Near Expiry';
    return 'Good';
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search Inventory..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter size={18} />
          </button>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
        >
          <Plus size={20} />
          Add Medicine
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                <th className="px-6 py-4">Medicine Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Batches</th>
                <th className="px-6 py-4 text-center">Total Stock</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading medicines...</td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No medicines found</td>
                </tr>
              ) : medicines.map((med) => {
                const totalStock = calculateTotalStock(med.batches);
                const isLowStock = totalStock <= med.minStockLevel;
                
                return (
                  <React.Fragment key={med.id}>
                    <tr className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isLowStock ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{med.name}</p>
                            <p className="text-xs text-gray-500">{med.salt} | {med.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{med.batches.length}</td>
                      <td className="px-6 py-4 text-center">
                        <p className={`font-bold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>{totalStock}</p>
                        {isLowStock && <p className="text-[10px] font-bold text-red-500">LOW STOCK</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {med.batches.map((b: any) => {
                            const status = getExpiryStatus(b.expiryDate);
                            return (
                              <span key={b.id} className={`text-[10px] font-bold flex items-center gap-1 ${
                                status === 'Expired' ? 'text-red-600' : 
                                status === 'Near Expiry' ? 'text-amber-600' : 'text-green-600'
                              }`}>
                                {status === 'Expired' && <AlertTriangle size={10} />}
                                {b.batchNumber}: {status}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-600 text-white">
              <h3 className="text-xl font-bold">Add New Medicine</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-white/20 rounded-lg">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Brand Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-none"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Salt / Molecule</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-none"
                    value={newMedicine.salt}
                    onChange={(e) => setNewMedicine({...newMedicine, salt: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-none"
                    value={newMedicine.company}
                    onChange={(e) => setNewMedicine({...newMedicine, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                  <select 
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-none"
                    value={newMedicine.category}
                    onChange={(e) => setNewMedicine({...newMedicine, category: e.target.value})}
                  >
                    <option>Tablet</option>
                    <option>Syrup</option>
                    <option>Injection</option>
                    <option>Cream</option>
                    <option>Capsule</option>
                    <option>Drops</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Stock Alert</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 bg-gray-50 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none border-none"
                    value={newMedicine.minStockLevel}
                    onChange={(e) => setNewMedicine({...newMedicine, minStockLevel: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                >
                  Create Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
