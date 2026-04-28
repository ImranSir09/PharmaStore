import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Loader2 } from 'lucide-react';

// Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Billing = React.lazy(() => import('./pages/Billing'));
const Inventory = React.lazy(() => import('./pages/Inventory'));
const Purchases = React.lazy(() => import('./pages/Purchases'));
const Customers = React.lazy(() => import('./pages/Customers'));
const Accounts = React.lazy(() => import('./pages/Accounts'));
const Reports = React.lazy(() => import('./pages/Reports'));
const GST = React.lazy(() => import('./pages/GST'));

const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
    <p className="text-gray-600 font-medium animate-pulse">Initializing PharmaStore...</p>
  </div>
);

export default function App() {
  return (
    <Router>
      <Layout>
        <React.Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/accounts" element={<Accounts />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/gst" element={<GST />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </React.Suspense>
      </Layout>
    </Router>
  );
}
