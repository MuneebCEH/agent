
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Main Workspace',
    }
  })

  await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      workspaceId: workspace.id,
      permissions: JSON.stringify(['all'])
    }
  })

  console.log('Seed data created successfully!')
  console.log('Email: admin@gmail.com')
  console.log('Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
