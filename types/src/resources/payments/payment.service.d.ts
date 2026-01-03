import { PaymentMethod, PaymentStatus } from '@prisma/client';
export declare class PaymentService {
    private prisma;
    constructor();
    processPayment(paymentData: any, userId: string): Promise<{
        id: string;
        method: import(".prisma/client").$Enums.PaymentMethod;
        status: import(".prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        transactionId: string;
        processedAt: Date;
    }>;
    getPaymentById(paymentId: string, userId?: string): Promise<{
        order: {
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
        };
    } & {
        id: string;
        method: import(".prisma/client").$Enums.PaymentMethod;
        status: import(".prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        transactionId: string;
        processedAt: Date;
    }>;
    refundPayment(paymentId: string, reason?: string): Promise<{
        id: string;
        method: import(".prisma/client").$Enums.PaymentMethod;
        status: import(".prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        transactionId: string;
        processedAt: Date;
    }>;
    getPaymentsByUser(userId: string, page?: number, limit?: number): Promise<{
        payments: ({
            order: {
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
            };
        } & {
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            transactionId: string;
            processedAt: Date;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getPaymentsForAdmin(page?: number, limit?: number, filters?: {
        status?: PaymentStatus;
        method?: PaymentMethod;
    }): Promise<{
        payments: ({
            order: {
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
            };
        } & {
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            status: import(".prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            transactionId: string;
            processedAt: Date;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
}
declare const _default: PaymentService;
export default _default;
