'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { IncomeType, ExpenseCategory, Currency, PaymentMethod } from "@prisma/client"

import { promises as fs } from 'fs';
import path from 'path';

export async function getTransactions() {
  const incomes = await prisma.income.findMany({ orderBy: { date: 'desc' } });
  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });
  
  const formattedIncomes = incomes.map((inc: any) => ({
    id: `inc-${inc.id}`,
    originalId: inc.id,
    type: 'INCOME' as const,
    category: inc.type,
    amount: inc.amount,
    currency: inc.currency,
    date: inc.date,
    comment: inc.comment,
    method: inc.method,
    imageProofUrl: inc.imageProofUrl
  }));

  const formattedExpenses = expenses.map((exp: any) => ({
    id: `exp-${exp.id}`,
    originalId: exp.id,
    type: 'EXPENSE' as const,
    category: exp.category,
    amount: exp.amount,
    currency: exp.currency,
    date: exp.date,
    comment: exp.comment,
    method: exp.method,
    imageProofUrl: exp.imageProofUrl
  }));

  const all = [...formattedIncomes, ...formattedExpenses].sort((a, b) => b.date.getTime() - a.date.getTime());
  return all;
}

async function handleFileUpload(formData: FormData): Promise<string> {
  const file = formData.get("imageProof") as File;
  if (!file || file.size === 0) {
    throw new Error("El comprobante (foto) es obligatorio");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, fileName), buffer);
  
  return `/uploads/${fileName}`;
}

function parseDate(formData: FormData): Date {
  const dateStr = formData.get("date") as string;
  if (dateStr) {
    return new Date(`${dateStr}T12:00:00Z`);
  }
  return new Date();
}

export async function createIncome(formData: FormData) {
  try {
    const photoUrl = await handleFileUpload(formData);
    const parsedDate = parseDate(formData);

    await prisma.income.create({
      data: {
        date: parsedDate,
        amount: parseFloat(formData.get("amount") as string),
        currency: (formData.get("currency") as Currency) || "UYU",
        type: formData.get("type") as IncomeType,
        method: (formData.get("method") as PaymentMethod) || "CASH",
        comment: (formData.get("comment") as string) || null,
        imageProofUrl: photoUrl,
      }
    });
    revalidatePath('/treasury');
    return { success: true };
  } catch(e: any) {
    return { error: e.message || "Error al guardar el ingreso" };
  }
}

export async function createExpense(formData: FormData) {
  try {
    const photoUrl = await handleFileUpload(formData);
    const parsedDate = parseDate(formData);

    await prisma.expense.create({
      data: {
        date: parsedDate,
        amount: parseFloat(formData.get("amount") as string),
        currency: (formData.get("currency") as Currency) || "UYU",
        category: formData.get("category") as ExpenseCategory,
        method: (formData.get("method") as PaymentMethod) || "CASH",
        comment: (formData.get("comment") as string) || null,
        imageProofUrl: photoUrl,
      }
    });
    revalidatePath('/treasury');
    return { success: true };
  } catch(e: any) {
    return { error: e.message || "Error al guardar el gasto" };
  }
}
export async function createLodgeSession(formData: FormData) {
  try {
    const photoUrl = await handleFileUpload(formData);
    const parsedDate = parseDate(formData);
    const observations = formData.get("observations") as string;

    const sessionIncomes = [
      { 
        amount: formData.get("sacoAmount") ? parseFloat(formData.get("sacoAmount") as string) : 0, 
        currency: (formData.get("sacoCurrency") as Currency) || "UYU",
        type: "COLECTAS_SACO_BENEFICO" as IncomeType,
        comment: "Colecta de Saco Benéfico"
      },
      { 
        amount: formData.get("donativoAmount") ? parseFloat(formData.get("donativoAmount") as string) : 0, 
        currency: (formData.get("donativoCurrency") as Currency) || "UYU",
        type: "DONATIVOS_RECIBIDOS" as IncomeType,
        comment: "Donativos Recibidos en Sesión"
      },
      { 
        amount: formData.get("iniciacionAmount") ? parseFloat(formData.get("iniciacionAmount") as string) : 0, 
        currency: (formData.get("iniciacionCurrency") as Currency) || "UYU",
        type: "INICIACIONES_AFILIACIONES" as IncomeType,
        comment: "Iniciaciones/Afiliaciones en Sesión"
      },
      { 
        amount: formData.get("otrosAmount") ? parseFloat(formData.get("otrosAmount") as string) : 0, 
        currency: (formData.get("otrosCurrency") as Currency) || "UYU",
        type: "INGRESOS_EVENTUALES" as IncomeType,
        comment: (formData.get("otrosComment") as string) || "Otros ingresos de sesión"
      }
    ].filter(item => item.amount > 0);

    if (sessionIncomes.length === 0) {
      throw new Error("Debe ingresar al menos un monto para registrar la sesión");
    }

    await prisma.$transaction(async (tx) => {
      const session = await tx.lodgeSession.create({
        data: {
          date: parsedDate,
          observations: observations || null,
        }
      });

      for (const inc of sessionIncomes) {
        await tx.income.create({
          data: {
            date: parsedDate,
            amount: inc.amount,
            currency: inc.currency,
            type: inc.type,
            method: "CASH", // Typically sessions are in cash
            comment: inc.comment,
            imageProofUrl: photoUrl,
            sessionId: session.id,
          }
        });
      }
    });

    revalidatePath('/treasury');
    return { success: true };
  } catch(e: any) {
    return { error: e.message || "Error al registrar la sesión" };
  }
}
