import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({})

async function main() {
  const landlord = await prisma.landlord.upsert({
    where: { email: 'admin@smartrent.ke' },
    update: {},
    create: {
      name: 'Main Admin',
      email: 'admin@smartrent.ke',
      phone: '254700000000',
    },
  })
  console.log({ landlord })
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
