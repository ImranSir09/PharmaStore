import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Medicine {
  name: string;
  salt: string;
  company: string;
  category: string;
  minStockLevel: number;
  hsnCode?: string;
}

export interface Batch {
  batchNumber: string;
  medicineId: string;
  medicineName: string;
  expiryDate: string;
  purchaseRate: number;
  saleRate: number;
  mrp: number;
  currentStock: number;
  gstPercentage: number;
}

export const inventoryService = {
  async addMedicine(data: Medicine) {
    const docRef = await addDoc(collection(db, 'medicines'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async addBatch(data: Batch) {
    // We check if medicine exists
    const medRef = doc(db, 'medicines', data.medicineId);
    const medSnap = await getDoc(medRef);
    if (!medSnap.exists()) {
      throw new Error('Medicine not found');
    }

    const docRef = await addDoc(collection(db, 'batches'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...data };
  },

  async recordPurchase(batchData: Batch) {
    // Professional way: record in purchases collection and update/create batch
    await runTransaction(db, async (transaction) => {
      // 1. Record purchase
      const purchaseRef = doc(collection(db, 'purchases'));
      transaction.set(purchaseRef, {
        ...batchData,
        date: new Date().toISOString(),
        type: 'PURCHASE'
      });

      // 2. Check if this batch already exists for this medicine
      const batchesRef = collection(db, 'batches');
      const q = query(
        batchesRef, 
        where('medicineId', '==', batchData.medicineId),
        where('batchNumber', '==', batchData.batchNumber)
      );
      const snap = await getDocs(q);

      if (!snap.empty) {
        // Update existing batch
        const existingBatchId = snap.docs[0].id;
        const existingRef = doc(db, 'batches', existingBatchId);
        const existingData = snap.docs[0].data();
        transaction.update(existingRef, {
          currentStock: existingData.currentStock + batchData.currentStock,
          purchaseRate: batchData.purchaseRate,
          saleRate: batchData.saleRate,
          mrp: batchData.mrp,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new batch
        const newBatchRef = doc(collection(db, 'batches'));
        transaction.set(newBatchRef, {
          ...batchData,
          createdAt: new Date().toISOString()
        });
      }
    });
  }
};
