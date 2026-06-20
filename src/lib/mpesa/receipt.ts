import { jsPDF } from 'jspdf';

export function generateReceiptPDF(payment: any) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Smart-Rent KE Receipt', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Receipt Number: ${payment.payhero_reference || payment.id}`, 20, 40);
  doc.text(`Date: ${new Date(payment.paid_at || payment.created_at).toLocaleDateString()}`, 20, 50);
  
  doc.text('--------------------------------------------------', 20, 60);
  
  doc.text(`Tenant: ${payment.lease?.tenant_profile?.name || 'N/A'}`, 20, 70);
  doc.text(`Unit: ${payment.lease?.unit?.unit_number || 'N/A'}`, 20, 80);
  doc.text(`Property: ${payment.lease?.unit?.property?.name || 'N/A'}`, 20, 90);
  
  doc.text('--------------------------------------------------', 20, 100);
  
  doc.text(`Rent Amount: KES ${Number(payment.amount) - Number(payment.service_fee) - Number(payment.sadaqah_penalty || 0)}`, 20, 110);
  doc.text(`Service Fee: KES ${payment.service_fee}`, 20, 120);
  if (payment.sadaqah_penalty) {
    doc.text(`Late Penalty (Sadaqah): KES ${payment.sadaqah_penalty}`, 20, 130);
  }
  
  doc.setFontSize(14);
  doc.text(`Total Paid: KES ${payment.amount}`, 20, 150);
  
  doc.setFontSize(10);
  doc.text('Thank you for choosing Smart-Rent KE', 105, 180, { align: 'center' });
  
  return doc.output('arraybuffer');
}
