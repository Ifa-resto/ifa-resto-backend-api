import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

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

  // Create multiple customer users
  const customers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'customer@example.com' },
      update: {},
      create: {
        email: 'customer@example.com',
        password: await bcrypt.hash('Customer123!', 12),
        role: 'CUSTOMER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'John',
            lastName: 'Doe',
            phoneNumber: '+1234567891',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        email: 'jane.smith@example.com',
        password: await bcrypt.hash('Customer123!', 12),
        role: 'CUSTOMER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Jane',
            lastName: 'Smith',
            phoneNumber: '+1234567892',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.johnson@example.com' },
      update: {},
      create: {
        email: 'mike.johnson@example.com',
        password: await bcrypt.hash('Customer123!', 12),
        role: 'CUSTOMER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Mike',
            lastName: 'Johnson',
            phoneNumber: '+1234567893',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.williams@example.com' },
      update: {},
      create: {
        email: 'sarah.williams@example.com',
        password: await bcrypt.hash('Customer123!', 12),
        role: 'CUSTOMER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Sarah',
            lastName: 'Williams',
            phoneNumber: '+1234567894',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'david.brown@example.com' },
      update: {},
      create: {
        email: 'david.brown@example.com',
        password: await bcrypt.hash('Customer123!', 12),
        role: 'CUSTOMER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'David',
            lastName: 'Brown',
            phoneNumber: '+1234567895',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
  ])

  // Create multiple restaurant owners
  const owners = await Promise.all([
    prisma.user.upsert({
      where: { email: 'owner@restaurant.com' },
      update: {},
      create: {
        email: 'owner@restaurant.com',
        password: await bcrypt.hash('Owner123!', 12),
        role: 'RESTAURANT_OWNER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Restaurant',
            lastName: 'Owner',
            phoneNumber: '+1234567894',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'italian.owner@example.com' },
      update: {},
      create: {
        email: 'italian.owner@example.com',
        password: await bcrypt.hash('Owner123!', 12),
        role: 'RESTAURANT_OWNER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Marco',
            lastName: 'Bianchi',
            phoneNumber: '+1234567895',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'mexican.owner@example.com' },
      update: {},
      create: {
        email: 'mexican.owner@example.com',
        password: await bcrypt.hash('Owner123!', 12),
        role: 'RESTAURANT_OWNER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Carlos',
            lastName: 'Rodriguez',
            phoneNumber: '+1234567896',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'chinese.owner@example.com' },
      update: {},
      create: {
        email: 'chinese.owner@example.com',
        password: await bcrypt.hash('Owner123!', 12),
        role: 'RESTAURANT_OWNER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Li',
            lastName: 'Wei',
            phoneNumber: '+1234567897',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'indian.owner@example.com' },
      update: {},
      create: {
        email: 'indian.owner@example.com',
        password: await bcrypt.hash('Owner123!', 12),
        role: 'RESTAURANT_OWNER',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Raj',
            lastName: 'Patel',
            phoneNumber: '+1234567898',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
  ])

  // Create delivery persons
  const deliveryPersons = await Promise.all([
    prisma.user.upsert({
      where: { email: 'delivery@example.com' },
      update: {},
      create: {
        email: 'delivery@example.com',
        password: await bcrypt.hash('Delivery123!', 12),
        role: 'DELIVERY_PERSON',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Delivery',
            lastName: 'Person',
            phoneNumber: '+1234567897',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'delivery2@example.com' },
      update: {},
      create: {
        email: 'delivery2@example.com',
        password: await bcrypt.hash('Delivery123!', 12),
        role: 'DELIVERY_PERSON',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Alex',
            lastName: 'Wilson',
            phoneNumber: '+1234567898',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
    prisma.user.upsert({
      where: { email: 'delivery3@example.com' },
      update: {},
      create: {
        email: 'delivery3@example.com',
        password: await bcrypt.hash('Delivery123!', 12),
        role: 'DELIVERY_PERSON',
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Maria',
            lastName: 'Garcia',
            phoneNumber: '+1234567899',
          },
        },
      },
      include: {
        profile: true,
      },
    }),
  ])

  // Connect delivery persons to their profiles
  const deliveryProfiles = await Promise.all(
    deliveryPersons.map(person => 
      prisma.deliveryPerson.upsert({
        where: { profileId: person.profile.id },
        update: {},
        create: {
          profileId: person.profile.id,
          vehicleType: 'Motorcycle',
          isAvailable: true,
        },
      })
    )
  )

  // Create restaurants
  const restaurants = await Promise.all([
    prisma.restaurant.upsert({
      where: { profileId: owners[0].profile.id },
      update: {},
      create: {
        name: 'Sample Restaurant',
        description: 'A sample restaurant for testing',
        cuisine: 'Various',
        deliveryTime: 30,
        deliveryFee: 2.99,
        minimumOrder: 10.00,
        profile: {
          connect: {
            id: owners[0].profile.id
          }
        }
      },
    }),
    prisma.restaurant.upsert({
      where: { profileId: owners[1].profile.id },
      update: {},
      create: {
        name: 'Bella Italia',
        description: 'Authentic Italian cuisine with fresh ingredients',
        cuisine: 'Italian',
        deliveryTime: 45,
        deliveryFee: 3.50,
        minimumOrder: 15.00,
        profile: {
          connect: {
            id: owners[1].profile.id
          }
        }
      },
    }),
    prisma.restaurant.upsert({
      where: { profileId: owners[2].profile.id },
      update: {},
      create: {
        name: 'Taco Fiesta',
        description: 'Spicy and delicious Mexican food',
        cuisine: 'Mexican',
        deliveryTime: 35,
        deliveryFee: 2.50,
        minimumOrder: 12.00,
        profile: {
          connect: {
            id: owners[2].profile.id
          }
        }
      },
    }),
    prisma.restaurant.upsert({
      where: { profileId: owners[3].profile.id },
      update: {},
      create: {
        name: 'Dragon Palace',
        description: 'Traditional Chinese cuisine with modern twists',
        cuisine: 'Chinese',
        deliveryTime: 40,
        deliveryFee: 3.00,
        minimumOrder: 13.00,
        profile: {
          connect: {
            id: owners[3].profile.id
          }
        }
      },
    }),
    prisma.restaurant.upsert({
      where: { profileId: owners[4].profile.id },
      update: {},
      create: {
        name: 'Spice Garden',
        description: 'Authentic Indian flavors with aromatic spices',
        cuisine: 'Indian',
        deliveryTime: 50,
        deliveryFee: 3.25,
        minimumOrder: 14.00,
        profile: {
          connect: {
            id: owners[4].profile.id
          }
        }
      },
    }),
  ])

  // Create addresses for restaurants
  const restaurantAddresses = await Promise.all([
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: owners[0].profile.id
          }
        },
        street: '123 Main St',
        city: 'Sample City',
        postalCode: '12345',
        country: 'USA',
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: owners[1].profile.id
          }
        },
        street: '456 Oak Avenue',
        city: 'Sample City',
        postalCode: '12346',
        country: 'USA',
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: owners[2].profile.id
          }
        },
        street: '789 Pine Street',
        city: 'Sample City',
        postalCode: '12347',
        country: 'USA',
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: owners[3].profile.id
          }
        },
        street: '101 Maple Drive',
        city: 'Sample City',
        postalCode: '12348',
        country: 'USA',
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: owners[4].profile.id
          }
        },
        street: '202 Elm Street',
        city: 'Sample City',
        postalCode: '12349',
        country: 'USA',
      },
    }),
  ])

  // Create customer addresses
  const customerAddresses = await Promise.all([
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: customers[0].profile.id
          }
        },
        street: '111 First St',
        city: 'Sample City',
        postalCode: '12348',
        country: 'USA',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: customers[1].profile.id
          }
        },
        street: '222 Second Ave',
        city: 'Sample City',
        postalCode: '12349',
        country: 'USA',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: customers[2].profile.id
          }
        },
        street: '333 Third Blvd',
        city: 'Sample City',
        postalCode: '12350',
        country: 'USA',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: customers[3].profile.id
          }
        },
        street: '444 Fourth Rd',
        city: 'Sample City',
        postalCode: '12351',
        country: 'USA',
        isDefault: true,
      },
    }),
    prisma.address.create({
      data: {
        profile: {
          connect: {
            id: customers[4].profile.id
          }
        },
        street: '555 Fifth Ln',
        city: 'Sample City',
        postalCode: '12352',
        country: 'USA',
        isDefault: true,
      },
    }),
  ])

  // Create categories for each restaurant
  const categories = await Promise.all([
    // Sample Restaurant categories
    prisma.category.create({
      data: {
        restaurantId: restaurants[0].id,
        name: 'Pizza',
        description: 'Delicious pizzas with various toppings',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[0].id,
        name: 'Burgers',
        description: 'Juicy burgers with fresh ingredients',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[0].id,
        name: 'Desserts',
        description: 'Sweet treats and desserts',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[0].id,
        name: 'Drinks',
        description: 'Refreshing beverages',
      },
    }),
    // Bella Italia categories
    prisma.category.create({
      data: {
        restaurantId: restaurants[1].id,
        name: 'Pasta',
        description: 'Traditional Italian pasta dishes',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[1].id,
        name: 'Pizza',
        description: 'Authentic wood-fired pizzas',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[1].id,
        name: 'Antipasti',
        description: 'Italian appetizers',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[1].id,
        name: 'Dolci',
        description: 'Italian desserts',
      },
    }),
    // Taco Fiesta categories
    prisma.category.create({
      data: {
        restaurantId: restaurants[2].id,
        name: 'Tacos',
        description: 'Traditional Mexican tacos',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[2].id,
        name: 'Burritos',
        description: 'Large Mexican wraps',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[2].id,
        name: 'Nachos',
        description: 'Crispy tortilla chips with toppings',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[2].id,
        name: 'Bebidas',
        description: 'Mexican beverages',
      },
    }),
    // Dragon Palace categories
    prisma.category.create({
      data: {
        restaurantId: restaurants[3].id,
        name: 'Appetizers',
        description: 'Traditional Chinese starters',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[3].id,
        name: 'Main Dishes',
        description: 'Popular Chinese entrees',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[3].id,
        name: 'Dim Sum',
        description: 'Steamed and fried dumplings',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[3].id,
        name: 'Noodles',
        description: 'Traditional noodle dishes',
      },
    }),
    // Spice Garden categories
    prisma.category.create({
      data: {
        restaurantId: restaurants[4].id,
        name: 'Starters',
        description: 'Indian appetizers',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[4].id,
        name: 'Curries',
        description: 'Traditional Indian curries',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[4].id,
        name: 'Breads',
        description: 'Freshly baked Indian breads',
      },
    }),
    prisma.category.create({
      data: {
        restaurantId: restaurants[4].id,
        name: 'Desserts',
        description: 'Traditional Indian sweets',
      },
    }),
  ])

  // Create menu items for each restaurant
  const menuItems = await Promise.all([
    // Sample Restaurant menu items
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: categories[0].id, // Pizza
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce and mozzarella',
        price: 12.99,
        ingredients: 'Tomato sauce, mozzarella, basil',
        allergens: 'Gluten, dairy',
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: categories[0].id, // Pizza
        name: 'Pepperoni Pizza',
        description: 'Pizza with spicy pepperoni slices',
        price: 14.99,
        ingredients: 'Tomato sauce, mozzarella, pepperoni',
        allergens: 'Gluten, dairy',
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: categories[0].id, // Pizza
        name: 'Vegetarian Pizza',
        description: 'Pizza with mushrooms, peppers, onions, and olives',
        price: 13.99,
        ingredients: 'Tomato sauce, mozzarella, mushrooms, peppers, onions, olives',
        allergens: 'Gluten, dairy',
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: categories[1].id, // Burgers
        name: 'Classic Burger',
        description: 'Beef burger with lettuce, tomato, and onion',
        price: 9.99,
        ingredients: 'Beef patty, lettuce, tomato, onion, bun',
        allergens: 'Gluten, dairy',
        preparationTime: 10,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: categories[1].id, // Burgers
        name: 'Cheeseburger',
        description: 'Beef burger with melted cheese',
        price: 10.99,
        ingredients: 'Beef patty, cheese, lettuce, tomato, onion, bun',
        allergens: 'Gluten, dairy',
        preparationTime: 10,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: categories[2].id, // Desserts
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 6.99,
        ingredients: 'Chocolate, flour, sugar, eggs',
        allergens: 'Gluten, dairy, eggs',
        preparationTime: 5,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[0].id,
        categoryId: categories[3].id, // Drinks
        name: 'Soft Drink',
        description: 'Choice of cola, lemon-lime, or orange soda',
        price: 2.99,
        ingredients: 'Carbonated water, sweeteners, flavoring',
        allergens: 'None',
        preparationTime: 2,
      },
    }),
    // Bella Italia menu items
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: categories[4].id, // Pasta
        name: 'Spaghetti Carbonara',
        description: 'Classic Roman pasta with eggs, cheese, pancetta, and pepper',
        price: 13.99,
        ingredients: 'Spaghetti, eggs, pecorino cheese, pancetta, black pepper',
        allergens: 'Gluten, dairy, eggs',
        preparationTime: 20,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: categories[4].id, // Pasta
        name: 'Fettuccine Alfredo',
        description: 'Flat ribbon pasta with rich butter and Parmesan cheese sauce',
        price: 14.99,
        ingredients: 'Fettuccine, butter, Parmesan cheese',
        allergens: 'Gluten, dairy',
        preparationTime: 18,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: categories[5].id, // Pizza
        name: 'Margherita Pizza',
        description: 'Traditional Neapolitan pizza with San Marzano tomatoes and mozzarella di bufala',
        price: 15.99,
        ingredients: 'San Marzano tomatoes, mozzarella di bufala, fresh basil, olive oil',
        allergens: 'Gluten, dairy',
        preparationTime: 20,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: categories[6].id, // Antipasti
        name: 'Bruschetta',
        description: 'Toasted bread topped with tomatoes, garlic, and fresh basil',
        price: 7.99,
        ingredients: 'Bread, tomatoes, garlic, basil, olive oil',
        allergens: 'Gluten',
        preparationTime: 10,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[1].id,
        categoryId: categories[7].id, // Dolci
        name: 'Tiramisu',
        description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
        price: 8.99,
        ingredients: 'Ladyfingers, coffee, mascarpone, cocoa powder, eggs',
        allergens: 'Dairy, eggs, gluten',
        preparationTime: 5,
      },
    }),
    // Taco Fiesta menu items
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: categories[8].id, // Tacos
        name: 'Chicken Tacos',
        description: 'Soft corn tortillas filled with seasoned chicken and fresh salsa',
        price: 8.99,
        ingredients: 'Corn tortillas, chicken, onions, cilantro, salsa',
        allergens: 'None',
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: categories[8].id, // Tacos
        name: 'Beef Tacos',
        description: 'Soft corn tortillas filled with seasoned ground beef and fresh salsa',
        price: 8.99,
        ingredients: 'Corn tortillas, beef, onions, cilantro, salsa',
        allergens: 'None',
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: categories[9].id, // Burritos
        name: 'Beef Burrito',
        description: 'Large flour tortilla filled with seasoned beef, rice, beans, and cheese',
        price: 11.99,
        ingredients: 'Flour tortilla, beef, rice, beans, cheese, salsa',
        allergens: 'Gluten, dairy',
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: categories[10].id, // Nachos
        name: 'Nachos Supreme',
        description: 'Tortilla chips loaded with cheese, jalapeños, and your choice of meat',
        price: 9.99,
        ingredients: 'Tortilla chips, cheese, jalapeños, ground beef, sour cream',
        allergens: 'Dairy',
        preparationTime: 10,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[2].id,
        categoryId: categories[11].id, // Bebidas
        name: 'Horchata',
        description: 'Traditional Mexican rice drink with cinnamon',
        price: 3.99,
        ingredients: 'Rice, milk, cinnamon, sugar',
        allergens: 'Dairy',
        preparationTime: 5,
      },
    }),
    // Dragon Palace menu items
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[3].id,
        categoryId: categories[12].id, // Appetizers
        name: 'Spring Rolls',
        description: 'Crispy vegetable spring rolls served with sweet chili sauce',
        price: 6.99,
        ingredients: 'Vegetables, wrapper, sweet chili sauce',
        allergens: 'Gluten, soy',
        preparationTime: 10,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[3].id,
        categoryId: categories[13].id, // Main Dishes
        name: 'Kung Pao Chicken',
        description: 'Spicy stir-fry with chicken, peanuts, vegetables, and chili peppers',
        price: 14.99,
        ingredients: 'Chicken, peanuts, vegetables, soy sauce, chili peppers',
        allergens: 'Peanuts, soy, gluten',
        preparationTime: 20,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[3].id,
        categoryId: categories[14].id, // Dim Sum
        name: 'Shrimp Dumplings',
        description: 'Steamed dumplings filled with fresh shrimp and vegetables',
        price: 8.99,
        ingredients: 'Shrimp, vegetables, wrapper',
        allergens: 'Shellfish, gluten',
        preparationTime: 15,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[3].id,
        categoryId: categories[15].id, // Noodles
        name: 'Beef Chow Mein',
        description: 'Stir-fried noodles with tender beef and crisp vegetables',
        price: 13.99,
        ingredients: 'Noodles, beef, vegetables, soy sauce',
        allergens: 'Gluten, soy',
        preparationTime: 18,
      },
    }),
    // Spice Garden menu items
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[4].id,
        categoryId: categories[16].id, // Starters
        name: 'Samosas',
        description: 'Crispy pastries filled with spiced potatoes and peas',
        price: 5.99,
        ingredients: 'Potatoes, peas, spices, pastry',
        allergens: 'Gluten',
        preparationTime: 12,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[4].id,
        categoryId: categories[17].id, // Curries
        name: 'Chicken Tikka Masala',
        description: 'Grilled chicken in a creamy tomato-based sauce with aromatic spices',
        price: 15.99,
        ingredients: 'Chicken, tomatoes, cream, spices',
        allergens: 'Dairy',
        preparationTime: 25,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[4].id,
        categoryId: categories[18].id, // Breads
        name: 'Garlic Naan',
        description: 'Traditional leavened flatbread brushed with garlic butter',
        price: 3.99,
        ingredients: 'Flour, yeast, garlic, butter',
        allergens: 'Gluten, dairy',
        preparationTime: 8,
      },
    }),
    prisma.menuItem.create({
      data: {
        restaurantId: restaurants[4].id,
        categoryId: categories[19].id, // Desserts
        name: 'Gulab Jamun',
        description: 'Deep-fried dough balls soaked in sweet syrup',
        price: 6.99,
        ingredients: 'Milk solids, flour, sugar syrup',
        allergens: 'Dairy, gluten',
        preparationTime: 5,
      },
    }),
  ])

  // Create sample orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'ORD-001',
        customerId: customers[0].id,
        restaurantId: restaurants[0].id,
        deliveryPersonId: deliveryProfiles[0].id,
        status: 'DELIVERED',
        subtotal: 27.98,
        deliveryFee: 2.99,
        taxAmount: 2.52,
        totalAmount: 33.49,
        paymentMethod: 'CARD',
        paymentStatus: 'COMPLETED',
        deliveryAddress: {
          create: {
            profileId: customers[0].profile.id,
            street: '111 First St',
            city: 'Sample City',
            postalCode: '12348',
            country: 'USA',
          }
        },
        items: {
          create: [
            {
              menuItemId: menuItems[0].id, // Margherita Pizza
              quantity: 1,
              unitPrice: 12.99,
              totalPrice: 12.99,
            },
            {
              menuItemId: menuItems[1].id, // Pepperoni Pizza
              quantity: 1,
              unitPrice: 14.99,
              totalPrice: 14.99,
            },
          ]
        }
      },
      include: {
        items: true,
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-002',
        customerId: customers[1].id,
        restaurantId: restaurants[1].id,
        deliveryPersonId: deliveryProfiles[1].id,
        status: 'DELIVERED',
        subtotal: 21.98,
        deliveryFee: 3.50,
        taxAmount: 1.98,
        totalAmount: 27.46,
        paymentMethod: 'CASH',
        paymentStatus: 'COMPLETED',
        deliveryAddress: {
          create: {
            profileId: customers[1].profile.id,
            street: '222 Second Ave',
            city: 'Sample City',
            postalCode: '12349',
            country: 'USA',
          }
        },
        items: {
          create: [
            {
              menuItemId: menuItems[7].id, // Spaghetti Carbonara
              quantity: 1,
              unitPrice: 13.99,
              totalPrice: 13.99,
            },
            {
              menuItemId: menuItems[10].id, // Bruschetta
              quantity: 1,
              unitPrice: 7.99,
              totalPrice: 7.99,
            },
          ]
        }
      },
      include: {
        items: true,
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-003',
        customerId: customers[2].id,
        restaurantId: restaurants[2].id,
        deliveryPersonId: deliveryProfiles[2].id,
        status: 'DELIVERED',
        subtotal: 20.97,
        deliveryFee: 2.50,
        taxAmount: 1.89,
        totalAmount: 25.36,
        paymentMethod: 'CARD',
        paymentStatus: 'COMPLETED',
        deliveryAddress: {
          create: {
            profileId: customers[2].profile.id,
            street: '333 Third Blvd',
            city: 'Sample City',
            postalCode: '12350',
            country: 'USA',
          }
        },
        items: {
          create: [
            {
              menuItemId: menuItems[12].id, // Chicken Tacos
              quantity: 2,
              unitPrice: 8.99,
              totalPrice: 17.98,
            },
            {
              menuItemId: menuItems[16].id, // Horchata
              quantity: 1,
              unitPrice: 2.99,
              totalPrice: 2.99,
            },
          ]
        }
      },
      include: {
        items: true,
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-004',
        customerId: customers[3].id,
        restaurantId: restaurants[3].id,
        deliveryPersonId: deliveryProfiles[0].id,
        status: 'DELIVERED',
        subtotal: 21.98,
        deliveryFee: 3.00,
        taxAmount: 1.98,
        totalAmount: 26.96,
        paymentMethod: 'PAYPAL',
        paymentStatus: 'COMPLETED',
        deliveryAddress: {
          create: {
            profileId: customers[3].profile.id,
            street: '444 Fourth Rd',
            city: 'Sample City',
            postalCode: '12351',
            country: 'USA',
          }
        },
        items: {
          create: [
            {
              menuItemId: menuItems[18].id, // Kung Pao Chicken
              quantity: 1,
              unitPrice: 14.99,
              totalPrice: 14.99,
            },
            {
              menuItemId: menuItems[17].id, // Spring Rolls
              quantity: 1,
              unitPrice: 6.99,
              totalPrice: 6.99,
            },
          ]
        }
      },
      include: {
        items: true,
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'ORD-005',
        customerId: customers[4].id,
        restaurantId: restaurants[4].id,
        deliveryPersonId: deliveryProfiles[1].id,
        status: 'DELIVERED',
        subtotal: 26.97,
        deliveryFee: 3.25,
        taxAmount: 2.43,
        totalAmount: 32.65,
        paymentMethod: 'STRIPE',
        paymentStatus: 'COMPLETED',
        deliveryAddress: {
          create: {
            profileId: customers[4].profile.id,
            street: '555 Fifth Ln',
            city: 'Sample City',
            postalCode: '12352',
            country: 'USA',
          }
        },
        items: {
          create: [
            {
              menuItemId: menuItems[22].id, // Chicken Tikka Masala
              quantity: 1,
              unitPrice: 15.99,
              totalPrice: 15.99,
            },
            {
              menuItemId: menuItems[23].id, // Garlic Naan
              quantity: 2,
              unitPrice: 3.99,
              totalPrice: 7.98,
            },
            {
              menuItemId: menuItems[24].id, // Gulab Jamun
              quantity: 1,
              unitPrice: 6.99,
              totalPrice: 6.99,
            },
          ]
        }
      },
      include: {
        items: true,
      }
    }),
  ])

  // Create order tracking for all orders
  const orderTrackings = await Promise.all([
    // Order 1 tracking
    prisma.orderTracking.create({
      data: {
        orderId: orders[0].id,
        status: 'PENDING',
        notes: 'Order placed',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[0].id,
        status: 'CONFIRMED',
        notes: 'Order confirmed by restaurant',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[0].id,
        status: 'PREPARING',
        notes: 'Food is being prepared',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[0].id,
        status: 'READY_FOR_PICKUP',
        notes: 'Food is ready for pickup',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[0].id,
        status: 'PICKED_UP',
        notes: 'Delivery person picked up the order',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[0].id,
        status: 'ON_THE_WAY',
        notes: 'Order is on the way to customer',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[0].id,
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
      },
    }),
    
    // Order 2 tracking
    prisma.orderTracking.create({
      data: {
        orderId: orders[1].id,
        status: 'PENDING',
        notes: 'Order placed',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[1].id,
        status: 'CONFIRMED',
        notes: 'Order confirmed by restaurant',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[1].id,
        status: 'PREPARING',
        notes: 'Food is being prepared',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[1].id,
        status: 'READY_FOR_PICKUP',
        notes: 'Food is ready for pickup',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[1].id,
        status: 'PICKED_UP',
        notes: 'Delivery person picked up the order',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[1].id,
        status: 'ON_THE_WAY',
        notes: 'Order is on the way to customer',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[1].id,
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
      },
    }),
    
    // Order 3 tracking
    prisma.orderTracking.create({
      data: {
        orderId: orders[2].id,
        status: 'PENDING',
        notes: 'Order placed',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[2].id,
        status: 'CONFIRMED',
        notes: 'Order confirmed by restaurant',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[2].id,
        status: 'PREPARING',
        notes: 'Food is being prepared',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[2].id,
        status: 'READY_FOR_PICKUP',
        notes: 'Food is ready for pickup',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[2].id,
        status: 'PICKED_UP',
        notes: 'Delivery person picked up the order',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[2].id,
        status: 'ON_THE_WAY',
        notes: 'Order is on the way to customer',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[2].id,
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
      },
    }),
    
    // Order 4 tracking
    prisma.orderTracking.create({
      data: {
        orderId: orders[3].id,
        status: 'PENDING',
        notes: 'Order placed',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[3].id,
        status: 'CONFIRMED',
        notes: 'Order confirmed by restaurant',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[3].id,
        status: 'PREPARING',
        notes: 'Food is being prepared',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[3].id,
        status: 'READY_FOR_PICKUP',
        notes: 'Food is ready for pickup',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[3].id,
        status: 'PICKED_UP',
        notes: 'Delivery person picked up the order',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[3].id,
        status: 'ON_THE_WAY',
        notes: 'Order is on the way to customer',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[3].id,
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
      },
    }),
    
    // Order 5 tracking
    prisma.orderTracking.create({
      data: {
        orderId: orders[4].id,
        status: 'PENDING',
        notes: 'Order placed',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[4].id,
        status: 'CONFIRMED',
        notes: 'Order confirmed by restaurant',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[4].id,
        status: 'PREPARING',
        notes: 'Food is being prepared',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[4].id,
        status: 'READY_FOR_PICKUP',
        notes: 'Food is ready for pickup',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[4].id,
        status: 'PICKED_UP',
        notes: 'Delivery person picked up the order',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[4].id,
        status: 'ON_THE_WAY',
        notes: 'Order is on the way to customer',
      },
    }),
    prisma.orderTracking.create({
      data: {
        orderId: orders[4].id,
        status: 'DELIVERED',
        notes: 'Order delivered successfully',
      },
    }),
  ])

  // Create payments for all orders
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        orderId: orders[0].id,
        amount: 33.49,
        method: 'CARD',
        status: 'COMPLETED',
        transactionId: 'txn_001',
        processedAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        orderId: orders[1].id,
        amount: 27.46,
        method: 'CASH',
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        orderId: orders[2].id,
        amount: 25.36,
        method: 'CARD',
        status: 'COMPLETED',
        transactionId: 'txn_003',
        processedAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        orderId: orders[3].id,
        amount: 26.96,
        method: 'PAYPAL',
        status: 'COMPLETED',
        transactionId: 'txn_004',
        processedAt: new Date(),
      },
    }),
    prisma.payment.create({
      data: {
        orderId: orders[4].id,
        amount: 32.65,
        method: 'STRIPE',
        status: 'COMPLETED',
        transactionId: 'txn_005',
        processedAt: new Date(),
      },
    }),
  ])

  // Create ratings for orders
  const ratings = await Promise.all([
    prisma.rating.create({
      data: {
        userId: customers[0].id,
        restaurantId: restaurants[0].id,
        orderId: orders[0].id,
        rating: 5,
        comment: 'Excellent food and fast delivery!',
      },
    }),
    prisma.rating.create({
      data: {
        userId: customers[1].id,
        restaurantId: restaurants[1].id,
        orderId: orders[1].id,
        rating: 4,
        comment: 'Great food, but delivery took a bit longer than expected.',
      },
    }),
    prisma.rating.create({
      data: {
        userId: customers[2].id,
        restaurantId: restaurants[2].id,
        orderId: orders[2].id,
        rating: 5,
        comment: 'Perfect tacos! Loved the authentic flavors.',
      },
    }),
    prisma.rating.create({
      data: {
        userId: customers[3].id,
        restaurantId: restaurants[3].id,
        orderId: orders[3].id,
        rating: 4,
        comment: 'Good Chinese food, arrived hot and on time.',
      },
    }),
    prisma.rating.create({
      data: {
        userId: customers[4].id,
        restaurantId: restaurants[4].id,
        orderId: orders[4].id,
        rating: 5,
        comment: 'Amazing Indian cuisine! Will definitely order again.',
      },
    }),
  ])

  // Create restaurant schedules for all restaurants (Mon-Sun)
  const schedules = await Promise.all([
    // Sample Restaurant schedule (Mon-Sun 10:00-22:00)
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[0].id,
        dayOfWeek: 0, // Sunday
        openTime: '10:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[0].id,
        dayOfWeek: 1, // Monday
        openTime: '10:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[0].id,
        dayOfWeek: 2, // Tuesday
        openTime: '10:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[0].id,
        dayOfWeek: 3, // Wednesday
        openTime: '10:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[0].id,
        dayOfWeek: 4, // Thursday
        openTime: '10:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[0].id,
        dayOfWeek: 5, // Friday
        openTime: '10:00',
        closeTime: '23:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[0].id,
        dayOfWeek: 6, // Saturday
        openTime: '10:00',
        closeTime: '23:00',
        isOpen: true,
      },
    }),
    
    // Bella Italia schedule (Closed Mondays)
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[1].id,
        dayOfWeek: 0, // Sunday
        openTime: '11:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[1].id,
        dayOfWeek: 1, // Monday
        openTime: '00:00',
        closeTime: '00:00',
        isOpen: false,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[1].id,
        dayOfWeek: 2, // Tuesday
        openTime: '11:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[1].id,
        dayOfWeek: 3, // Wednesday
        openTime: '11:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[1].id,
        dayOfWeek: 4, // Thursday
        openTime: '11:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[1].id,
        dayOfWeek: 5, // Friday
        openTime: '11:00',
        closeTime: '23:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[1].id,
        dayOfWeek: 6, // Saturday
        openTime: '11:00',
        closeTime: '23:30',
        isOpen: true,
      },
    }),
    
    // Taco Fiesta schedule
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[2].id,
        dayOfWeek: 0, // Sunday
        openTime: '12:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[2].id,
        dayOfWeek: 1, // Monday
        openTime: '12:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[2].id,
        dayOfWeek: 2, // Tuesday
        openTime: '12:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[2].id,
        dayOfWeek: 3, // Wednesday
        openTime: '12:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[2].id,
        dayOfWeek: 4, // Thursday
        openTime: '12:00',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[2].id,
        dayOfWeek: 5, // Friday
        openTime: '12:00',
        closeTime: '23:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[2].id,
        dayOfWeek: 6, // Saturday
        openTime: '12:00',
        closeTime: '23:00',
        isOpen: true,
      },
    }),
    
    // Dragon Palace schedule
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[3].id,
        dayOfWeek: 0, // Sunday
        openTime: '11:30',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[3].id,
        dayOfWeek: 1, // Monday
        openTime: '11:30',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[3].id,
        dayOfWeek: 2, // Tuesday
        openTime: '11:30',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[3].id,
        dayOfWeek: 3, // Wednesday
        openTime: '11:30',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[3].id,
        dayOfWeek: 4, // Thursday
        openTime: '11:30',
        closeTime: '22:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[3].id,
        dayOfWeek: 5, // Friday
        openTime: '11:30',
        closeTime: '23:00',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[3].id,
        dayOfWeek: 6, // Saturday
        openTime: '11:30',
        closeTime: '23:00',
        isOpen: true,
      },
    }),
    
    // Spice Garden schedule
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[4].id,
        dayOfWeek: 0, // Sunday
        openTime: '12:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[4].id,
        dayOfWeek: 1, // Monday
        openTime: '12:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[4].id,
        dayOfWeek: 2, // Tuesday
        openTime: '12:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[4].id,
        dayOfWeek: 3, // Wednesday
        openTime: '12:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[4].id,
        dayOfWeek: 4, // Thursday
        openTime: '12:00',
        closeTime: '22:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[4].id,
        dayOfWeek: 5, // Friday
        openTime: '12:00',
        closeTime: '23:30',
        isOpen: true,
      },
    }),
    prisma.restaurantSchedule.create({
      data: {
        restaurantId: restaurants[4].id,
        dayOfWeek: 6, // Saturday
        openTime: '12:00',
        closeTime: '23:30',
        isOpen: true,
      },
    }),
  ])

  // Create cart items for some customers
  const cartItems = await Promise.all([
    prisma.cartItem.create({
      data: {
        userId: customers[0].id,
        menuItemId: menuItems[2].id, // Vegetarian Pizza
        quantity: 1,
        notes: 'Extra cheese please',
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: customers[1].id,
        menuItemId: menuItems[8].id, // Fettuccine Alfredo
        quantity: 2,
      },
    }),
    prisma.cartItem.create({
      data: {
        userId: customers[2].id,
        menuItemId: menuItems[13].id, // Beef Tacos
        quantity: 3,
        notes: 'Extra spicy',
      },
    }),
  ])

  // Create notifications for users
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: customers[0].id,
        title: 'Order Delivered',
        message: 'Your order #ORD-001 has been delivered successfully.',
        type: 'ORDER_UPDATE',
      },
    }),
    prisma.notification.create({
      data: {
        userId: customers[1].id,
        title: 'Order Confirmed',
        message: 'Your order #ORD-002 has been confirmed by the restaurant.',
        type: 'ORDER_UPDATE',
      },
    }),
    prisma.notification.create({
      data: {
        userId: customers[2].id,
        title: 'Special Offer',
        message: 'Get 20% off on your next order from Taco Fiesta!',
        type: 'PROMOTION',
      },
    }),
    prisma.notification.create({
      data: {
        userId: owners[0].id,
        title: 'New Order Received',
        message: 'You have received a new order #ORD-001.',
        type: 'ORDER_UPDATE',
      },
    }),
    prisma.notification.create({
      data: {
        userId: deliveryPersons[0].id,
        title: 'New Delivery Assignment',
        message: 'You have been assigned to deliver order #ORD-001.',
        type: 'DELIVERY',
      },
    }),
  ])

  console.log('✅ Database seeding completed!')
  console.log('👤 Created users:')
  console.log(`   - Super Admin: ${superAdmin.email}`)
  console.log(`   - Admin: ${admin.email}`)
  console.log(`   - Customers: ${customers.length} users`)
  console.log(`   - Owners: ${owners.length} users`)
  console.log(`   - Delivery Persons: ${deliveryPersons.length} users`)
  console.log('🏪 Created restaurants:', restaurants.map((r) => r.name).join(', '))
  console.log('📂 Created categories:', categories.length)
  console.log('🍽️ Created menu items:', menuItems.length)
  console.log('📦 Created orders:', orders.length)
  console.log('🚚 Created delivery persons:', deliveryProfiles.length)
  console.log('⭐ Created ratings:', ratings.length)
  console.log('🔔 Created notifications:', notifications.length)
  console.log('🛒 Created cart items:', cartItems.length)
  console.log('')
  console.log('🔑 Default passwords for all users:')
  console.log('   - Super Admin: SuperAdmin123!')
  console.log('   - Admin: Admin123!')
  console.log('   - Customers: Customer123!')
  console.log('   - Owners: Owner123!')
  console.log('   - Delivery: Delivery123!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })