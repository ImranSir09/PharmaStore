import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  CreditCard, 
  IndianRupee, 
  Smartphone, 
  Printer,
  X,
  History,
  Scan,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  increment,
  limit,
  orderBy
} from 'firebase/firestore';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface CartItem {
  id: string; // batchId
  medicineId: string;
  name: string;
  batchNumber: string;
  expiryDate: string;
  mrp: number;
  saleRate: number;
  quantity: number;
  gstPercentage: number;
}

const Billing = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState({ name: 'Cash Sale', phone: '' });
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        searchInputRef.current?.focus();
      }
      if (e.key === 'F4' && cart.length > 0) {
        handleCheckout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart]);

  const searchMedicines = async (term: string) => {
    if (term.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'batches'),
        where('currentStock', '>', 0),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const results: any[] = [];
      
      // Local filtering for demo purposes (ideally use Algolia or optimized Firestore search)
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // This is a rough search, in production we'd link to Medicine collection names
        results.push({ id: doc.id, ...data });
      });
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addToCart = (medicine: any) => {
    const existing = cart.find(item => item.id === medicine.id);
    if (existing) {
      if (existing.quantity < medicine.currentStock) {
        setCart(cart.map(item => 
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      }
    } else {
      setCart([...cart, {
        id: medicine.id,
        medicineId: medicine.medicineId,
        name: medicine.medicineName || 'Medicine Name', // Mock name
        batchNumber: medicine.batchNumber,
        expiryDate: medicine.expiryDate,
        mrp: medicine.mrp,
        saleRate: medicine.saleRate,
        quantity: 1,
        gstPercentage: medicine.gstPercentage || 12
      }]);
    }
    setSearchTerm('');
    setSearchResults([]);
    setSubstitutes([]);
  };

  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);

  const getAISubstitutes = async (item: any) => {
    setLoadingSubs(true);
    try {
      const { suggestSubstitutes } = await import('../services/aiService');
      const subs = await suggestSubstitutes(item.medicineName, item.salt || '');
      setSubstitutes(subs);
    } catch (error) {
      console.error('AI Subs error', error);
    } finally {
      setLoadingSubs(false);
    }
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let gst = 0;
    cart.forEach(item => {
      const itemTotal = item.saleRate * item.quantity;
      const itemGst = (itemTotal * item.gstPercentage) / 100;
      subtotal += itemTotal;
      gst += itemGst;
    });
    return { subtotal, gst, total: subtotal + gst };
  };

  const { subtotal, gst, total } = calculateTotals();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const saleData = {
        invoiceNumber,
        customerName: customer.name,
        customerPhone: customer.phone,
        date: new Date().toISOString(),
        items: cart,
        subtotal,
        gstAmount: gst,
        totalAmount: total,
        paymentMode,
        pharmacistId: auth.currentUser?.uid,
        createdAt: new Date().toISOString()
      };

      // 1. Create Sale Record
      await addDoc(collection(db, 'sales'), saleData);

      // 2. Update Stock (Atomically if possible)
      // For each item in cart, decrement the currentStock in batches collection
      for (const item of cart) {
        const batchRef = doc(db, 'batches', item.id);
        await updateDoc(batchRef, {
          currentStock: increment(-item.quantity)
        });
      }

      // 3. Generate Receipt
      generateReceipt(saleData);

      // 4. Reset
      setCart([]);
      setCustomer({ name: 'Cash Sale', phone: '' });
      alert('Sale completed successfully!');
    } catch (error) {
      console.error('Checkout failed', error);
      alert('Checkout failed. Please check connection.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateReceipt = (data: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235);
    doc.text('PharmaStore ERP', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('123 Medical Street, City, State - 400001', pageWidth / 2, 28, { align: 'center' });
    doc.text('GSTIN: 27AABCU1234F1Z5', pageWidth / 2, 33, { align: 'center' });
    
    // Invoice Info
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Invoice: ${data.invoiceNumber}`, 20, 45);
    doc.text(`Date: ${format(new Date(data.date), 'dd/MM/yyyy HH:mm')}`, pageWidth - 20, 45, { align: 'right' });
    doc.text(`Customer: ${data.customerName}`, 20, 52);
    
    // Table
    const tableData = data.items.map((item: any) => [
      item.name,
      item.batchNumber,
      item.expiryDate,
      item.saleRate.toFixed(2),
      item.quantity,
      item.gstPercentage + '%',
      (item.saleRate * item.quantity).toFixed(2)
    ]);
    
    (doc as any).autoTable({
      startY: 60,
      head: [['Item', 'Batch', 'Exp.', 'Rate', 'Qty', 'GST', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Totals
    doc.text(`Subtotal:`, pageWidth - 60, finalY);
    doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - 20, finalY, { align: 'right' });
    
    doc.text(`GST:`, pageWidth - 60, finalY + 7);
    doc.text(`₹${data.gstAmount.toFixed(2)}`, pageWidth - 20, finalY + 7, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total:`, pageWidth - 60, finalY + 15);
    doc.text(`₹${data.totalAmount.toFixed(2)}`, pageWidth - 20, finalY + 15, { align: 'right' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Thank you for your visit!', pageWidth / 2, finalY + 30, { align: 'center' });
    
    doc.save(`${data.invoiceNumber}.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Left side: Billing Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-w-0">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="Search Medicine (F2)" 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                searchMedicines(e.target.value);
              }}
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => addToCart(result)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex justify-between items-center transition-colors border-b border-gray-50 last:border-none"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{result.medicineName || 'Paracetamol 500mg'}</p>
                      <p className="text-xs text-gray-500">Batch: {result.batchNumber} | Exp: {result.expiryDate}</p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-blue-600">₹{result.saleRate}</p>
                        <p className={`text-[10px] ${result.currentStock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                          Stock: {result.currentStock}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          getAISubstitutes(result);
                        }}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Find Substitutes"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </button>
                ))}

                {loadingSubs && (
                  <div className="p-4 text-center text-xs text-blue-600 animate-pulse font-bold">
                    Gemini is thinking of substitutes...
                  </div>
                )}

                {substitutes.length > 0 && (
                  <div className="bg-blue-50 p-4 border-t border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Smart Suggestions (Same Salt)</p>
                    <div className="grid grid-cols-2 gap-2">
                      {substitutes.map((s, i) => (
                        <div key={i} className="bg-white p-2 rounded-lg text-[11px] shadow-sm">
                          <p className="font-bold text-gray-900">{s.name}</p>
                          <p className="text-gray-500 lowercase">{s.manufacturer}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors">
              <Scan size={24} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl flex items-center gap-2 text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <History size={18} />
              Recent
            </button>
          </div>
        </div>

        {/* Cart Table */}
        <div className="flex-1 overflow-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingCart size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">Cart is empty</p>
              <p className="text-sm">Start searching medicines to add to bill</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100">
                  <th className="text-left pb-4 font-medium">Medicine</th>
                  <th className="text-center pb-4 font-medium">Rate</th>
                  <th className="text-center pb-4 font-medium">Qty</th>
                  <th className="text-right pb-4 font-medium">Total</th>
                  <th className="w-10 pb-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-[10px] text-gray-500">Batch: {item.batchNumber} | Exp: {item.expiryDate}</p>
                    </td>
                    <td className="py-4 text-center">₹{item.saleRate}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-lg p-1 w-24 mx-auto">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-red-500 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-green-500 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-gray-900">
                      ₹{(item.saleRate * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-4 text-right">
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right side: Payment & Summary */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        {/* Customer Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-blue-600" size={20} />
            Customer Info
          </h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Customer Name"
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={customer.name}
              onChange={(e) => setCustomer({...customer, name: e.target.value})}
            />
            <input 
              type="tel" 
              placeholder="Mobile Number"
              className="w-full px-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={customer.phone}
              onChange={(e) => setCustomer({...customer, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Payment & Totals */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h3>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST Total</span>
              <span>₹{gst.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Total Payable</span>
              <span className="text-2xl font-black text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { id: 'Cash', icon: <IndianRupee size={18} /> },
              { id: 'UPI', icon: <Smartphone size={18} /> },
              { id: 'Card', icon: <CreditCard size={18} /> },
              { id: 'Credit', icon: <AlertCircle size={18} /> }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPaymentMode(mode.id)}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl font-medium transition-all ${
                  paymentMode === mode.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {mode.icon}
                {mode.id}
              </button>
            ))}
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isProcessing}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-auto shadow-xl shadow-blue-100"
          >
            {isProcessing ? (
              <History className="animate-spin" />
            ) : (
              <>
                <Printer size={20} />
                <span>Print Invoice (F4)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
