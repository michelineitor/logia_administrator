import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const data = await req.json();
  const { memberId, amount, monthPaid, yearPaid } = data;

  const payment = await prisma.payment.create({
    data: {
      memberId,
      amount: parseFloat(amount),
      monthPaid,
      yearPaid,
    }
  });

  // TODO: Trigger PDF generation
  // TODO: Send to Telegram

  return NextResponse.json({
    success: true,
    payment,
    message: "Pago registrado correctamente"
  });
}
