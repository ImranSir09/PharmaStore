import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Truck, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  X,
  CreditCard,
  PieChart
} from 'lucide-react';
import { auth, logout } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ to, icon, label, active, onClick }: SidebarItemProps) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </Link>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/billing', icon: <ShoppingCart size={20} />, label: 'Billing' },
    { to: '/inventory', icon: <Package size={20} />, label: 'Inventory' },
    { to: '/purchases', icon: <Truck size={20} />, label: 'Purchases' },
    { to: '/customers', icon: <Users size={20} />, label: 'Customers' },
    { to: '/accounts', icon: <CreditCard size={20} />, label: 'Accounts' },
    { to: '/reports', icon: <PieChart size={20} />, label: 'Reports' },
    { to: '/gst', icon: <FileText size={20} />, label: 'GST Module' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <Package className="text-blue-600" />
              <span>PharmaStore</span>
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                active={location.pathname === item.to}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={() => logout()}
              className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find(item => item.to === location.pathname)?.label || 'Overview'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{auth.currentUser?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{localStorage.getItem('userRole') || 'Pharmacist'}</p>
              </div>
              <img 
                src={auth.currentUser?.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser?.displayName || 'U'}`} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-gray-200"
              />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};
