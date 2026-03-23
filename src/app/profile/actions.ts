'use server'

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getProfileData(userId: string) {
  const user = await (prisma.user as any).findUnique({
    where: { id: userId },
    include: { member: { include: { payments: { orderBy: { date: 'desc' }, where: { status: { not: 'CANCELADO' } } } } } }
  });

  const config = await (prisma as any).config.findUnique({ where: { id: 'system-config' } });
  const fee = config?.monthlyFeeAmount || 500;
  const currency = config?.monthlyFeeCurrency || 'UYU';

  const { calculateMemberDebt } = await import("../../lib/services/debtService");
  
  let status = "AL DÍA";
  let debtCount = 0;
  let debtAmount = 0;

  if (user?.member && user.role !== 'ADMIN' && user.role !== ('GUEST' as any)) {
      const debtInfo = calculateMemberDebt(user.member, config);
      status = debtInfo.status;
      debtCount = debtInfo.debtCount;
      debtAmount = debtInfo.debtAmount;
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

export async function changePassword(formData: FormData, userId: string) {
  try {
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    const user = await (prisma.user as any).findUnique({ where: { id: userId } });
    if (!user || !user.password) return { error: "Usuario no encontrado" };

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) return { error: "La contraseña actual es incorrecta" };

    // Validation rules
    if (newPassword.length < 8) return { error: "La nueva contraseña debe tener al menos 8 caracteres" };
    if (!/[A-Z]/.test(newPassword)) return { error: "La nueva contraseña debe tener al menos una mayúscula" };
    if (!/[0-9]/.test(newPassword)) return { error: "La nueva contraseña debe tener al menos un número" };
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return { error: "La nueva contraseña debe tener al menos un símbolo" };

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await (prisma.user as any).update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}
