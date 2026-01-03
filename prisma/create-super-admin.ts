import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createSuperAdmin() {
  console.log('Creating super admin user...')

  try {
    // Create super admin user
    const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 12)
    const superAdmin = await prisma.user.upsert({
      where: { email: 'superadmin@restaurant.com' },
      update: {},
      create: {
        email: 'superadmin@restaurant.com',
        password: superAdminPassword,
        role: 'SUPER_ADMIN',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Super',
            lastName: 'Admin',
            phoneNumber: '+1234567899',
          },
        },
      },
      include: {
        profile: true,
      },
    })

    console.log('✅ Super admin user created successfully!')
    console.log('👤 Super Admin:', superAdmin.email)
    console.log('🔑 Password: SuperAdmin123!')
  } catch (error) {
    console.error('❌ Error creating super admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSuperAdmin()