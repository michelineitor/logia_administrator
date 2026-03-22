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
    const amount = parseFloat(formData.get("amount") as string)
    const currency = (formData.get("currency") as Currency) || "UYU"
    
    const dateStr = formData.get("date") as string
    const parsedDate = dateStr ? new Date(`${dateStr}T12:00:00Z`) : new Date()

    const monthPaid = parseInt(formData.get("monthPaid") as string)
    const yearPaid = parseInt(formData.get("yearPaid") as string)
    const method = (formData.get("method") as PaymentMethod) || "CASH"

    if (!memberId || isNaN(amount) || isNaN(monthPaid) || isNaN(yearPaid)) {
        return { error: "Campos requeridos faltantes o inválidos" }
    }

    const payment = await prisma.payment.create({
      data: {
        memberId,
        amount,
        currency,
        date: parsedDate,
        monthPaid,
        yearPaid,
        method,
        // @ts-ignore
        status: "COMPLETADO"
      }
    })
    
    revalidatePath('/payments')
    revalidatePath('/dashboard')
    return { success: true, payment }
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
