'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Status, MemberCategory, MemberPosition } from "@prisma/client"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function getMembers() {
  return await (prisma.member as any).findMany({
    include: { user: true },
    orderBy: { fullName: 'asc' }
  })
}

export async function getMemberById(id: string) {
  return await (prisma.member as any).findUnique({
    where: { id },
    include: { 
      payments: { orderBy: { date: 'desc' }, where: { status: { not: 'CANCELADO' } } },
      user: true
    }
  })
}

async function logHistory(memberId: string, field: string, oldValue: string | null, newValue: string | null) {
  if (oldValue === newValue) return;
  const session = await getServerSession(authOptions);
  const changedById = (session?.user as any)?.id;
  
  await (prisma as any).memberHistory.create({
    data: {
      memberId,
      field,
      oldValue,
      newValue,
      changedById
    }
  });
}

export async function createMember(formData: FormData) {
  try {
    const fullName = formData.get('fullName') as string;
    const memberNumber = formData.get('memberNumber') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const position = formData.get('position') as MemberPosition;
    const category = formData.get('category') as MemberCategory;
    const status = (formData.get('status') as Status) || 'ACTIVE';
    const imageUrl = formData.get('imageUrl') as string;
    const createAccount = formData.get('createAccount') === 'on';
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const relevantData = formData.get('relevantData') as string;

    let userId: string | undefined;

    if (createAccount && username && password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      let role: any = 'MEMBER';
      if (position.includes('TESORERO')) role = 'TESORERO';
      if (position === 'LUMINAR') role = 'LUMINAR';
      if (position === 'ADMIN' as any) role = 'ADMIN';

      const user = await (prisma.user as any).create({
        data: {
          username,
          password: hashedPassword,
          name: fullName,
          email: email || null,
          role: role
        }
      });
      userId = user.id;
    }

    const member = await (prisma.member as any).create({
      data: {
        fullName,
        memberNumber,
        phone,
        email,
        position: position || 'MIEMBRO',
        category: category || 'DISCIPULO',
        relevantData: relevantData || null,
        imageUrl: imageUrl || null,
        entryDate: new Date(),
        status,
        userId: userId || null
      }
    });

    // Update QR code with the internal link
    // We'll use a standard URL pattern /members/[id]
    await (prisma.member as any).update({
      where: { id: member.id },
      data: { qrCodeUrl: `/members/${member.id}` }
    });
    
    revalidatePath('/members')
    return { success: true, member }
  } catch (err: any) {
    if (err.code === 'P2002') return { error: "Ese número de miembro ya está en uso." }
    return { error: err.message || "Error al crear el miembro" }
  }
}

export async function updateMember(id: string, formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const memberNumber = formData.get("memberNumber") as string
    const position = formData.get("position") as MemberPosition
    const category = formData.get("category") as MemberCategory
    const status = formData.get("status") as Status
    const relevantData = formData.get("relevantData") as string
    const imageUrl = formData.get("imageUrl") as string
    
    // Get current state for history
    const oldMember = await (prisma.member as any).findUnique({ where: { id } });
    if (oldMember) {
      if (position) await logHistory(id, 'position', oldMember.position, position);
      if (category) await logHistory(id, 'category', oldMember.category, category);
      if (status) await logHistory(id, 'status', oldMember.status, status);
      if (relevantData) await logHistory(id, 'relevantData', oldMember.relevantData, relevantData);
    }

    const member = await (prisma.member as any).update({
      where: { id },
      data: {
        fullName,
        memberNumber: memberNumber || null,
        email: email || null,
        phone: phone || null,
        position: position || undefined,
        category: category || undefined,
        status: status || undefined,
        relevantData: relevantData || null,
        imageUrl: imageUrl || null
      }
    })
    
    revalidatePath('/members')
    return { success: true, member }
  } catch (err: any) {
    if (err.code === 'P2002') return { error: "Ese número de miembro ya está en uso." }
    return { error: "Error actualizando el miembro" }
  }
}

export async function deleteMember(id: string) {
  try {
    await (prisma.member as any).delete({ where: { id } });
    revalidatePath('/members');
    return { success: true };
  } catch (err: any) {
    return { error: "Error eliminando el miembro" };
  }
}

export async function updateMemberStatus(id: string, status: Status) {
  try {
    const oldMember = await (prisma.member as any).findUnique({ where: { id } });
    if (oldMember) {
      await logHistory(id, 'status', oldMember.status, status);
    }

    const member = await (prisma.member as any).update({
      where: { id },
      data: { status }
    })
    
    revalidatePath('/members')
    return { success: true, member }
  } catch (err: any) {
    return { error: "Error actualizando el estado" }
  }
}
