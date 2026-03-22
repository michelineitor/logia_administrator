'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Status } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function getMembers() {
  return await (prisma.member as any).findMany({
    include: { user: true },
    orderBy: { fullName: 'asc' }
  })
}

export async function createMember(formData: FormData) {
  try {
    const fullName = formData.get('fullName') as string;
    const memberNumber = formData.get('memberNumber') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const position = formData.get('position') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const createAccount = formData.get('createAccount') === 'on';
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    let userId: string | undefined;

    if (createAccount && username && password) {
      // HASH THE PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10);

      // Map position to Role
      let role: any = 'MEMBER';
      if (position.includes('TESORERO')) role = 'TESORERO';
      if (position === 'LUMINAR') role = 'LUMINAR';
      if (position === 'ADMIN') role = 'ADMIN';

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
        position,
        imageUrl: imageUrl || null,
        entryDate: new Date(),
        status: 'ACTIVE',
        userId: userId || null
      }
    });revalidatePath('/members')
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
    const position = formData.get("position") as any
    const imageUrl = formData.get("imageUrl") as string
    
    const member = await (prisma.member as any).update({
      where: { id },
      data: {
        fullName,
        memberNumber: memberNumber || null,
        email: email || null,
        phone: phone || null,
        position: position || undefined,
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

export async function updateMemberStatus(id: string, status: Status) {
  try {
    const member = await prisma.member.update({
      where: { id },
      data: { status }
    })
    
    revalidatePath('/members')
    return { success: true, member }
  } catch (err: any) {
    return { error: "Error actualizando el estado" }
  }
}
