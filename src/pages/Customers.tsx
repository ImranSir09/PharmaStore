import React from 'react';
import { Users, Search, Download, Plus } from 'lucide-react';

const Customers = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Customer Records</h2>
          <p className="text-sm text-gray-500">Manage regular customers and credit ledgers</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold flex items-center gap-2">
            <Download size={20} />
            Export
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus size={20} />
            New Customer
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search by name or mobile..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
        </div>
        <div className="p-12 text-center text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-10" />
          <p>No customer records found matching your search.</p>
        </div>
      </div>
    </div>
  );
};

export default Customers;
