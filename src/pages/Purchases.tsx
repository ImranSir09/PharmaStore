import React, { useState } from 'react';
import { 
  Plus, 
  History,
  Search
} from 'lucide-react';

const Purchases = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
        <div>
          <h2 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-1">Purchase Management</h2>
          <p className="text-[10px] font-bold text-text-secondary uppercase">Stock acquisition & supplier ledger</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-3 bg-brand text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-brand-700 transition-all shadow-xl shadow-brand/20 flex items-center gap-2">
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
    </div>
  );
};

export default Purchases;
