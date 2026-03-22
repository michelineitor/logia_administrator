'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Currency } from "@prisma/client"

export async function getConfig() {
  let config = await (prisma.config as any).findUnique({ where: { id: 'system-config' } });
  if (!config) {
    config = await (prisma.config as any).create({
      data: { id: 'system-config' }
    });
  }
  return config;
}

export async function updateConfig(formData: FormData) {
  try {
    const monthsForDebt = parseInt(formData.get("monthsForDebt") as string) || 3;
    const baseCurrency = (formData.get("baseCurrency") as Currency) || 'UYU';
    const monthlyFeeAmount = parseFloat(formData.get("monthlyFeeAmount") as string) || 500;
    const monthlyFeeCurrency = (formData.get("monthlyFeeCurrency") as Currency) || 'UYU';
    const telegramBotToken = formData.get("telegramBotToken") as string;
    const telegramChatId = formData.get("telegramChatId") as string;

    await (prisma.config as any).upsert({
      where: { id: 'system-config' },
      update: {
        monthsForDebt,
        baseCurrency,
        monthlyFeeAmount,
        monthlyFeeCurrency,
        telegramBotToken,
        telegramChatId
      },
      create: {
        id: 'system-config',
        monthsForDebt,
        baseCurrency,
        monthlyFeeAmount,
        monthlyFeeCurrency,
        telegramBotToken,
        telegramChatId
      }
    });

    revalidatePath('/settings');
  } catch (err: any) {
    console.error(err);
  }
}
