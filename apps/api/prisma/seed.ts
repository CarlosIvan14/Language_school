import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@espanolpro.com'
  const password = process.env.ADMIN_PASSWORD ?? 'Admin123!'
  const fullName = process.env.ADMIN_NAME ?? 'Administrador'

  const hash = await bcrypt.hash(password, 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'admin', passwordHash: hash, fullName },
    create: {
      email,
      passwordHash: hash,
      fullName,
      role: 'admin',
      timezone: 'America/Mexico_City',
    },
  })

  console.log(`✓ Admin user ready: ${user.email} (role: ${user.role})`)
  console.log(`  Login: ${email} / ${password}`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
