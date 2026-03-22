const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create the Admin User
    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        name: 'Administrador Principal',
        role: 'ADMIN',
        email: 'admin@logia.com'
      }
    });
    
    // Optional: Create a corresponding Config record if it was wiped
    await prisma.config.upsert({
      where: { id: 'system-config' },
      update: {},
      create: {
        id: 'system-config',
        monthsForDebt: 3,
        baseCurrency: 'UYU',
        monthlyFeeAmount: 500,
        monthlyFeeCurrency: 'UYU'
      }
    });

    console.log('--------------------------------------------------');
    console.log('RESTAURACIÓN EXITOSA');
    console.log(`Usuario: admin`);
    console.log(`Contraseña: admin123`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('ERROR DURANTE LA RESTAURACIÓN:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
