import { Router } from 'express';
import { RestaurantController } from './restaurant.controller';
import { authenticateJWT, authorize } from '../../common/middleware/auth.middleware';
import { validateBody } from '../../common/middleware/validation.middleware';
import { createRestaurantSchema, updateRestaurantSchema } from '../../common/validation/restaurant.schema';
import { updateCategorySchema } from '../../common/validation/category.schema';
import { updateSchedulesSchema } from '../../common/validation/restaurantSchedule.schema';
import { updateMenuItemSchema } from '../../common/validation/menuItem.schema';

const router: Router = Router();

/**
 * @swagger
 * /api/restaurants:
 *   get:
 *     summary: Get all restaurants
 *     description: Retrieve all restaurants (public endpoint)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of restaurants per page
 *       - in: query
 *         name: cuisine
 *         schema:
 *           type: string
 *         description: Filter by cuisine type
 *       - in: query
 *         name: isOpen
 *         schema:
 *           type: boolean
 *         description: Filter by open status
 *     responses:
 *       200:
 *         description: Restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', RestaurantController.getAllRestaurants);

/**
 * @swagger
 * /api/restaurants/search:
 *   get:
 *     summary: Search restaurants
 *     description: Search restaurants by name, description, or cuisine (public endpoint)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of restaurants per page
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Search query is required
 */
router.get('/search', RestaurantController.searchRestaurants);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   get:
 *     summary: Get restaurant by ID
 *     description: Retrieve restaurant details by ID (public endpoint)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurant:
 *                       $ref: '#/components/schemas/Restaurant'
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id', RestaurantController.getRestaurantById);

/**
 * @swagger
 * /api/restaurants/{id}/menu:
 *   get:
 *     summary: Get restaurant menu
 *     description: Retrieve restaurant menu with categories and items (public endpoint)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant menu retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *       404:
 *         description: Restaurant not found
 */
router.get('/:id/menu', RestaurantController.getRestaurantMenu);

/**
 * @swagger
 * /api/restaurants/{id}/schedules:
 *   get:
 *     summary: Get restaurant schedules
 *     description: Retrieve restaurant opening schedules (public endpoint)
 *     tags: [Restaurants]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Schedules retrieved successfully
 */
router.get('/:id/schedules', RestaurantController.getSchedules);

// Protected routes
router.use(authenticateJWT);

/**
 * @swagger
 * /api/restaurants:
 *   post:
 *     summary: Create a new restaurant
 *     description: Create a new restaurant (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - cuisine
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cuisine:
 *                 type: string
 *               logo:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               deliveryTime:
 *                 type: integer
 *               deliveryFee:
 *                 type: number
 *                 format: float
 *               minimumOrder:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Restaurant created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurant:
 *                       $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Restaurant owner access required
 */
router.post('/', authorize(['RESTAURANT_OWNER']), validateBody(createRestaurantSchema), RestaurantController.createRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   put:
 *     summary: Update restaurant
 *     description: Update restaurant details (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cuisine:
 *                 type: string
 *               logo:
 *                 type: string
 *               coverImage:
 *                 type: string
 *               deliveryTime:
 *                 type: integer
 *               deliveryFee:
 *                 type: number
 *                 format: float
 *               minimumOrder:
 *                 type: number
 *                 format: float
 *               isOpen:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Restaurant updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurant:
 *                       $ref: '#/components/schemas/Restaurant'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Restaurant owner access required
 *       404:
 *         description: Restaurant not found
 */
router.put('/:id', authorize(['RESTAURANT_OWNER']), validateBody(updateRestaurantSchema), RestaurantController.updateRestaurant);

/**
 * @swagger
 * /api/restaurants/{id}:
 *   delete:
 *     summary: Delete restaurant
 *     description: Delete a restaurant (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Restaurant deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Restaurant owner access required
 *       404:
 *         description: Restaurant not found
 */
router.delete('/:id', authorize(['RESTAURANT_OWNER']), RestaurantController.deleteRestaurant);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/categories:
 *   post:
 *     summary: Add category to restaurant
 *     description: Add a new category to a restaurant (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Category added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     category:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Restaurant owner access required
 *       404:
 *         description: Restaurant not found
 */
router.post('/:restaurantId/categories', authorize(['RESTAURANT_OWNER']), RestaurantController.addCategory);
/**
 * @swagger
 * /api/restaurants/{restaurantId}/categories/{categoryId}:
 *   put:
 *     summary: Update category
 *     description: Update a restaurant category (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated successfully
 */
router.put('/:restaurantId/categories/:categoryId', authorize(['RESTAURANT_OWNER']), validateBody(updateCategorySchema), RestaurantController.updateCategory);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/categories/{categoryId}:
 *   delete:
 *     summary: Delete category
 *     description: Delete a restaurant category (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Category deleted successfully
 */
router.delete('/:restaurantId/categories/:categoryId', authorize(['RESTAURANT_OWNER']), RestaurantController.deleteCategory);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/schedules:
 *   put:
 *     summary: Update restaurant schedules
 *     description: Replace restaurant schedules (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                     openTime:
 *                       type: string
 *                       example: "10:00"
 *                     closeTime:
 *                       type: string
 *                       example: "22:00"
 *                     isOpen:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Schedules updated successfully
 */
router.put('/:restaurantId/schedules', authorize(['RESTAURANT_OWNER']), validateBody(updateSchedulesSchema), RestaurantController.updateSchedules);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/categories/{categoryId}/items:
 *   post:
 *     summary: Add menu item to category
 *     description: Add a new menu item to a category (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Restaurant ID
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               discountPrice:
 *                 type: number
 *                 format: float
 *               image:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               ingredients:
 *                 type: string
 *               allergens:
 *                 type: string
 *               preparationTime:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Menu item added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     menuItem:
 *                       $ref: '#/components/schemas/MenuItem'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Restaurant owner access required
 *       404:
 *         description: Restaurant or category not found
 */
router.post('/:restaurantId/categories/:categoryId/items', authorize(['RESTAURANT_OWNER']), RestaurantController.addMenuItem);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/items/{menuItemId}:
 *   put:
 *     summary: Update menu item
 *     description: Update a menu item (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               discountPrice:
 *                 type: number
 *               image:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               ingredients:
 *                 type: string
 *               allergens:
 *                 type: string
 *               preparationTime:
 *                 type: integer
 *               categoryId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menu item updated successfully
 */
router.put('/:restaurantId/items/:menuItemId', authorize(['RESTAURANT_OWNER']), validateBody(updateMenuItemSchema), RestaurantController.updateMenuItem);

/**
 * @swagger
 * /api/restaurants/{restaurantId}/items/{menuItemId}:
 *   delete:
 *     summary: Delete menu item
 *     description: Delete a menu item (Restaurant owner only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: menuItemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Menu item deleted successfully
 */
router.delete('/:restaurantId/items/:menuItemId', authorize(['RESTAURANT_OWNER']), RestaurantController.deleteMenuItem);

/**
 * @swagger
 * /api/restaurants/admin/all:
 *   get:
 *     summary: Get all restaurants (Admin)
 *     description: Retrieve all restaurants (Admin only)
 *     tags: [Restaurants]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All restaurants retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     restaurants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Restaurant'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/admin/all', authorize(['ADMIN']), RestaurantController.getAllRestaurants);

export default router;