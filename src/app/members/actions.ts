'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Status } from "@prisma/client"

export async function getMembers() {
  return await prisma.member.findMany({
    orderBy: { fullName: 'asc' }
  })
}

export async function createMember(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const memberNumber = formData.get("memberNumber") as string
    const position = formData.get("position") as any
    const imageUrl = formData.get("imageUrl") as string
    
    if (!fullName) return { error: "El nombre completo es requerido" }

    const member = await (prisma.member as any).create({
      data: {
        fullName,
        memberNumber: memberNumber || null,
        email: email || null,
        phone: phone || null,
        position: position || "DISCIPULO",
        imageUrl: imageUrl || null,
        status: "ACTIVE"
      }
    })
    
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
