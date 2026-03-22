const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const hash = await bcrypt.hash('michelin.91', 10)
  
  const user = await prisma.user.upsert({
    where: { username: 'michel' },
    update: { 
      password: hash,
      role: 'ADMIN'
    },
    create: {
      username: 'michel',
      password: hash,
      name: 'Michel',
      role: 'ADMIN'
    }
  })
  
  console.log('User seeded:', user.username)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
