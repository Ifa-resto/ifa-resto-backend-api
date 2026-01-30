import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as bcrypt from 'bcryptjs'

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Starting database seeding...')

    // Clean existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.userReward.deleteMany()
    await prisma.userBadge.deleteMany()
    await prisma.reward.deleteMany()
    await prisma.badge.deleteMany()
    await prisma.gamificationProfile.deleteMany()
    await prisma.orderTracking.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.cartItem.deleteMany()
    await prisma.rating.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.restaurantSchedule.deleteMany()
    await prisma.menuItem.deleteMany()
    await prisma.category.deleteMany()
    await prisma.deliveryPerson.deleteMany()
    await prisma.restaurant.deleteMany()
    await prisma.address.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.user.deleteMany()

    const hashedPassword = await bcrypt.hash('password123', 10)

    // Create Super Admin
    console.log('👤 Creating Super Admin...')
    const superAdmin = await prisma.user.create({
        data: {
            email: 'admin@ifa-restau.com',
            password: hashedPassword,
            role: 'SUPER_ADMIN',
            emailVerified: true,
            profile: {
                create: {
                    firstName: 'Super',
                    lastName: 'Admin',
                    phoneNumber: '+33612345678',
                },
            },
        },
    })

    // Create Customers
    console.log('👥 Creating customers...')
    const customers = []
    for (let i = 1; i <= 5; i++) {
        const customer = await prisma.user.create({
            data: {
                email: `customer${i}@example.com`,
                password: hashedPassword,
                role: 'CUSTOMER',
                emailVerified: true,
                profile: {
                    create: {
                        firstName: `Customer${i}`,
                        lastName: `Test`,
                        phoneNumber: `+3361234567${i}`,
                        address: {
                            create: [
                                {
                                    street: `${i} Rue de la Paix`,
                                    city: 'Paris',
                                    postalCode: '75001',
                                    country: 'France',
                                    latitude: 48.8566 + i * 0.01,
                                    longitude: 2.3522 + i * 0.01,
                                    isDefault: true,
                                },
                            ],
                        },
                    },
                },
                gamification: {
                    create: {
                        points: i * 100,
                        level: i,
                        currentStreak: i,
                        longestStreak: i * 2,
                    },
                },
            },
        })
        customers.push(customer)
    }

    // Create Restaurant Owners and Restaurants
    console.log('🍽️ Creating restaurants...')
    const restaurants = []
    const restaurantData = [
        {
            name: 'Le Gourmet Français',
            cuisine: 'Française',
            description: 'Cuisine française traditionnelle et raffinée',
            deliveryTime: 30,
            deliveryFee: 3.5,
            minimumOrder: 15,
        },
        {
            name: 'Pizza Bella',
            cuisine: 'Italienne',
            description: 'Pizzas artisanales au feu de bois',
            deliveryTime: 25,
            deliveryFee: 2.5,
            minimumOrder: 10,
        },
        {
            name: 'Sushi Master',
            cuisine: 'Japonaise',
            description: 'Sushis frais préparés par des chefs experts',
            deliveryTime: 35,
            deliveryFee: 4.0,
            minimumOrder: 20,
        },
        {
            name: 'Burger House',
            cuisine: 'Américaine',
            description: 'Burgers gourmets et frites maison',
            deliveryTime: 20,
            deliveryFee: 2.0,
            minimumOrder: 8,
        },
    ]

    for (let i = 0; i < restaurantData.length; i++) {
        const data = restaurantData[i]
        const owner = await prisma.user.create({
            data: {
                email: `owner${i + 1}@restaurant.com`,
                password: hashedPassword,
                role: 'RESTAURANT_OWNER',
                emailVerified: true,
                profile: {
                    create: {
                        firstName: `Owner${i + 1}`,
                        lastName: 'Restaurant',
                        phoneNumber: `+336987654${i + 1}`,
                        restaurant: {
                            create: {
                                name: data.name,
                                description: data.description,
                                cuisine: data.cuisine,
                                rating: 4.0 + i * 0.2,
                                isOpen: true,
                                verificationStatus: 'VERIFIED',
                                deliveryTime: data.deliveryTime,
                                deliveryFee: data.deliveryFee,
                                minimumOrder: data.minimumOrder,
                                schedules: {
                                    create: [
                                        { dayOfWeek: 1, openTime: '11:00', closeTime: '22:00', isOpen: true },
                                        { dayOfWeek: 2, openTime: '11:00', closeTime: '22:00', isOpen: true },
                                        { dayOfWeek: 3, openTime: '11:00', closeTime: '22:00', isOpen: true },
                                        { dayOfWeek: 4, openTime: '11:00', closeTime: '22:00', isOpen: true },
                                        { dayOfWeek: 5, openTime: '11:00', closeTime: '23:00', isOpen: true },
                                        { dayOfWeek: 6, openTime: '11:00', closeTime: '23:00', isOpen: true },
                                        { dayOfWeek: 0, openTime: '12:00', closeTime: '21:00', isOpen: true },
                                    ],
                                },
                            },
                        },
                    },
                },
            },
            include: {
                profile: {
                    include: {
                        restaurant: true,
                    },
                },
            },
        })
        restaurants.push(owner.profile!.restaurant!)
    }

    // Create Categories and Menu Items
    console.log('📋 Creating menu items...')
    const menuItemsData = {
        'Le Gourmet Français': [
            {
                category: 'Entrées', items: [
                    { name: 'Foie Gras Maison', price: 18.50, description: 'Foie gras de canard mi-cuit' },
                    { name: 'Escargots de Bourgogne', price: 14.00, description: '6 escargots au beurre persillé' },
                ]
            },
            {
                category: 'Plats', items: [
                    { name: 'Bœuf Bourguignon', price: 24.00, description: 'Bœuf mijoté au vin rouge' },
                    { name: 'Coq au Vin', price: 22.00, description: 'Poulet fermier au vin rouge' },
                ]
            },
            {
                category: 'Desserts', items: [
                    { name: 'Crème Brûlée', price: 8.00, description: 'Crème vanille caramélisée' },
                    { name: 'Tarte Tatin', price: 9.00, description: 'Tarte aux pommes caramélisées' },
                ]
            },
        ],
        'Pizza Bella': [
            {
                category: 'Pizzas', items: [
                    { name: 'Margherita', price: 12.00, description: 'Tomate, mozzarella, basilic' },
                    { name: 'Quattro Formaggi', price: 15.00, description: '4 fromages italiens' },
                    { name: 'Diavola', price: 14.00, description: 'Tomate, mozzarella, salami piquant' },
                ]
            },
            {
                category: 'Pâtes', items: [
                    { name: 'Carbonara', price: 13.00, description: 'Pâtes à la crème, lardons, parmesan' },
                    { name: 'Bolognese', price: 12.50, description: 'Pâtes sauce bolognaise maison' },
                ]
            },
        ],
        'Sushi Master': [
            {
                category: 'Sushis', items: [
                    { name: 'Assortiment Sushi 12 pièces', price: 18.00, description: 'Sélection du chef' },
                    { name: 'Sashimi Saumon', price: 16.00, description: '8 tranches de saumon frais' },
                ]
            },
            {
                category: 'Makis', items: [
                    { name: 'California Roll', price: 10.00, description: '8 pièces' },
                    { name: 'Dragon Roll', price: 14.00, description: '8 pièces' },
                ]
            },
        ],
        'Burger House': [
            {
                category: 'Burgers', items: [
                    { name: 'Classic Burger', price: 11.00, description: 'Bœuf, salade, tomate, oignon' },
                    { name: 'Bacon Cheese Burger', price: 13.00, description: 'Bœuf, bacon, cheddar' },
                    { name: 'Veggie Burger', price: 10.00, description: 'Steak végétal, légumes grillés' },
                ]
            },
            {
                category: 'Accompagnements', items: [
                    { name: 'Frites Maison', price: 4.00, description: 'Frites fraîches' },
                    { name: 'Onion Rings', price: 5.00, description: 'Rondelles d\'oignon panées' },
                ]
            },
        ],
    }

    for (const restaurant of restaurants) {
        const restaurantMenuData = menuItemsData[restaurant.name as keyof typeof menuItemsData]
        if (restaurantMenuData) {
            for (const categoryData of restaurantMenuData) {
                const category = await prisma.category.create({
                    data: {
                        restaurantId: restaurant.id,
                        name: categoryData.category,
                        isActive: true,
                        sortOrder: 0,
                    },
                })

                for (const item of categoryData.items) {
                    await prisma.menuItem.create({
                        data: {
                            restaurantId: restaurant.id,
                            categoryId: category.id,
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            isAvailable: true,
                            ingredients: 'Ingrédients frais',
                            allergens: 'Peut contenir des traces',
                            preparationTime: 15,
                        },
                    })
                }
            }
        }
    }

    // Create Delivery Persons
    console.log('🚴 Creating delivery persons...')
    const deliveryPersons = []
    for (let i = 1; i <= 3; i++) {
        const deliveryPerson = await prisma.user.create({
            data: {
                email: `delivery${i}@example.com`,
                password: hashedPassword,
                role: 'DELIVERY_PERSON',
                emailVerified: true,
                profile: {
                    create: {
                        firstName: `Delivery${i}`,
                        lastName: 'Person',
                        phoneNumber: `+336555444${i}`,
                        deliveryPerson: {
                            create: {
                                vehicleType: i === 1 ? 'Vélo' : i === 2 ? 'Scooter' : 'Voiture',
                                licenseNumber: `DL${i}234567`,
                                verificationStatus: 'VERIFIED',
                                isAvailable: true,
                                currentLat: 48.8566,
                                currentLng: 2.3522,
                                rating: 4.5 + i * 0.1,
                            },
                        },
                    },
                },
            },
            include: {
                profile: {
                    include: {
                        deliveryPerson: true,
                    },
                },
            },
        })
        deliveryPersons.push(deliveryPerson.profile!.deliveryPerson!)
    }

    // Create Badges
    console.log('🏆 Creating badges...')
    const badges = await Promise.all([
        prisma.badge.create({
            data: {
                name: 'Premier Pas',
                description: 'Première commande effectuée',
                criteria: 'Effectuer 1 commande',
                pointsRequired: 0,
            },
        }),
        prisma.badge.create({
            data: {
                name: 'Gourmet',
                description: '10 commandes effectuées',
                criteria: 'Effectuer 10 commandes',
                pointsRequired: 100,
            },
        }),
        prisma.badge.create({
            data: {
                name: 'Fidèle',
                description: '50 commandes effectuées',
                criteria: 'Effectuer 50 commandes',
                pointsRequired: 500,
            },
        }),
        prisma.badge.create({
            data: {
                name: 'VIP',
                description: '100 commandes effectuées',
                criteria: 'Effectuer 100 commandes',
                pointsRequired: 1000,
            },
        }),
    ])

    // Assign badges to customers
    for (const customer of customers.slice(0, 2)) {
        await prisma.userBadge.create({
            data: {
                userId: customer.id,
                badgeId: badges[0].id,
            },
        })
    }

    // Create Rewards
    console.log('🎁 Creating rewards...')
    const rewards = await Promise.all([
        prisma.reward.create({
            data: {
                name: 'Livraison Gratuite',
                description: 'Une livraison gratuite sur votre prochaine commande',
                costPoints: 50,
                type: 'FREE_DELIVERY',
                value: 0,
                isActive: true,
            },
        }),
        prisma.reward.create({
            data: {
                name: 'Réduction 10%',
                description: '10% de réduction sur votre prochaine commande',
                costPoints: 100,
                type: 'DISCOUNT_PERCENTAGE',
                value: 10,
                isActive: true,
            },
        }),
        prisma.reward.create({
            data: {
                name: 'Réduction 5€',
                description: '5€ de réduction sur votre prochaine commande',
                costPoints: 75,
                type: 'DISCOUNT_FIXED_AMOUNT',
                value: 5,
                isActive: true,
            },
        }),
    ])

    // Create sample orders
    console.log('📦 Creating sample orders...')
    const menuItems = await prisma.menuItem.findMany({ take: 10 })

    for (let i = 0; i < 3; i++) {
        const customer = customers[i]
        const restaurant = restaurants[i % restaurants.length]
        const deliveryPerson = deliveryPersons[i % deliveryPersons.length]
        const customerAddress = await prisma.address.findFirst({
            where: { profile: { userId: customer.id } },
        })

        if (customerAddress) {
            const order = await prisma.order.create({
                data: {
                    orderNumber: `ORD-${Date.now()}-${i}`,
                    customerId: customer.id,
                    restaurantId: restaurant.id,
                    deliveryPersonId: deliveryPerson.id,
                    status: i === 0 ? 'DELIVERED' : i === 1 ? 'ON_THE_WAY' : 'PREPARING',
                    subtotal: 25.00,
                    deliveryFee: restaurant.deliveryFee,
                    taxAmount: 2.50,
                    totalAmount: 27.50 + restaurant.deliveryFee,
                    paymentMethod: 'CARD',
                    paymentStatus: 'COMPLETED',
                    estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000),
                    items: {
                        create: [
                            {
                                menuItemId: menuItems[i * 2].id,
                                quantity: 1,
                                unitPrice: menuItems[i * 2].price,
                                totalPrice: menuItems[i * 2].price,
                            },
                            {
                                menuItemId: menuItems[i * 2 + 1].id,
                                quantity: 2,
                                unitPrice: menuItems[i * 2 + 1].price,
                                totalPrice: menuItems[i * 2 + 1].price * 2,
                            },
                        ],
                    },
                },
            })

            // Create order tracking
            await prisma.orderTracking.create({
                data: {
                    orderId: order.id,
                    status: order.status,
                    notes: 'Commande créée',
                },
            })

            // Create payment
            await prisma.payment.create({
                data: {
                    orderId: order.id,
                    amount: order.totalAmount,
                    method: order.paymentMethod,
                    status: order.paymentStatus,
                    transactionId: `TXN-${Date.now()}-${i}`,
                    processedAt: new Date(),
                },
            })
        }
    }

    // Create notifications
    console.log('🔔 Creating notifications...')
    for (const customer of customers.slice(0, 3)) {
        await prisma.notification.create({
            data: {
                userId: customer.id,
                title: 'Bienvenue sur IFA Restau!',
                message: 'Profitez de nos délicieux plats livrés chez vous',
                type: 'SYSTEM',
                isRead: false,
            },
        })
    }

    console.log('✅ Database seeding completed successfully!')
    console.log(`
📊 Summary:
- Super Admin: 1
- Customers: ${customers.length}
- Restaurants: ${restaurants.length}
- Delivery Persons: ${deliveryPersons.length}
- Badges: ${badges.length}
- Rewards: ${rewards.length}
- Menu Items: ${menuItems.length}
  `)
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
