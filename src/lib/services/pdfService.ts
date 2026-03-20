import { jsPDF } from "jspdf";

export interface ReceiptData {
  memberName: string;
  amount: number;
  date: string;
  concept: string;
  receiptNumber: string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const doc = new jsPDF();

  // Premium Header
  doc.setFillColor(10, 14, 20); // Dark background
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(197, 160, 89); // Gold
  doc.setFontSize(22);
  doc.text("Soles y Rayos de Oriente No.7", 105, 20, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("RECIBO OFICIAL DE TESORERÍA", 105, 30, { align: "center" });

  // Body
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Recibo No: ${data.receiptNumber}`, 20, 60);
  doc.text(`Fecha: ${data.date}`, 150, 60);
  
  doc.line(20, 70, 190, 70);
  
  doc.text("He recibido de:", 20, 85);
  doc.setFont("helvetica", "bold");
  doc.text(data.memberName, 60, 85);
  
  doc.setFont("helvetica", "normal");
  doc.text("La cantidad de:", 20, 100);
  doc.setFont("helvetica", "bold");
  doc.text(`$${data.amount.toLocaleString()} DOP`, 60, 100);
  
  doc.setFont("helvetica", "normal");
  doc.text("Por concepto de:", 20, 115);
  doc.text(data.concept, 60, 115);

  // Footer
  doc.line(60, 160, 150, 160);
  doc.text("Firma del Tesorero", 105, 170, { align: "center" });
  
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Socio - Caridad - Unión", 105, 280, { align: "center" });

  return Buffer.from(doc.output('arraybuffer'));
}
