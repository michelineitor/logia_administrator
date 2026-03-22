const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Probando conexión a la base de datos...');
    const user = await prisma.user.findFirst();
    console.log('CONEXION_OK. Primer usuario encontrado:', user ? user.username : 'Ninguno');
    if (user) {
      console.log('Sus datos básicos: ID=', user.id, 'Role=', user.role);
    }
  } catch (err) {
    console.error('PRISMA_ERROR:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
