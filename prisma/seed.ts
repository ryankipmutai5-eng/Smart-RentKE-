import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({})

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'main-tenant' },
    update: {},
    create: {
      name: 'Main Property Management',
      slug: 'main-tenant',
    },
  })
  
  console.log('Seed tenant created:', { id: tenant.id, name: tenant.name })
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
