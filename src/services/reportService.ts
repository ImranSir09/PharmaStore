import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const reportService = {
  async exportSalesReport(month: string) {
    try {
      const q = query(collection(db, 'sales'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const sales: any[] = [];
      snap.forEach(doc => sales.push({ id: doc.id, ...doc.data() }));

      // PDF Export
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text('Sales Report - PharmaStore ERP', 20, 20);
      doc.setFontSize(10);
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy')}`, 20, 28);

      const tableData = sales.map(s => [
        s.invoiceNumber,
        format(new Date(s.createdAt), 'dd/MM/yyyy'),
        s.customerName,
        s.paymentMode,
        s.totalAmount.toFixed(2)
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Invoice', 'Date', 'Customer', 'Mode', 'Total (₹)']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 255] }
      });

      doc.save(`Sales_Report_${month.replace(' ', '_')}.pdf`);

      // Excel Export
      const worksheet = XLSX.utils.json_to_sheet(sales.map(s => ({
        Invoice: s.invoiceNumber,
        Date: format(new Date(s.createdAt), 'dd/MM/yyyy HH:mm'),
        Customer: s.customerName,
        Phone: s.customerPhone,
        Subtotal: s.subtotal,
        GST: s.gstAmount,
        Total: s.totalAmount,
        PaymentMode: s.paymentMode
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
      XLSX.writeFile(workbook, `Sales_Report_${month.replace(' ', '_')}.xlsx`);

      return true;
    } catch (error) {
      console.error('Export failed', error);
      throw error;
    }
  },

  async exportInventoryReport() {
    try {
      const medSnap = await getDocs(collection(db, 'medicines'));
      const batchSnap = await getDocs(collection(db, 'batches'));
      
      const inventory: any[] = [];
      batchSnap.forEach(bDoc => {
        const b = bDoc.data();
        const med = medSnap.docs.find(m => m.id === b.medicineId)?.data();
        inventory.push({
          Medicine: b.medicineName,
          Salt: med?.salt || '',
          Batch: b.batchNumber,
          Expiry: b.expiryDate,
          Stock: b.currentStock,
          MRP: b.mrp,
          PurchaseRate: b.purchaseRate,
          SaleRate: b.saleRate
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(inventory);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
      XLSX.writeFile(workbook, `Inventory_Status_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      
      return true;
    } catch (error) {
      console.error('Inventory export failed', error);
      throw error;
    }
  }
};
