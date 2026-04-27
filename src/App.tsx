import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, db } from './lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Layout } from './components/Layout';
import { LogIn, Loader2 } from 'lucide-react';

// Pages - to be created
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

const LoginPage = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <LogIn className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PharmaStore ERP</h1>
        <p className="text-gray-600 mb-8">Modern pharmacy management for the next generation medical store.</p>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 bg-white rounded-full" />
              <span>Continue with Google</span>
            </>
          )}
        </button>
        
        <p className="mt-8 text-xs text-gray-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check/Set user in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            role: 'pharmacist', // Default role
            createdAt: new Date().toISOString()
          });
          localStorage.setItem('userRole', 'pharmacist');
        } else {
          localStorage.setItem('userRole', userDoc.data().role);
        }
        setUser(user);
      } else {
        setUser(null);
        localStorage.removeItem('userRole');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingScreen />;

  if (!user) return <LoginPage />;

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
