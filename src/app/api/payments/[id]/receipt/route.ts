import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReceiptPDF } from "@/lib/services/pdfService";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { member: true }
    });

    if (!payment) {
      return new NextResponse("Pago no encontrado", { status: 404 });
    }

    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = months[payment.monthPaid - 1] || payment.monthPaid;

    const pdfBuffer = await generateReceiptPDF({
      memberName: payment.member.fullName,
      amount: payment.amount,
      date: payment.date.toLocaleDateString('es-UY'),
      concept: `Cuota Mensual - ${monthName} ${payment.yearPaid}`,
      receiptNumber: payment.id.substring(0, 8).toUpperCase()
    });

    return new NextResponse(pdfBuffer as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=recibo-${payment.member.fullName.replace(/\s+/g, '-')}-${monthName}-${payment.yearPaid}.pdf`
      }
    });
  } catch (error) {
    console.error("Error generating receipt:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}
