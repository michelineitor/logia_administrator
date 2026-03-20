import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const members = await prisma.member.findMany({
    orderBy: { fullName: 'asc' },
    include: { payments: true }
  });
  return NextResponse.json(members);
}

export async function POST(req: Request) {
  const data = await req.json();
  const member = await prisma.member.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      status: data.status || 'ACTIVE',
      entryDate: data.entryDate ? new Date(data.entryDate) : new Date(),
    }
  });
  return NextResponse.json(member);
}
