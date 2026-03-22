const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const uCount = await prisma.user.count();
    const mCount = await prisma.member.count();
    const pCount = await prisma.payment.count();
    console.log(`DATA_SNAPSHOT: Users=${uCount}, Members=${mCount}, Payments=${pCount}`);
    
    if (uCount > 0) {
      const users = await prisma.user.findMany({ select: { username: true, role: true }, take: 5 });
      console.log('Sample Users:', JSON.stringify(users));
    } else {
      console.log('WARNING: User table is EMPTY!');
    }
  } catch (err) {
    console.error('PRISMA_ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
