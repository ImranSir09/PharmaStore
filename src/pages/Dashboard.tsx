import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  IndianRupee,
  ShoppingCart,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { collection, query, limit, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { format, subDays } from 'date-fns';

const StatCard = ({ title, value, subValue, icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/10">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-xl border border-border-base/10 shadow-sm ${color}`}>
        {icon}
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-[10px] font-black tracking-widest px-2 py-1 rounded-full uppercase ${trend > 0 ? 'bg-success-background text-success-primary' : 'bg-red-50 text-error-primary'}`}>
          {trend > 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-2">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-3xl font-black text-text-primary tracking-tighter">{value}</h3>
      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">{subValue}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    sales: 0,
    orders: 0,
    customers: 0,
    lowStock: 0,
    nearExpiry: 0
  });

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  useEffect(() => {
    // Fetch real stats from Firestore
    const fetchStats = async () => {
      // Prototype data for now, real queries would be more complex
      const salesQuery = query(collection(db, 'sales'), limit(100));
      const medicinesQuery = query(collection(db, 'medicines'));
      const customersQuery = query(collection(db, 'customers'));
      
      const [salesSnap, medSnap, custSnap] = await Promise.all([
        getDocs(salesQuery),
        getDocs(medicinesQuery),
        getDocs(customersQuery)
      ]);

      let totalSales = 0;
      salesSnap.forEach(doc => totalSales += doc.data().totalAmount || 0);

      setStats({
        sales: totalSales,
        orders: salesSnap.size,
        customers: custSnap.size,
        lowStock: 12, // Dummy count for demo
        nearExpiry: 5  // Dummy count for demo
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Net Sales" 
          value={`₹${stats.sales.toLocaleString('en-IN')}`} 
          subValue="Current Month" 
          icon={<IndianRupee className="text-brand" size={24} />} 
          color="bg-brand/5"
          trend={12.5}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          subValue="Processed Today" 
          icon={<ShoppingCart className="text-purple-600" size={24} />} 
          color="bg-purple-50"
          trend={8.2}
        />
        <StatCard 
          title="Active Base" 
          value={stats.customers} 
          subValue="Total Verified" 
          icon={<Users className="text-success-primary" size={24} />} 
          color="bg-success-background"
          trend={-2.4}
        />
        <StatCard 
          title="Stock Alerts" 
          value={stats.lowStock} 
          subValue="Items Below Min" 
          icon={<AlertTriangle className="text-amber-600" size={24} />} 
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-1">Performance Analytics</h3>
              <p className="text-[10px] font-bold text-text-secondary uppercase">Unified daily transaction volume</p>
            </div>
            <select className="bg-surface-bg border-2 border-border-base text-[10px] font-black uppercase tracking-widest rounded-lg px-4 py-2 text-text-primary focus:border-brand outline-none transition-all">
              <option>Last 7 Business Days</option>
              <option>Last 30 Business Days</option>
            </select>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0052CC" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#0052CC" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D0D5DD" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#667085', fontSize: 10, fontWeight: 900}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#667085', fontSize: 10, fontWeight: 900}} 
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '2px solid #D0D5DD', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '10px',
                    fontWeight: 900,
                    textTransform: 'uppercase'
                  }}
                  cursor={{ stroke: '#0052CC', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0052CC" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Small Stats */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
            <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em] mb-8">Critical Alerts</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-5 p-5 bg-error-primary/5 rounded-xl border-2 border-error-primary/10 transition-all hover:bg-error-primary/10">
                <div className="p-3 bg-white rounded-lg text-error-primary shadow-sm">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-text-primary uppercase tracking-tight">5 Units Expiring</p>
                  <p className="text-[10px] font-bold text-error-primary tracking-widest uppercase mt-1">Action Immediate</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-5 bg-amber-50 rounded-xl border-2 border-amber-200/50 transition-all hover:bg-amber-100/50">
                <div className="p-3 bg-white rounded-lg text-amber-600 shadow-sm">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-text-primary uppercase tracking-tight">Inventory Low</p>
                  <p className="text-[10px] font-bold text-amber-900 tracking-widest uppercase mt-1">12 Items Below Min</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-text-primary p-8 rounded-xl shadow-2xl shadow-blue-900/20 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10">
              <div className="bg-brand text-white text-[8px] font-black uppercase tracking-[0.3em] px-2 py-1 rounded w-fit mb-4">Enterprise</div>
              <h4 className="text-lg font-black uppercase tracking-tighter mb-3 leading-tight">Data Security</h4>
              <p className="text-xs text-white/60 font-medium mb-6 leading-relaxed">Your data is secured with AES-256 encryption and powered by Google Cloud's Enterprise infrastructure.</p>
              <button className="w-full py-4 bg-white text-text-primary hover:bg-brand hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl">
                Security Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
