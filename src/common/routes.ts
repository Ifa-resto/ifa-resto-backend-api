import { Router } from 'express'
import userRouter from '../resources/users/routes'
import authRouter from '../resources/auth/routes'
import orderRouter from '../resources/orders/order.routes'
import restaurantRouter from '../resources/restaurants/restaurant.routes'
import delivererRouter from '../resources/deliverers/deliverer.routes'
import paymentRouter from '../resources/payments/payment.routes'
import notificationRouter from '../resources/notifications/notification.routes'
import cartRouter from '../resources/cart/routes'
import adminRouter from '../resources/admin/routes'
import ratingRouter from '../resources/ratings/rating.routes'
import gamificationRouter from '../resources/gamification/gamification.routes'

const router: Router = Router()

// Authentication routes
router.use('/api/auth', authRouter)

// User routes
router.use('/api/users', userRouter)

// Cart routes
router.use('/api/cart', cartRouter)

// Order routes
router.use('/api/orders', orderRouter)

// Restaurant routes
router.use('/api/restaurants', restaurantRouter)

// Deliverer routes
router.use('/api/deliverers', delivererRouter)

// Payment routes
router.use('/api/payments', paymentRouter)

// Notification routes
router.use('/api/notifications', notificationRouter)

// Admin routes
router.use('/api/admin', adminRouter)

// Ratings routes
router.use('/api/ratings', ratingRouter)

// Gamification routes
router.use('/api/gamification', gamificationRouter)

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

export default router