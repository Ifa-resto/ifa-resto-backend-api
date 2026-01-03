# IFA Resto API Architecture

## Overview

This document describes the architecture of the IFA Resto food delivery platform API. The API is built with Node.js, Express, TypeScript, and Prisma ORM.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL (with Prisma ORM)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Logging**: Pino
- **Testing**: Jest

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── common/                # Shared utilities and middleware
│   ├── middleware/        # Custom middleware
│   ├── validation/        # Validation schemas
│   ├── logger.ts          # Logging utility
│   ├── routes.ts          # Main router
│   └── swagger.ts         # Swagger configuration
├── config/                # Configuration files
├── middlewares/           # Application middleware
├── resources/             # API resources (modules)
│   ├── auth/              # Authentication module
│   ├── users/             # User management module
│   ├── orders/            # Order management module
│   ├── restaurants/       # Restaurant management module
│   ├── deliverers/        # Delivery person management module
│   ├── payments/          # Payment processing module
│   └── notifications/     # Notification system module
├── services/              # Business logic services
└── utils/                 # Utility functions
```

## Authentication & Authorization

### Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt
3. User logs in with email and password
4. Server validates credentials and generates JWT tokens:
   - Access Token (15 minutes)
   - Refresh Token (7 days)
5. Client stores tokens securely
6. Client includes Access Token in Authorization header for protected routes
7. When Access Token expires, client uses Refresh Token to get new tokens

### Role-Based Access Control

The system supports the following user roles:

- **CUSTOMER**: Can create orders, view their orders, update profile
- **RESTAURANT_OWNER**: Can manage restaurant, view/update orders for their restaurant
- **DELIVERY_PERSON**: Can view assigned orders, update delivery status
- **ADMIN**: Can manage all users, restaurants, orders
- **SUPER_ADMIN**: Full system access

Authorization is implemented using middleware that checks user roles against required permissions.

## API Modules

### Authentication Module (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password with token

### Users Module (`/api/users`)

- `GET /profile` - Get current user profile
- `PUT /profile` - Update current user profile
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID (Admin only)
- `PUT /:id` - Update user by ID (Admin only)
- `DELETE /:id` - Delete user by ID (Admin only)

### Orders Module (`/api/orders`)

- `POST /` - Create new order (Customer)
- `GET /my-orders` - Get current user's orders
- `GET /:id` - Get order by ID
- `PUT /:id/status` - Update order status (Restaurant Owner)
- `PUT /:id/delivery` - Update delivery status (Delivery Person)
- `GET /` - Get all orders (Admin)

### Restaurants Module (`/api/restaurants`)

- `GET /` - Get all restaurants (Public)
- `GET /:id` - Get restaurant by ID (Public)
- `POST /` - Create restaurant (Restaurant Owner)
- `PUT /:id` - Update restaurant (Restaurant Owner)
- `DELETE /:id` - Delete restaurant (Restaurant Owner)
- `GET /admin/all` - Get all restaurants (Admin)

### Deliverers Module (`/api/deliverers`)

- `GET /` - Get available deliverers (Public)
- `GET /:id` - Get deliverer by ID (Public)
- `PUT /location` - Update deliverer location (Delivery Person)
- `PUT /availability` - Update deliverer availability (Delivery Person)

### Payments Module (`/api/payments`)

- `POST /` - Process payment (Customer)
- `GET /:id` - Get payment by ID (Customer)
- `POST /:id/refund` - Refund payment (Admin)

### Notifications Module (`/api/notifications`)

- `GET /` - Get user notifications
- `PUT /:id/read` - Mark notification as read
- `DELETE /:id` - Delete notification

## Validation

All API endpoints use Zod for request validation. Validation schemas are defined in the `common/validation/` directory.

## Error Handling

Centralized error handling is implemented using a custom error middleware. All errors are logged and returned in a consistent format.

## Documentation

API documentation is available through Swagger UI at `/api-docs`.

## Security

- Helmet.js for HTTP headers security
- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention through Prisma ORM
- XSS prevention
- Secure JWT implementation

## Testing

The API includes unit tests using Jest. Tests are located in the `tests/` directory.

## Deployment

The application can be deployed using Docker. Environment variables are used for configuration.

## Environment Variables

- `PORT` - Server port
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT secret key
- `JWT_REFRESH_SECRET` - JWT refresh token secret
- `NODE_ENV` - Environment (development/production)