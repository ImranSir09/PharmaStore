import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  History,
  Search,
  X,
  Package,
  Calendar,
  IndianRupee,
  ChevronDown
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { inventoryService } from '../services/inventoryService';

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    medicineId: '',
    medicineName: '',
    batchNumber: '',
    expiryDate: '',
    purchaseRate: 0,
    saleRate: 0,
    mrp: 0,
    currentStock: 0,
    gstPercentage: 12
  });

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const q = query(collection(db, 'medicines'), orderBy('name'), limit(100));
      const snap = await getDocs(q);
      const meds = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMedicines(meds);
    } catch (error) {
      console.error('Error fetching medicines', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medicineId || !formData.batchNumber) {
      alert('Please select medicine and enter batch number');
      return;
    }

    setLoading(true);
    try {
      await inventoryService.recordPurchase({
        ...formData,
        medicineName: medicines.find(m => m.id === formData.medicineId)?.name || 'Unknown'
      });
      alert('Purchase recorded and stock updated!');
      setShowAddModal(false);
      setFormData({
        medicineId: '',
        medicineName: '',
        batchNumber: '',
        expiryDate: '',
        purchaseRate: 0,
        saleRate: 0,
        mrp: 0,
        currentStock: 0,
        gstPercentage: 12
      });
    } catch (error) {
      console.error('Error recording purchase', error);
      alert('Failed to record purchase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
        <div>
          <h2 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-1">Purchase Management</h2>
          <p className="text-[10px] font-bold text-text-secondary uppercase">Stock acquisition & supplier ledger</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-5 py-3 bg-brand text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-brand-700 transition-all shadow-xl shadow-brand/20 flex items-center gap-2"
          >
            <Plus size={16} />
            Add Manual Entry
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="bg-white rounded-xl shadow-lg shadow-blue-900/5 border border-border-base overflow-hidden">
        <div className="p-6 border-b border-border-base flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest">Recent purchase orders</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH BILLS..." 
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-surface-bg border border-border-base rounded-lg text-[10px] font-bold tracking-widest uppercase outline-none focus:border-brand"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
            />
          </div>
        </div>
        <div className="p-20 text-center">
          <div className="w-16 h-16 bg-surface-bg rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border-base">
            <History size={24} className="text-text-secondary opacity-20" />
          </div>
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">No transaction records found</p>
          <p className="text-[9px] font-bold text-text-secondary/60 uppercase mt-1">Initiate a new purchase to see records here</p>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-border-base animate-in fade-in zoom-in duration-200">
            <div className="p-6 bg-brand text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter">Add Purchase Entry</h3>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Direct inventory update</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Select Medicine</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                    <select 
                      required
                      className="w-full pl-12 pr-4 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest appearance-none outline-none focus:ring-2 focus:ring-brand transition-all"
                      value={formData.medicineId}
                      onChange={(e) => setFormData({...formData, medicineId: e.target.value})}
                    >
                      <option value="">CHOOSE FROM INVENTORY</option>
                      {medicines.map(m => (
                        <option key={m.id} value={m.id}>{m.name.toUpperCase()} - {m.company.toUpperCase()}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/40 pointer-events-none" size={16} />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Batch Number</label>
                  <input 
                    required
                    type="text" 
                    placeholder="E.G. BT1234"
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all uppercase placeholder:text-text-secondary/20"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({...formData, batchNumber: e.target.value.toUpperCase()})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Expiry Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" size={18} />
                    <input 
                      required
                      type="month" 
                      className="w-full pl-12 pr-4 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all appearance-none"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Purchase Rate (₹)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all"
                    value={formData.purchaseRate}
                    onChange={(e) => setFormData({...formData, purchaseRate: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">MRP (₹)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all"
                    value={formData.mrp}
                    onChange={(e) => setFormData({...formData, mrp: parseFloat(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Quantity (UNITS)</label>
                  <input 
                    required
                    type="number" 
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value)})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2">Sale Rate (₹)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    className="w-full px-5 py-4 bg-surface-bg border-none rounded-xl font-black text-xs tracking-widest outline-none focus:ring-2 focus:ring-brand transition-all"
                    value={formData.saleRate}
                    onChange={(e) => setFormData({...formData, saleRate: parseFloat(e.target.value)})}
                  />
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
                  disabled={loading}
                  className="flex-1 py-5 bg-brand text-white rounded-xl font-black text-xs tracking-widest uppercase hover:bg-brand-700 transition-all shadow-xl shadow-brand/20 disabled:opacity-50"
                >
                  {loading ? 'PROCESSING...' : 'CONFIRM PURCHASE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
