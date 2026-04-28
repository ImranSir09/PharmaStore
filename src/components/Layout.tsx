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
  Bell,
  Menu,
  X,
  CreditCard,
  PieChart
} from 'lucide-react';
import { auth } from '../lib/firebase';
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
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'DASHBOARD' },
    { to: '/billing', icon: <ShoppingCart size={18} />, label: 'BILLING' },
    { to: '/inventory', icon: <Package size={18} />, label: 'INVENTORY' },
    { to: '/purchases', icon: <Truck size={18} />, label: 'PURCHASES' },
    { to: '/customers', icon: <Users size={18} />, label: 'CUSTOMERS' },
    { to: '/accounts', icon: <CreditCard size={18} />, label: 'ACCOUNTS' },
    { to: '/reports', icon: <PieChart size={18} />, label: 'REPORTS' },
    { to: '/gst', icon: <FileText size={18} />, label: 'GST MODULE' },
  ];

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans">
      <div className="flex-1 flex overflow-hidden">
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
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-base 
          transform transition-transform duration-300 ease-in-out lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col">
            <div className="p-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand rounded flex items-center justify-center text-white font-black text-xl">V</div>
                <h1 className="text-xl font-black tracking-tighter uppercase text-text-primary">
                  Pharma<span className="text-brand">Store</span>
                </h1>
              </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-xs font-black tracking-widest ${
                    location.pathname === item.to 
                      ? 'bg-brand text-white shadow-md shadow-brand/20' 
                      : 'text-text-secondary hover:bg-brand/5 hover:text-brand'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-border-base">
              <div className="px-4 py-3 text-[9px] font-black tracking-[0.2em] text-text-secondary/40 uppercase text-center">
                PharmaStore System v1.0
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="h-16 bg-white border-b border-border-base flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-text-secondary hover:bg-surface-bg rounded-lg"
              >
                <Menu size={20} />
              </button>
              <h2 className="text-sm font-black tracking-widest text-text-primary uppercase">
                {menuItems.find(item => item.to === location.pathname)?.label || 'OVERVIEW'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex bg-success-background text-success-primary px-3 py-1 rounded-full text-[10px] font-black border border-success-primary/20 tracking-wider">
                GST ACTIVE: 27AABCU1234F1Z5
              </div>
              <button className="p-2 text-text-secondary hover:text-brand hover:bg-brand/5 rounded-full transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-primary rounded-full border-2 border-white"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-border-base">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-text-primary uppercase tracking-tighter">PHARMACIST ADMIN</p>
                  <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest leading-none mt-1">OWNER</p>
                </div>
                <img 
                  src={`https://ui-avatars.com/api/?name=Admin&background=0066FF&color=fff`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-lg border border-border-base shadow-sm"
                />
              </div>
            </div>
          </header>

          <main className="p-6 overflow-x-hidden flex-1">
            {children}
          </main>
        </div>
      </div>

      {/* Status Bar Footer */}
      <footer className="h-10 bg-text-primary text-white flex items-center justify-between px-6 text-[10px] shrink-0 font-mono">
        <div className="flex gap-6 items-center uppercase tracking-widest font-bold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success-primary animate-pulse"></span> 
            TERMINAL 01: ONLINE
          </div>
          <div className="opacity-60 flex items-center gap-4">
            <span>SHIFT: 08:00 AM - 04:00 PM</span>
            <span>BACKEND: FIRESTORE ENTERPRISE</span>
          </div>
        </div>
        <div className="font-bold flex items-center gap-4">
          <span className="bg-brand px-2 py-0.5 rounded text-[9px] uppercase tracking-tighter">Production Build v1.0.4</span>
          <span className="opacity-80">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} | {new Date().toLocaleTimeString('en-IN', { hour12: false })}</span>
        </div>
      </footer>
    </div>
  );
};
