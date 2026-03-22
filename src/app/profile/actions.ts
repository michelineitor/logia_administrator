'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProfileData(userId: string) {
  const user = await (prisma.user as any).findUnique({
    where: { id: userId },
    include: { member: { include: { payments: { orderBy: { date: 'desc' }, where: { status: { not: 'CANCELADO' } } } } } }
  });

  const config = await (prisma as any).config.findUnique({ where: { id: 'system-config' } });
  const fee = config?.monthlyFeeAmount || 500;
  const currency = config?.monthlyFeeCurrency || 'UYU';

  let status = "AL DÍA";
  let debtCount = 0;
  let debtAmount = 0;

  if (user?.member && user.role !== 'ADMIN' && user.role !== ('GUEST' as any)) {
     const member = user.member as any;
     const entryDate = new Date(member.entryDate);
     const now = new Date();
     
     let monthsExpected = (now.getFullYear() - entryDate.getFullYear()) * 12 + (now.getMonth() - entryDate.getMonth()) + 1;
     if (monthsExpected < 1) monthsExpected = 1;

     const paymentsMade = member.payments.length;
     debtCount = monthsExpected - paymentsMade;
     if (debtCount < 0) debtCount = 0;

     if (debtCount > 0) {
       status = "DEUDA";
       debtAmount = debtCount * fee;
     }
  }

  return { user, config, status, debtCount, debtAmount, fee, currency };
}

export async function updateProfileData(formData: FormData, userId: string) {
  try {
    const email = formData.get("email") as string;
    const username = formData.get("username") as string;
    
    await (prisma.user as any).update({
      where: { id: userId },
      data: { email, username }
    });

    const memberId = formData.get("memberId") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;

    if (memberId) {
      await (prisma.member as any).update({
        where: { id: memberId },
        data: { email, fullName, phone: phone || undefined }
      });
    }
    
    revalidatePath('/profile');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
