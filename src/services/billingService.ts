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
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface CartItem {
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

export interface SaleData {
  customerName: string;
  customerPhone?: string;
  paymentMode: string;
  items: CartItem[];
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

export const billingService = {
  async searchBatches(term: string) {
    if (!term) return [];
    
    // In a real app, you might want to search by medicine name too
    // For now, we search all active batches and filter locally if needed
    const q = query(
      collection(db, 'batches'),
      where('currentStock', '>', 0),
      limit(20)
    );
    const snap = await getDocs(q);
    const results: any[] = [];
    snap.forEach(doc => {
      const data = doc.data();
      // Simple term matching on medicine name or batch
      if (
        data.medicineName?.toUpperCase().includes(term.toUpperCase()) || 
        data.batchNumber?.toUpperCase().includes(term.toUpperCase())
      ) {
        results.push({ id: doc.id, ...data });
      }
    });
    return results;
  },

  async processCheckout(data: SaleData) {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    // We use a transaction for stock safety
    await runTransaction(db, async (transaction) => {
      // 1. Verify stock for all items
      for (const item of data.items) {
        const batchRef = doc(db, 'batches', item.id);
        const batchDoc = await transaction.get(batchRef);
        
        if (!batchDoc.exists()) {
          throw new Error(`Batch ${item.batchNumber} no longer exists.`);
        }
        
        const currentStock = batchDoc.data().currentStock;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}`);
        }
      }

      // 2. Update stock
      for (const item of data.items) {
        const batchRef = doc(db, 'batches', item.id);
        transaction.update(batchRef, {
          currentStock: increment(-item.quantity)
        });
      }

      // 3. Create sale record
      const saleRef = doc(collection(db, 'sales'));
      transaction.set(saleRef, {
        ...data,
        invoiceNumber,
        createdAt: new Date().toISOString(),
        pharmacistId: 'admin' // Hardcoded for now as per instructions to remove login
      });
    });

    return { success: true, invoiceNumber };
  }
};
