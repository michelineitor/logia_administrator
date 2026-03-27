import { jsPDF } from "jspdf";
import fs from 'fs';
import path from 'path';

export interface ReceiptData {
  memberName: string;
  amount: number;
  currency: string;
  date: string;
  concept: string;
  receiptNumber: string;
  paymentId: string;
}

export async function generateReceiptPDF(data: ReceiptData): Promise<Buffer> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Load Logo from filesystem
  let yOffset = 10;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      doc.addImage(logoBase64, 'PNG', (pageWidth - 40) / 2, yOffset, 40, 40);
      yOffset += 45;
    }
  } catch (err) {
    console.error("Error loading logo for PDF:", err);
    yOffset += 10;
  }

  // Lodge Name & Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 30, 50);
  doc.text("Soles y Rayos de Oriente No.7", pageWidth / 2, yOffset, { align: "center" });
  
  yOffset += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Logia Masónica - Gestión Administrativa", pageWidth / 2, yOffset, { align: "center" });

  yOffset += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yOffset, pageWidth - 20, yOffset);
  
  yOffset += 12;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("RECIBO DE PAGO", pageWidth / 2, yOffset, { align: "center" });
  
  yOffset += 7;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`ID Interno: ${data.paymentId}`, pageWidth / 2, yOffset, { align: "center" });

  yOffset += 13;
  doc.line(20, yOffset, pageWidth - 20, yOffset);

  // Body Content
  let contentY = yOffset + 20;
  const labelX = 30;
  const valueX = 85;

  const addField = (label: string, value: string, isBoldValue = false) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, labelX, contentY);
    doc.setFont("helvetica", isBoldValue ? "bold" : "normal");
    doc.text(value, valueX, contentY);
    contentY += 12;
  };

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  addField("Hermano:", data.memberName);
  addField("Suma de:", `${data.currency === 'USD' ? 'USD $' : '$'}${data.amount.toLocaleString()}`, true);
  addField("Concepto:", data.concept);
  addField("Fecha Registro:", data.date);
  addField("Nº Recibo:", data.receiptNumber);

  // Signature Section
  const footerY = 220;
  doc.setDrawColor(180, 180, 180);
  doc.line(pageWidth / 2 - 35, footerY, pageWidth / 2 + 35, footerY);
  doc.setFontSize(9);
  doc.text("Firma del Tesorero", pageWidth / 2, footerY + 6, { align: "center" });

  // Page Footer
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text("Socio - Caridad - Unión", pageWidth / 2, 280, { align: "center" });
  
  const now = new Date();
  doc.text(`Generado el ${now.toLocaleDateString()} a las ${now.toLocaleTimeString()}`, pageWidth / 2, 285, { align: "center" });

  return Buffer.from(doc.output('arraybuffer'));
}
