'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
// @ts-ignore - Ignore type error if client isn't fully generated yet
import { PaymentStatus, Currency, PaymentMethod } from "@prisma/client"

export async function getPayments() {
  return await prisma.payment.findMany({
    orderBy: { date: 'desc' },
    include: { member: true }
  })
}

export async function createPayment(formData: FormData) {
  try {
    const memberId = formData.get("memberId") as string
    const totalAmount = parseFloat(formData.get("amount") as string)
    const numCuotas = parseInt(formData.get("numCuotas") as string) || 1
    const currency = (formData.get("currency") as Currency) || "UYU"
    
    const dateStr = formData.get("date") as string
    const parsedDate = dateStr ? new Date(`${dateStr}T12:00:00Z`) : new Date()

    const method = (formData.get("method") as PaymentMethod) || "CASH"

    if (!memberId || isNaN(totalAmount) || isNaN(numCuotas)) {
        return { error: "Campos requeridos faltantes o inválidos" }
    }

    // Find the last payment to determine the next months to pay
    const lastPayment = await prisma.payment.findFirst({
      where: { memberId, status: { not: "CANCELADO" as any } },
      orderBy: [
        { yearPaid: 'desc' },
        { monthPaid: 'desc' }
      ]
    })

    let startMonth, startYear;
    if (lastPayment) {
      startMonth = lastPayment.monthPaid + 1;
      startYear = lastPayment.yearPaid;
      if (startMonth > 12) {
        startMonth = 1;
        startYear++;
      }
    } else {
      const member = await prisma.member.findUnique({ where: { id: memberId } });
      const entryDate = member?.entryDate ? new Date(member.entryDate) : new Date('2026-01-01T12:00:00Z');
      
      const referenceDate = new Date('2026-01-01T00:00:00Z');
      const finalEntryDate = entryDate < referenceDate ? referenceDate : entryDate;

      startMonth = finalEntryDate.getUTCMonth() + 1;
      startYear = finalEntryDate.getUTCFullYear();
    }

    const amountPerCuota = totalAmount / numCuotas;

    // Create each payment record
    for (let i = 0; i < numCuotas; i++) {
      await prisma.payment.create({
        data: {
          memberId,
          amount: amountPerCuota,
          currency,
          date: parsedDate,
          monthPaid: startMonth,
          yearPaid: startYear,
          method,
          // @ts-ignore
          status: "COMPLETADO"
        }
      });

      startMonth++;
      if (startMonth > 12) {
        startMonth = 1;
        startYear++;
      }
    }
    
    revalidatePath('/payments')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (err: any) {
    return { error: err.message || "Error al registrar el pago" }
  }
}

export async function updatePaymentStatus(id: string, status: PaymentStatus) {
  try {
    const payment = await prisma.payment.update({
      where: { id },
      // @ts-ignore
      data: { status }
    })
    
    revalidatePath('/payments')
    revalidatePath('/dashboard')
    return { success: true, payment }
  } catch (err: any) {
    return { error: "Error actualizando el estado del pago" }
  }
}
