const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_name = 'CashCount'`;
    console.log('Columns:', columns);
    const hasStatus = columns.some(c => c.column_name === 'status');
    if (hasStatus) {
      console.log('Success: status column exists');
    } else {
      console.log('Error: status column DOES NOT exist');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
