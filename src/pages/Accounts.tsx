import React from 'react';
import { CreditCard, ArrowUpRight, ArrowDownRight, IndianRupee, Plus } from 'lucide-react';

const Accounts = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Cash in Hand</p>
          <h3 className="text-2xl font-bold text-gray-900">₹45,230.00</h3>
          <div className="mt-4 flex items-center gap-1 text-green-600 text-xs font-bold">
            <ArrowUpRight size={14} />
            +₹3,200 today
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Bank Balance</p>
          <h3 className="text-2xl font-bold text-gray-900">₹2,84,000.00</h3>
          <div className="mt-4 flex items-center gap-1 text-blue-600 text-xs font-bold">
            <CreditCard size={14} />
            Linked Account: HDFC
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Outstanding Payable</p>
          <h3 className="text-2xl font-bold text-red-600">₹12,450.00</h3>
          <div className="mt-4 flex items-center gap-1 text-red-600 text-xs font-bold">
            <ArrowDownRight size={14} />
            3 Suppliers pending
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Transaction Ledger</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 text-sm">
            <Plus size={16} />
            Record Transaction
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                { date: '2026-04-27', desc: 'Medicine Sale - INV-8273', type: 'Income', mode: 'UPI', amount: 450 },
                { date: '2026-04-27', desc: 'Shop Electricity Bill', type: 'Expense', mode: 'Cash', amount: -2800 },
                { date: '2026-04-26', desc: 'Supplier Payment - Cipla', type: 'Payment', mode: 'NEFT', amount: -15000 },
                { date: '2026-04-26', desc: 'Customer Collection - Rahul', type: 'Income', mode: 'Cash', amount: 500 },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{row.date}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{row.desc}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                      row.amount > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{row.mode}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    ₹{Math.abs(row.amount).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
