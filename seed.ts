import { db } from './src/lib/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';

const sampleMedicines = [
  { name: 'Paracetamol 500mg', salt: 'Paracetamol', company: 'GlaxoSmithKline', category: 'Tablet', minStockLevel: 50, hsnCode: '3004' },
  { name: 'Amoxicillin 250mg', salt: 'Amoxicillin', company: 'Cipla', category: 'Capsule', minStockLevel: 20, hsnCode: '3004' },
  { name: 'CoughSyrup XL', salt: 'Dextromethorphan', company: 'Abbott', category: 'Syrup', minStockLevel: 15, hsnCode: '3004' },
  { name: 'Cetirizine 10mg', salt: 'Cetirizine', company: 'Dr. Reddy', category: 'Tablet', minStockLevel: 30, hsnCode: '3004' },
  { name: 'Insulin Pen', salt: 'Insulin', company: 'Novo Nordisk', category: 'Injection', minStockLevel: 5, hsnCode: '3004' }
];

const sampleBatches = [
  { batchNumber: 'B101', expiryDate: '2026-12-31', purchaseRate: 10, saleRate: 15, mrp: 18, currentStock: 100, gstPercentage: 12 },
  { batchNumber: 'B102', expiryDate: '2026-08-15', purchaseRate: 45, saleRate: 60, mrp: 75, currentStock: 8, gstPercentage: 12 },
  { batchNumber: 'EXP01', expiryDate: '2026-03-01', purchaseRate: 20, saleRate: 30, mrp: 35, currentStock: 25, gstPercentage: 12 }
];

export const seedDatabase = async () => {
  try {
    const medSnap = await getDocs(query(collection(db, 'medicines'), limit(1)));
    if (medSnap.size > 0) return; // Already seeded

    console.log('Seeding database with sample data...');

    for (const med of sampleMedicines) {
      const medDoc = await addDoc(collection(db, 'medicines'), {
        ...med,
        createdAt: new Date().toISOString()
      });

      // Add 2 batches for each medicine
      for (const batch of sampleBatches) {
        await addDoc(collection(db, 'batches'), {
          ...batch,
          medicineId: medDoc.id,
          medicineName: med.name,
          createdAt: new Date().toISOString()
        });
      }
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
