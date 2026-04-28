import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

export interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerPhone?: string;
  date: string;
  paymentMode: string;
  items: Array<{
    name: string;
    batchNumber: string;
    expiryDate: string;
    saleRate: number;
    quantity: number;
    gstPercentage: number;
    total: number;
  }>;
  subtotal: number;
  gstAmount: number;
  totalAmount: number;
}

export const generateInvoicePDF = (data: InvoiceData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Professional Header
  doc.setFillColor(37, 99, 235); // Brand Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('PHARMASTORE ERP', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('GSTIN: 27AABCU1234F1Z5', 20, 32);
  doc.text('123 Medical Street, City, State - 400001', pageWidth - 20, 25, { align: 'right' });
  doc.text('Mob: +91 98765 43210', pageWidth - 20, 32, { align: 'right' });

  // Bill To Info
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO:', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(data.customerName.toUpperCase(), 20, 62);
  if (data.customerPhone) {
    doc.text(`Mob: ${data.customerPhone}`, 20, 67);
  }

  // Invoice Details
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE NO:', pageWidth - 80, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(data.invoiceNumber, pageWidth - 20, 55, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('DATE:', pageWidth - 80, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(data.date), 'dd MMM yyyy, HH:mm'), pageWidth - 20, 62, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT MODE:', pageWidth - 80, 69);
  doc.setFont('helvetica', 'normal');
  doc.text(data.paymentMode.toUpperCase(), pageWidth - 20, 69, { align: 'right' });

  // Items Table
  const tableData = data.items.map((item, index) => [
    index + 1,
    item.name,
    item.batchNumber,
    item.expiryDate,
    item.saleRate.toFixed(2),
    item.quantity,
    item.gstPercentage + '%',
    item.total.toFixed(2)
  ]);

  autoTable(doc, {
    startY: 80,
    head: [['#', 'Item Description', 'Batch', 'Exp.', 'Rate', 'Qty', 'GST', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 'auto' },
      5: { halign: 'center' },
      7: { halign: 'right', fontStyle: 'bold' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Summary
  const summaryX = pageWidth - 70;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`₹${data.subtotal.toFixed(2)}`, pageWidth - 20, finalY, { align: 'right' });
  
  doc.text('GST Amount:', summaryX, finalY + 7);
  doc.text(`₹${data.gstAmount.toFixed(2)}`, pageWidth - 20, finalY + 7, { align: 'right' });
  
  doc.setDrawColor(200);
  doc.line(summaryX, finalY + 11, pageWidth - 20, finalY + 11);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total:', summaryX, finalY + 18);
  doc.text(`₹${data.totalAmount.toFixed(2)}`, pageWidth - 20, finalY + 18, { align: 'right' });

  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('This is a computer generated invoice and does not require signature.', pageWidth / 2, pageWidth > 200 ? 280 : 270, { align: 'center' });
  doc.text('Terms: No return after 7 days of purchase. Only sealed packs accepted.', pageWidth / 2, pageWidth > 200 ? 285 : 275, { align: 'center' });

  // Trigger download
  doc.save(`${data.invoiceNumber}.pdf`);
};
