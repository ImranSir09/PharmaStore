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
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      {trend && (
        <span className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <span className="text-xs font-medium text-gray-400">{subValue}</span>
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
          title="Total Sales" 
          value={`₹${stats.sales.toLocaleString('en-IN')}`} 
          subValue="Last 30 days" 
          icon={<IndianRupee className="text-blue-600" size={24} />} 
          color="bg-blue-50"
          trend={12.5}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.orders} 
          subValue="Last 30 days" 
          icon={<ShoppingCart className="text-purple-600" size={24} />} 
          color="bg-purple-50"
          trend={8.2}
        />
        <StatCard 
          title="Active Customers" 
          value={stats.customers} 
          subValue="Regular buyers" 
          icon={<Users className="text-green-600" size={24} />} 
          color="bg-green-50"
          trend={-2.4}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats.lowStock} 
          subValue="Action required" 
          icon={<AlertTriangle className="text-amber-600" size={24} />} 
          color="bg-amber-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
              <p className="text-sm text-gray-500">Daily performance metrics</p>
            </div>
            <select className="bg-gray-50 border-none text-sm font-medium rounded-lg px-3 py-2 text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#2563eb', strokeWidth: 2 }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions & Small Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Urgent Alerts</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="p-2 bg-white rounded-lg text-red-600">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-900">5 Items Expiring</p>
                  <p className="text-xs text-red-700">Check inventory for details</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="p-2 bg-white rounded-lg text-amber-600">
                  <Package size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-900">Low Inventory</p>
                  <p className="text-xs text-amber-700">12 items below minimum level</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
            <h4 className="font-bold mb-2">New: AI Smart Search</h4>
            <p className="text-sm text-blue-100 mb-4">Instantly find substitutes by salt name using our new Gemini-powered engine.</p>
            <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors backdrop-blur-md">
              Try it now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
