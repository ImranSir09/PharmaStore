import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  FileUp, 
  Camera, 
  Loader2, 
  CheckCircle2, 
  X,
  History,
  Search
} from 'lucide-react';
import { scanBillOCR } from '../services/aiService';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

const Purchases = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setIsScanning(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await scanBillOCR(base64);
        setScannedData(result);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('OCR failed', error);
      setLoading(false);
      alert('Failed to scan bill. Please try again or enter manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const savePurchase = async () => {
    if (!scannedData) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'purchases'), {
        ...scannedData,
        createdAt: new Date().toISOString()
      });
      alert('Purchase recorded and stock updated!');
      setScannedData(null);
    } catch (error) {
      console.error('Save failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Purchase Management</h2>
          <p className="text-sm text-gray-500">Add new stock and manage suppliers</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-100">
            <Plus size={20} />
            Manual Inventory Entry
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-900 font-bold">Scanning with Gemini AI...</p>
          <p className="text-gray-500 text-sm">Identifying bill items, batches, and prices automatically.</p>
        </div>
      )}

      {scannedData && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 bg-green-50 border-b border-green-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-600" size={24} />
              <div>
                <h3 className="font-bold text-green-900">AI Extraction Success</h3>
                <p className="text-xs text-green-700">Please verify details before saving</p>
              </div>
            </div>
            <button onClick={() => setScannedData(null)} className="text-green-600 hover:bg-green-100 p-2 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Supplier</label>
                <p className="font-bold text-gray-900">{scannedData.supplier_name || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase">Bill Number</label>
                <p className="font-bold text-gray-900">{scannedData.bill_number}</p>
              </div>
            </div>
            <div className="md:col-span-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-3">Item</th>
                    <th className="text-left pb-3">Batch</th>
                    <th className="text-center pb-3">Qty</th>
                    <th className="text-right pb-3">Rate</th>
                    <th className="text-right pb-3">GST</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {scannedData.items?.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="py-3 font-medium">{item.name}</td>
                      <td className="py-3 text-xs">{item.batch}</td>
                      <td className="py-3 text-center">{item.qty}</td>
                      <td className="py-3 text-right">₹{item.rate}</td>
                      <td className="py-3 text-right">{item.gst_percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button 
              onClick={() => setScannedData(null)}
              className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={savePurchase}
              className="px-6 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-colors shadow-lg shadow-blue-100"
            >
              Verify & Save Stock
            </button>
          </div>
        </div>
      )}

      {/* History List Placeholder */}
      {!scannedData && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Purchases</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search bills..." className="pl-9 pr-4 py-1 bg-gray-50 border-none rounded-lg text-sm" />
            </div>
          </div>
          <div className="p-12 text-center text-gray-400">
            <History size={48} className="mx-auto mb-4 opacity-10" />
            <p>No recent purchase history found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
