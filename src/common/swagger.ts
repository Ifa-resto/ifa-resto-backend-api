import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IFA Resto API',
      version: '1.0.0',
      description: 'API documentation for the IFA Resto food delivery platform',
    },
    servers: [
      {
        url: 'http://localhost:8000/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
            },
            role: {
              type: 'string',
              enum: ['CUSTOMER', 'RESTAURANT_OWNER', 'DELIVERY_PERSON', 'ADMIN', 'SUPER_ADMIN'],
            },
            emailVerified: {
              type: 'boolean',
            },
            isActive: {
              type: 'boolean',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            firstName: {
              type: 'string',
            },
            lastName: {
              type: 'string',
            },
            phoneNumber: {
              type: 'string',
            },
            avatar: {
              type: 'string',
            },
          },
        },
        Restaurant: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            profileId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            logo: {
              type: 'string',
            },
            coverImage: {
              type: 'string',
            },
            cuisine: {
              type: 'string',
            },
            rating: {
              type: 'number',
              format: 'float',
            },
            isOpen: {
              type: 'boolean',
            },
            deliveryTime: {
              type: 'integer',
            },
            deliveryFee: {
              type: 'number',
              format: 'float',
            },
            minimumOrder: {
              type: 'number',
              format: 'float',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            restaurantId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            isActive: {
              type: 'boolean',
            },
            sortOrder: {
              type: 'integer',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        MenuItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            restaurantId: {
              type: 'string',
              format: 'uuid',
            },
            categoryId: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
            },
            description: {
              type: 'string',
            },
            price: {
              type: 'number',
              format: 'float',
            },
            discountPrice: {
              type: 'number',
              format: 'float',
            },
            image: {
              type: 'string',
            },
            isAvailable: {
              type: 'boolean',
            },
            ingredients: {
              type: 'string',
            },
            allergens: {
              type: 'string',
            },
            preparationTime: {
              type: 'integer',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        DeliveryPerson: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            profileId: { type: 'string', format: 'uuid' },
            vehicleType: { type: 'string' },
            licenseNumber: { type: 'string' },
            isAvailable: { type: 'boolean' },
            currentLat: { type: 'number', format: 'float' },
            currentLng: { type: 'number', format: 'float' },
            rating: { type: 'number', format: 'float' },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            orderNumber: {
              type: 'string',
            },
            customerId: {
              type: 'string',
              format: 'uuid',
            },
            restaurantId: {
              type: 'string',
              format: 'uuid',
            },
            deliveryPersonId: {
              type: 'string',
              format: 'uuid',
            },
            status: {
              type: 'string',
              enum: [
                'PENDING',
                'CONFIRMED',
                'PREPARING',
                'READY_FOR_PICKUP',
                'PICKED_UP',
                'ON_THE_WAY',
                'DELIVERED',
                'CANCELLED',
                'REFUNDED',
              ],
            },
            subtotal: {
              type: 'number',
              format: 'float',
            },
            deliveryFee: {
              type: 'number',
              format: 'float',
            },
            taxAmount: {
              type: 'number',
              format: 'float',
            },
            totalAmount: {
              type: 'number',
              format: 'float',
            },
            paymentMethod: {
              type: 'string',
              enum: ['CASH', 'CARD', 'PAYPAL', 'STRIPE', 'MOBILE_PAYMENT'],
            },
            paymentStatus: {
              type: 'string',
              enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            },
            estimatedDelivery: {
              type: 'string',
              format: 'date-time',
            },
            actualDelivery: {
              type: 'string',
              format: 'date-time',
            },
            notes: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Payment: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            orderId: {
              type: 'string',
              format: 'uuid',
            },
            amount: {
              type: 'number',
              format: 'float',
            },
            method: {
              type: 'string',
              enum: ['CASH', 'CARD', 'PAYPAL', 'STRIPE', 'MOBILE_PAYMENT'],
            },
            status: {
              type: 'string',
              enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'],
            },
            transactionId: {
              type: 'string',
            },
            processedAt: {
              type: 'string',
              format: 'date-time',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Address: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            profileId: {
              type: 'string',
              format: 'uuid',
            },
            orderId: {
              type: 'string',
              format: 'uuid',
            },
            street: {
              type: 'string',
            },
            city: {
              type: 'string',
            },
            postalCode: {
              type: 'string',
            },
            country: {
              type: 'string',
            },
            latitude: {
              type: 'number',
              format: 'float',
            },
            longitude: {
              type: 'number',
              format: 'float',
            },
            isDefault: {
              type: 'boolean',
            },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            userId: {
              type: 'string',
              format: 'uuid',
            },
            menuItemId: {
              type: 'string',
              format: 'uuid',
            },
            quantity: {
              type: 'integer',
            },
            notes: {
              type: 'string',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/resources/*/routes.ts',
    './src/resources/*/order.routes.ts',
    './src/resources/*/restaurant.routes.ts',
    './src/resources/*/payment.routes.ts', 
    './src/resources/*/deliverer.routes.ts', 
    './src/resources/*/notification.routes.ts',
    './src/resources/*/rating.routes.ts',
    './src/resources/cart/routes.ts',
    './src/resources/admin/routes.ts'
  ], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);
export { specs, swaggerUi };