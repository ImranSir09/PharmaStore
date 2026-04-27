import React from 'react';
import { FileText, Download, PieChart, ShieldCheck } from 'lucide-react';

const GST = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl text-white shadow-xl">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">GST Compliance Hub</h2>
            <p className="text-indigo-100 max-w-md">Automated tax calculation and statutory reporting for your pharmacy.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1">Tax Collected (Apr)</p>
              <p className="text-2xl font-black">₹24,840.12</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1">ITC (Apr)</p>
              <p className="text-2xl font-black">₹18,200.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'GSTR-1', desc: 'Outward supplies' },
          { title: 'GSTR-2', desc: 'Inward supplies' },
          { title: 'GSTR-3B', desc: 'Summary return' }
        ].map((report) => (
          <div key={report.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
              <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">{report.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{report.desc}</p>
            <div className="flex gap-2 w-full">
              <button className="flex-1 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors">
                JSON
              </button>
              <button className="flex-1 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                <Download size={14} />
                Excel
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ShieldCheck className="text-green-500" size={24} />
          Tax Breakdown Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Exempted (0%)', value: '45,200' },
            { label: 'Standard (5%)', value: '12,500' },
            { label: 'Medical (12%)', value: '1,85,000' },
            { label: 'Luxury (18%)', value: '8,400' }
          ].map((item) => (
            <div key={item.label} className="p-4 bg-gray-50 rounded-xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-1">₹{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GST;
