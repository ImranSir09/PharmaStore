import React, { useState } from 'react';
import { PieChart, TrendingUp, Calendar, Download, FileText, Package, Loader2 } from 'lucide-react';
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
import { reportService } from '../services/reportService';

const Reports = () => {
  const [exporting, setExporting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  const data = [
    { name: 'Tablets', value: 400, color: '#0066FF' },
    { name: 'Syrups', value: 300, color: '#8b5cf6' },
    { name: 'Injections', value: 200, color: '#10b981' },
    { name: 'Creams', value: 120, color: '#f59e0b' },
  ];

  const handleExportSales = async () => {
    setExporting(true);
    try {
      await reportService.exportSalesReport(selectedMonth);
    } catch (error) {
      alert('Failed to export. Check console.');
    } finally {
      setExporting(false);
    }
  };

  const handleQuickReport = async (type: string) => {
    setExporting(true);
    try {
      if (type === 'inventory') {
        await reportService.exportInventoryReport();
      } else {
        alert('Report generation for this type is coming soon in v1.1');
      }
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center bg-white p-8 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
        <div>
          <h2 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-1">Business Analytics</h2>
          <p className="text-[10px] font-bold text-text-secondary uppercase">Unified performance & regulatory reporting</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-surface-bg border-none rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest text-text-primary outline-none focus:ring-2 focus:ring-brand"
          >
            <option>April 2026</option>
            <option>March 2026</option>
          </select>
          <button 
            onClick={handleExportSales}
            disabled={exporting}
            className="px-6 py-3 bg-brand text-white rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-brand-700 transition-all shadow-xl shadow-brand/20 flex items-center gap-3 disabled:opacity-50"
          >
            {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            Export Monthly Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
          <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest mb-10 flex items-center gap-3">
            <Package className="text-brand" size={18} />
            Category Distribution
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 40, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#667085', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', background: '#111827', color: '#fff', fontSize: '10px', fontWeight: 900 }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
          <h3 className="text-[10px] font-black text-text-primary uppercase tracking-widest mb-10 flex items-center gap-3">
            <FileText className="text-purple-600" size={18} />
            On-Demand Reporting
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { id: 'inventory', title: 'Inventory Valuation', subtitle: 'Detailed stock value report', icon: <Package size={20} /> },
              { id: 'pl', title: 'Profit & Loss', subtitle: 'Net margin analysis', icon: <TrendingUp size={20} /> },
              { id: 'expiry', title: 'Expiry Forecast', subtitle: 'Next 6 months prediction', icon: <Calendar size={20} /> },
              { id: 'ledger', title: 'Sales Ledger', subtitle: 'Complete transaction history', icon: <FileText size={20} /> }
            ].map((report, i) => (
              <button 
                key={i} 
                onClick={() => handleQuickReport(report.id)}
                className="text-left p-6 bg-surface-bg rounded-xl border border-transparent hover:border-brand/30 hover:bg-white hover:shadow-xl transition-all group"
              >
                <div className="p-3 bg-white rounded-lg text-text-secondary/40 group-hover:text-brand w-fit mb-4 shadow-sm border border-border-base transition-colors">
                  {report.icon}
                </div>
                <p className="text-xs font-black text-text-primary uppercase tracking-tighter mb-1">{report.title}</p>
                <p className="text-[9px] text-text-secondary font-bold uppercase tracking-widest group-hover:text-brand/60 transition-colors">{report.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
