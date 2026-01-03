export declare class OrderService {
    private prisma;
    constructor();
    createOrder(orderData: any, customerId: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            description: string;
            profileId: string;
            logo: string;
            coverImage: string;
            cuisine: string;
            rating: number;
            isOpen: boolean;
            deliveryTime: number;
            deliveryFee: number;
            minimumOrder: number;
        };
        deliveryAddress: {
            id: string;
            country: string;
            profileId: string;
            orderId: string;
            street: string;
            city: string;
            postalCode: string;
            latitude: number;
            longitude: number;
            isDefault: boolean;
        };
        customer: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            password: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    }>;
    getOrderById(orderId: string, userId?: string, userRole?: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            description: string;
            profileId: string;
            logo: string;
            coverImage: string;
            cuisine: string;
            rating: number;
            isOpen: boolean;
            deliveryTime: number;
            deliveryFee: number;
            minimumOrder: number;
        };
        deliveryAddress: {
            id: string;
            country: string;
            profileId: string;
            orderId: string;
            street: string;
            city: string;
            postalCode: string;
            latitude: number;
            longitude: number;
            isDefault: boolean;
        };
        customer: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            password: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
        tracking: {
            location: string;
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderId: string;
            notes: string;
            timestamp: Date;
        }[];
        payments: {
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            transactionId: string;
            processedAt: Date;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    }>;
    getOrdersByUser(userId: string): Promise<({
        restaurant: {
            id: string;
            name: string;
            description: string;
            profileId: string;
            logo: string;
            coverImage: string;
            cuisine: string;
            rating: number;
            isOpen: boolean;
            deliveryTime: number;
            deliveryFee: number;
            minimumOrder: number;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
        tracking: {
            location: string;
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderId: string;
            notes: string;
            timestamp: Date;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    })[]>;
    getOrdersForRestaurant(restaurantId: string): Promise<({
        customer: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            password: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
        tracking: {
            location: string;
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderId: string;
            notes: string;
            timestamp: Date;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    })[]>;
    getOrdersForDeliveryPerson(deliveryPersonId: string): Promise<({
        restaurant: {
            id: string;
            name: string;
            description: string;
            profileId: string;
            logo: string;
            coverImage: string;
            cuisine: string;
            rating: number;
            isOpen: boolean;
            deliveryTime: number;
            deliveryFee: number;
            minimumOrder: number;
        };
        deliveryAddress: {
            id: string;
            country: string;
            profileId: string;
            orderId: string;
            street: string;
            city: string;
            postalCode: string;
            latitude: number;
            longitude: number;
            isDefault: boolean;
        };
        customer: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            password: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
        tracking: {
            location: string;
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderId: string;
            notes: string;
            timestamp: Date;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    })[]>;
    getOrdersForAdmin(page?: number, limit?: number, filters?: {
        status?: string;
        restaurantId?: string;
    }): Promise<{
        orders: ({
            restaurant: {
                id: string;
                name: string;
                description: string;
                profileId: string;
                logo: string;
                coverImage: string;
                cuisine: string;
                rating: number;
                isOpen: boolean;
                deliveryTime: number;
                deliveryFee: number;
                minimumOrder: number;
            };
            customer: {
                profile: {
                    id: string;
                    userId: string;
                    firstName: string;
                    lastName: string;
                    phoneNumber: string;
                    avatar: string;
                };
            } & {
                id: string;
                role: import(".prisma/client").$Enums.UserRole;
                email: string;
                password: string;
                emailVerified: boolean;
                isActive: boolean;
                lastLogin: Date;
                createdAt: Date;
                updatedAt: Date;
            };
            items: ({
                menuItem: {
                    id: string;
                    name: string;
                    image: string;
                    description: string;
                    restaurantId: string;
                    categoryId: string;
                    price: number;
                    discountPrice: number;
                    isAvailable: boolean;
                    ingredients: string;
                    allergens: string;
                    preparationTime: number;
                };
            } & {
                id: string;
                orderId: string;
                notes: string;
                menuItemId: string;
                quantity: number;
                unitPrice: number;
                totalPrice: number;
            })[];
            tracking: {
                location: string;
                id: string;
                status: import(".prisma/client").$Enums.OrderStatus;
                orderId: string;
                notes: string;
                timestamp: Date;
            }[];
        } & {
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            createdAt: Date;
            updatedAt: Date;
            deliveryFee: number;
            restaurantId: string;
            orderNumber: string;
            customerId: string;
            deliveryPersonId: string;
            subtotal: number;
            taxAmount: number;
            totalAmount: number;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
            paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
            estimatedDelivery: Date;
            actualDelivery: Date;
            notes: string;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateOrderStatus(orderId: string, status: string, userId?: string, userRole?: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            description: string;
            profileId: string;
            logo: string;
            coverImage: string;
            cuisine: string;
            rating: number;
            isOpen: boolean;
            deliveryTime: number;
            deliveryFee: number;
            minimumOrder: number;
        };
        customer: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            password: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    }>;
    assignDeliveryPerson(orderId: string, deliveryPersonId: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            description: string;
            profileId: string;
            logo: string;
            coverImage: string;
            cuisine: string;
            rating: number;
            isOpen: boolean;
            deliveryTime: number;
            deliveryFee: number;
            minimumOrder: number;
        };
        deliveryPerson: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            profileId: string;
            rating: number;
            isAvailable: boolean;
            vehicleType: string;
            licenseNumber: string;
            currentLat: number;
            currentLng: number;
        };
        customer: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            password: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    }>;
    getOrderByOrderNumber(orderNumber: string): Promise<{
        restaurant: {
            id: string;
            name: string;
            description: string;
            profileId: string;
            logo: string;
            coverImage: string;
            cuisine: string;
            rating: number;
            isOpen: boolean;
            deliveryTime: number;
            deliveryFee: number;
            minimumOrder: number;
        };
        deliveryAddress: {
            id: string;
            country: string;
            profileId: string;
            orderId: string;
            street: string;
            city: string;
            postalCode: string;
            latitude: number;
            longitude: number;
            isDefault: boolean;
        };
        customer: {
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
        } & {
            id: string;
            role: import(".prisma/client").$Enums.UserRole;
            email: string;
            password: string;
            emailVerified: boolean;
            isActive: boolean;
            lastLogin: Date;
            createdAt: Date;
            updatedAt: Date;
        };
        items: ({
            menuItem: {
                id: string;
                name: string;
                image: string;
                description: string;
                restaurantId: string;
                categoryId: string;
                price: number;
                discountPrice: number;
                isAvailable: boolean;
                ingredients: string;
                allergens: string;
                preparationTime: number;
            };
        } & {
            id: string;
            orderId: string;
            notes: string;
            menuItemId: string;
            quantity: number;
            unitPrice: number;
            totalPrice: number;
        })[];
        tracking: {
            location: string;
            id: string;
            status: import(".prisma/client").$Enums.OrderStatus;
            orderId: string;
            notes: string;
            timestamp: Date;
        }[];
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderStatus;
        createdAt: Date;
        updatedAt: Date;
        deliveryFee: number;
        restaurantId: string;
        orderNumber: string;
        customerId: string;
        deliveryPersonId: string;
        subtotal: number;
        taxAmount: number;
        totalAmount: number;
        paymentMethod: import(".prisma/client").$Enums.PaymentMethod;
        paymentStatus: import(".prisma/client").$Enums.PaymentStatus;
        estimatedDelivery: Date;
        actualDelivery: Date;
        notes: string;
    }>;
}
declare const _default: OrderService;
export default _default;
