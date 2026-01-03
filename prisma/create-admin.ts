import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  console.log('Creating admin user...')

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@restaurant.com' },
      update: {},
      create: {
        email: 'admin@restaurant.com',
        password: adminPassword,
        role: 'ADMIN',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            phoneNumber: '+1234567890',
          },
        },
      },
      include: {
        profile: true,
      },
    })

    console.log('✅ Admin user created successfully!')
    console.log('👤 Admin:', admin.email)
    console.log('🔑 Password: Admin123!')
  } catch (error) {
    console.error('❌ Error creating admin:', error.message)
    // Afficher les informations de l'admin même en cas d'erreur de connexion
    console.log('\n📋 Admin user information (for manual creation):')
    console.log('Email: admin@restaurant.com')
    console.log('Password: Admin123!')
    console.log('Role: ADMIN')
    console.log('First Name: Admin')
    console.log('Last Name: User')
    console.log('Phone: +1234567890')
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()