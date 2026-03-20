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
    
    if (!fullName) return { error: "El nombre completo es requerido" }

    const member = await prisma.member.create({
      data: {
        fullName,
        email: email || null,
        phone: phone || null,
        status: "ACTIVE"
      }
    })
    
    revalidatePath('/members')
    return { success: true, member }
  } catch (err: any) {
    return { error: err.message || "Error al crear el miembro" }
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
