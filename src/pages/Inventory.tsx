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
  Info,
  Loader2
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

import { inventoryService, Medicine } from '../services/inventoryService';

const Inventory = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  const [newMedicine, setNewMedicine] = useState<Medicine>({
    name: '',
    salt: '',
    company: '',
    category: 'Tablet',
    minStockLevel: 10,
    hsnCode: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
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
      await inventoryService.addMedicine(newMedicine);
      setShowAddModal(false);
      setNewMedicine({
        name: '',
        salt: '',
        company: '',
        category: 'Tablet',
        minStockLevel: 10,
        hsnCode: ''
      });
      fetchInventory();
      alert('Medicine added successfully!');
    } catch (error) {
      console.error('Error adding medicine', error);
      alert('Failed to add medicine');
    }
  };

  const handleDeleteMedicine = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? All batches will be removed.`)) return;
    try {
      await inventoryService.deleteMedicine(id);
      fetchInventory();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm('Delete this batch?')) return;
    try {
      await inventoryService.deleteBatch(batchId);
      fetchInventory();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const [expandedMed, setExpandedMed] = useState<string | null>(null);

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

  const filteredMedicines = medicines.filter(med => 
    med.name.toUpperCase().includes(searchTerm.toUpperCase()) ||
    med.salt.toUpperCase().includes(searchTerm.toUpperCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white p-8 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
        <div>
          <h2 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-1">Global Inventory</h2>
          <p className="text-[10px] font-bold text-text-secondary uppercase">Medicine master & batch management</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH CATALOG (F2)..." 
              className="w-full pl-12 pr-4 py-3 bg-surface-bg border-none rounded-xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-brand text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-brand-700 transition-all shadow-xl shadow-brand/20 flex items-center gap-3 whitespace-nowrap"
          >
            <Plus size={20} />
            Add New Drug
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-lg shadow-blue-900/5 border border-border-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-surface-bg text-text-secondary text-[10px] font-black tracking-widest uppercase">
                <th className="px-8 py-5 border-b border-border-base">Medicine Identification</th>
                <th className="px-8 py-5 border-b border-border-base">Category</th>
                <th className="px-8 py-5 border-b border-border-base text-center">Batch Count</th>
                <th className="px-8 py-5 border-b border-border-base text-center">Net Stock</th>
                <th className="px-8 py-5 border-b border-border-base">Inventory Health</th>
                <th className="px-8 py-5 border-b border-border-base"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-base">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-brand mb-4" size={32} />
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Accessing central database...</p>
                  </td>
                </tr>
              ) : filteredMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Package className="mx-auto text-text-secondary/20 mb-4" size={48} />
                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">No matching records found</p>
                  </td>
                </tr>
              ) : filteredMedicines.map((med) => {
                const totalStock = calculateTotalStock(med.batches);
                const isLowStock = totalStock <= (med.minStockLevel || 10);
                const isExpanded = expandedMed === med.id;
                
                return (
                  <React.Fragment key={med.id}>
                    <tr 
                      onClick={() => setExpandedMed(isExpanded ? null : med.id)}
                      className={`hover:bg-brand/5 transition-all cursor-pointer group ${isExpanded ? 'bg-brand/5' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className={`p-4 rounded-xl border border-border-base/10 shadow-sm ${isLowStock ? 'bg-error-primary/5 text-error-primary' : 'bg-brand/5 text-brand'}`}>
                            {med.category === 'Tablet' ? <TrendingDown size={20} /> : <Package size={20} />}
                          </div>
                          <div>
                            <p className="font-black text-text-primary uppercase tracking-tight text-sm">{med.name}</p>
                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">{med.salt} | {med.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-[9px] font-black px-3 py-1 bg-surface-bg text-text-secondary border border-border-base rounded-full uppercase tracking-widest">
                          {med.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center font-black text-xs text-text-primary">{med.batches.length}</td>
                      <td className="px-8 py-6 text-center">
                        <p className={`text-lg font-black tracking-tighter ${isLowStock ? 'text-error-primary' : 'text-text-primary'}`}>{totalStock}</p>
                        {isLowStock && <p className="text-[8px] font-black text-error-primary tracking-[0.2em] uppercase mt-1 animate-pulse">Critical Stock</p>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          {med.batches.length === 0 ? (
                            <span className="text-[9px] font-black text-text-secondary/40 uppercase tracking-widest">No Active Batches</span>
                          ) : (
                            med.batches.slice(0, 2).map((b: any) => {
                              const status = getExpiryStatus(b.expiryDate);
                              return (
                                <div key={b.id} className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    status === 'Expired' ? 'bg-error-primary' : 
                                    status === 'Near Expiry' ? 'bg-amber-500' : 'bg-success-primary'
                                  }`} />
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${
                                    status === 'Expired' ? 'text-error-primary' : 
                                    status === 'Near Expiry' ? 'text-amber-600' : 'text-success-primary'
                                  }`}>
                                    {b.batchNumber}: {status}
                                  </span>
                                </div>
                              );
                            })
                          )}
                          {med.batches.length > 2 && (
                            <span className="text-[8px] font-black text-brand uppercase tracking-tighter">+{med.batches.length - 2} More Batches</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedicine(med.id, med.name);
                          }}
                          className="p-3 text-text-secondary/20 hover:text-error-primary hover:bg-error-primary/5 rounded-xl transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Batch Details Expansion */}
                    {isExpanded && (
                      <tr className="bg-surface-bg/50">
                        <td colSpan={6} className="px-8 py-8 border-b border-border-base">
                          <div className="bg-white rounded-xl border border-border-base overflow-hidden shadow-inner">
                            <table className="w-full text-left">
                              <thead className="bg-surface-bg">
                                <tr className="text-[9px] font-black text-text-secondary uppercase tracking-widest">
                                  <th className="px-6 py-3">Batch ID</th>
                                  <th className="px-6 py-3">Expiry</th>
                                  <th className="px-6 py-3 text-center">Stock</th>
                                  <th className="px-6 py-3 text-right">P. Rate</th>
                                  <th className="px-6 py-3 text-right">S. Rate</th>
                                  <th className="px-6 py-3 text-right">MRP</th>
                                  <th className="px-6 py-3"></th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border-base">
                                {med.batches.map((b: any) => (
                                  <tr key={b.id} className="hover:bg-brand/5 transition-colors">
                                    <td className="px-6 py-4 font-black text-[11px] text-text-primary tracking-widest">{b.batchNumber}</td>
                                    <td className="px-6 py-4 text-[11px] font-bold text-text-secondary">{b.expiryDate}</td>
                                    <td className="px-6 py-4 text-center font-black text-[11px]">{b.currentStock}</td>
                                    <td className="px-6 py-4 text-right text-[11px] font-bold">₹{b.purchaseRate}</td>
                                    <td className="px-6 py-4 text-right text-[11px] font-black text-brand">₹{b.saleRate}</td>
                                    <td className="px-6 py-4 text-right text-[11px] font-bold">₹{b.mrp}</td>
                                    <td className="px-6 py-4 text-right">
                                      <button 
                                        onClick={() => handleDeleteBatch(b.id)}
                                        className="p-2 text-text-secondary/20 hover:text-error-primary transition-colors"
                                      >
                                        <X size={14} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-border-base animate-in fade-in zoom-in duration-200">
            <div className="p-8 bg-brand text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Add New Drug Entry</h3>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Master drug registration system</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddMedicine} className="p-10 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Primary Brand Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all uppercase placeholder:text-text-secondary/20"
                    placeholder="E.G. CALPOL 500"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Chemical Composition</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all uppercase"
                    placeholder="PARACETAMOL"
                    value={newMedicine.salt}
                    onChange={(e) => setNewMedicine({...newMedicine, salt: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Manufacturer</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all uppercase"
                    placeholder="GSK PHARMA"
                    value={newMedicine.company}
                    onChange={(e) => setNewMedicine({...newMedicine, company: e.target.value.toUpperCase()})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Drug Category</label>
                  <select 
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all appearance-none"
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
              </div>
              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-5 bg-surface-bg text-text-secondary rounded-xl font-black text-xs tracking-widest uppercase hover:bg-border-base transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-brand text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-brand-700 transition-all shadow-xl shadow-brand/20"
                >
                  Confirm Registration
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
