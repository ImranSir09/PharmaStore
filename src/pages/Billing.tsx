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
  History,
  Scan,
  ShoppingCart
} from 'lucide-react';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  increment,
  limit
} from 'firebase/firestore';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
        pharmacistId: 'admin',
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
    
    autoTable(doc, {
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
      <div className="flex-1 bg-white rounded-xl shadow-lg shadow-blue-900/5 border border-border-base flex flex-col min-w-0 overflow-hidden">
        <div className="p-6 border-b border-border-base flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
            <input 
              ref={searchInputRef}
              type="text" 
              placeholder="SEARCH MEDICINE (F2)" 
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-border-base rounded-xl focus:border-brand focus:ring-0 outline-none font-black text-xs tracking-widest transition-all"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value.toUpperCase());
                searchMedicines(e.target.value);
              }}
            />
            
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border-2 border-border-base z-50 overflow-hidden">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => addToCart(result)}
                    className="w-full px-5 py-4 text-left hover:bg-brand/5 flex justify-between items-center transition-all border-b border-border-base last:border-none cursor-pointer"
                  >
                    <div>
                      <p className="font-black text-text-primary text-sm tracking-tight">{result.medicineName?.toUpperCase() || 'PARACETAMOL 500MG'}</p>
                      <p className="text-[10px] font-bold text-text-secondary mt-1">BATCH: {result.batchNumber} | EXP: {result.expiryDate}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-right">
                        <p className="font-black text-brand text-lg tracking-tighter">₹{result.saleRate}</p>
                        <p className={`text-[9px] font-black tracking-widest uppercase ${result.currentStock < 10 ? 'text-error-primary' : 'text-success-primary'}`}>
                          STOCK: {result.currentStock}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button className="p-3 text-text-secondary hover:text-brand bg-white border border-border-base rounded-xl transition-all shadow-sm">
              <Scan size={20} />
            </button>
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="px-5 py-3 bg-white text-text-primary border border-border-base rounded-xl flex items-center gap-2 text-xs font-black tracking-widest hover:bg-brand/5 hover:text-brand transition-all shadow-sm"
            >
              <History size={16} />
              RECENT
            </button>
          </div>
        </div>

        {/* Cart Table */}
        <div className="flex-1 overflow-auto p-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary/40">
              <ShoppingCart size={80} className="mb-6 opacity-20" />
              <p className="text-xl font-black uppercase tracking-widest">Cart is empty</p>
              <p className="text-[10px] uppercase font-bold mt-2 tracking-tighter">Search medicines to start generating bill</p>
            </div>
          ) : (
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-text-secondary text-[10px] font-black tracking-widest uppercase">
                  <th className="text-left px-4 pb-2">Medicine Details</th>
                  <th className="text-center pb-2">Unit Rate</th>
                  <th className="text-center pb-2">Quantity</th>
                  <th className="text-right pb-2">Total amount</th>
                  <th className="w-12 pb-2"></th>
                </tr>
              </thead>
              <tbody className="">
                {cart.map((item) => (
                  <tr key={item.id} className="bg-white border border-border-base shadow-sm group">
                    <td className="py-4 px-4 rounded-l-xl border-y border-l border-border-base group-hover:border-brand/30 transition-colors">
                      <p className="font-black text-text-primary uppercase tracking-tight">{item.name}</p>
                      <p className="text-[9px] font-bold text-text-secondary mt-1 tracking-widest">BATCH: {item.batchNumber} | EXP: {item.expiryDate}</p>
                    </td>
                    <td className="py-4 text-center border-y border-border-base font-black text-text-primary group-hover:border-brand/30 transition-colors">₹{item.saleRate}</td>
                    <td className="py-4 border-y border-border-base group-hover:border-brand/30 transition-colors">
                      <div className="flex items-center justify-center gap-4 bg-surface-bg rounded-lg p-1.5 w-28 mx-auto border border-border-base shadow-inner">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 px-2 hover:bg-white rounded hover:text-error-primary hover:shadow-sm transition-all">
                          <Minus size={14} strokeWidth={3} />
                        </button>
                        <span className="font-black w-8 text-center text-xs">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 px-2 hover:bg-white rounded hover:text-success-primary hover:shadow-sm transition-all">
                          <Plus size={14} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-right border-y border-border-base font-black text-text-primary text-base tracking-tighter group-hover:border-brand/30 transition-colors">
                      ₹{(item.saleRate * item.quantity).toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right rounded-r-xl border-y border-r border-border-base group-hover:border-brand/30 transition-colors">
                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-text-secondary/30 hover:text-error-primary hover:bg-error-primary/5 rounded-lg transition-all">
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
        <div className="bg-white p-6 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base">
          <h3 className="text-xs font-black text-text-primary mb-6 flex items-center justify-between tracking-[0.2em] uppercase">
            Customer Information
            <User className="text-brand opacity-40" size={16} />
          </h3>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="NAME / CASH SALE"
              className="w-full px-4 py-3 bg-surface-bg border-2 border-transparent border-b-border-base rounded-lg focus:border-brand focus:ring-0 outline-none font-black text-[10px] tracking-widest placeholder:text-text-secondary/40 transition-all uppercase"
              value={customer.name}
              onChange={(e) => setCustomer({...customer, name: e.target.value.toUpperCase()})}
            />
            <input 
              type="tel" 
              placeholder="PHONE NUMBER"
              className="w-full px-4 py-3 bg-surface-bg border-2 border-transparent border-b-border-base rounded-lg focus:border-brand focus:ring-0 outline-none font-black text-[10px] tracking-widest placeholder:text-text-secondary/40 transition-all uppercase"
              value={customer.phone}
              onChange={(e) => setCustomer({...customer, phone: e.target.value})}
            />
          </div>
        </div>

        {/* Payment & Totals */}
        <div className="bg-white p-6 rounded-xl shadow-lg shadow-blue-900/5 border border-border-base flex-1 flex flex-col">
          <h3 className="text-xs font-black text-text-primary mb-8 tracking-[0.2em] uppercase">Bill summary</h3>
          
          <div className="space-y-4 mb-10">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-secondary">
              <span>Taxable amount</span>
              <span className="text-text-primary">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-secondary">
              <span>GST (SGST+CGST)</span>
              <span className="text-text-primary">₹{gst.toFixed(2)}</span>
            </div>
            <div className="pt-6 border-t border-border-base flex justify-between items-end">
              <div>
                <p className="text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1">Grant Total</p>
                <p className="text-xs font-bold text-brand uppercase">Incl. all taxes</p>
              </div>
              <span className="text-4xl font-black text-text-primary tracking-tighter">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-10">
            {[
              { id: 'Cash', icon: <IndianRupee size={16} /> },
              { id: 'UPI', icon: <Smartphone size={16} /> },
              { id: 'Card', icon: <CreditCard size={16} /> },
              { id: 'Credit', icon: <History size={16} /> }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setPaymentMode(mode.id)}
                className={`flex items-center justify-center gap-3 p-4 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all ${
                  paymentMode === mode.id 
                    ? 'bg-brand text-white shadow-xl shadow-brand/30 border-2 border-brand scale-[1.02]' 
                    : 'bg-white text-text-secondary hover:bg-surface-bg border-2 border-border-base'
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
            className="w-full py-5 bg-brand hover:bg-brand-700 text-white rounded-xl font-black text-xs tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-all disabled:opacity-50 mt-auto shadow-2xl shadow-brand/30 group"
          >
            {isProcessing ? (
              <History className="animate-spin" />
            ) : (
              <>
                <Printer size={18} className="group-hover:scale-110 transition-transform" />
                <span>Finalize & Print (F4)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
