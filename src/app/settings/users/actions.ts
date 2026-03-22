'use server'

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import bcrypt from "bcryptjs"

export async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      role: true,
    },
    orderBy: {
      name: 'asc'
    }
  });
  return users;
}

export async function createUser(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as Role;

    if (!username || !password || !role) {
      return { error: "Username, contraseña y rol son requeridos" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role,
      }
    });

    revalidatePath('/settings/users');
    return { success: true };
  } catch (e: any) {
    if (e.code === 'P2002') {
      return { error: "El nombre de usuario o email ya existe" };
    }
    return { error: e.message || "Error al crear el usuario" };
  }
}
