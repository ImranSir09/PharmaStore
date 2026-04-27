import React from 'react';
import { PieChart, TrendingUp, Calendar, Download, FileText, Package } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const Reports = () => {
  const data = [
    { name: 'Tablets', value: 400, color: '#3b82f6' },
    { name: 'Syrups', value: 300, color: '#8b5cf6' },
    { name: 'Injections', value: 200, color: '#10b981' },
    { name: 'Creams', value: 120, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Analytics & Reports</h2>
          <p className="text-sm text-gray-500">Business performance and data insights</p>
        </div>
        <div className="flex gap-3">
          <select className="bg-gray-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-gray-600 outline-none">
            <option>April 2026</option>
            <option>March 2026</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 text-sm">
            <Download size={18} />
            Export Monthly Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Package className="text-blue-600" size={20} />
            Category Performance
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="text-purple-600" size={20} />
            Quick Reports
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Inventory Valuation', subtitle: 'Detailed stock value report', icon: <Package size={20} /> },
              { title: 'Profit & Loss', subtitle: 'Net margin analysis', icon: <TrendingUp size={20} /> },
              { title: 'Expiry Forecast', subtitle: 'Next 6 months prediction', icon: <Calendar size={20} /> },
              { title: 'Sales Ledger', subtitle: 'Complete transaction history', icon: <FileText size={20} /> }
            ].map((report, i) => (
              <button key={i} className="text-left p-4 bg-gray-50 rounded-xl hover:bg-blue-50 hover:ring-2 hover:ring-blue-200 transition-all group">
                <div className="p-2 bg-white rounded-lg text-gray-400 group-hover:text-blue-600 w-fit mb-3 shadow-sm">
                  {report.icon}
                </div>
                <p className="font-bold text-gray-900 text-sm">{report.title}</p>
                <p className="text-[10px] text-gray-500 uppercase font-bold">{report.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
