export declare class RestaurantService {
    private prisma;
    constructor();
    createRestaurant(restaurantData: any, ownerId: string): Promise<{
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
    }>;
    getRestaurantById(id: string): Promise<{
        profile: {
            user: {
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
            userId: string;
            firstName: string;
            lastName: string;
            phoneNumber: string;
            avatar: string;
        };
        ratings: {
            id: string;
            createdAt: Date;
            userId: string;
            orderId: string;
            rating: number;
            restaurantId: string;
            comment: string;
        }[];
        categories: {
            id: string;
            name: string;
            description: string;
            isActive: boolean;
            restaurantId: string;
            sortOrder: number;
        }[];
        menus: {
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
        }[];
    } & {
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
    }>;
    getAllRestaurants(page?: number, limit?: number, filters?: {
        cuisine?: string;
        isOpen?: boolean;
    }): Promise<{
        restaurants: ({
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
            categories: {
                id: string;
                name: string;
                description: string;
                isActive: boolean;
                restaurantId: string;
                sortOrder: number;
            }[];
        } & {
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateRestaurant(id: string, data: any): Promise<{
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
    }>;
    deleteRestaurant(id: string): Promise<{
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
    }>;
    searchRestaurants(query: string, page?: number, limit?: number): Promise<{
        restaurants: ({
            profile: {
                id: string;
                userId: string;
                firstName: string;
                lastName: string;
                phoneNumber: string;
                avatar: string;
            };
            categories: {
                id: string;
                name: string;
                description: string;
                isActive: boolean;
                restaurantId: string;
                sortOrder: number;
            }[];
        } & {
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
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getRestaurantMenu(restaurantId: string): Promise<({
        menuItems: {
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
        }[];
    } & {
        id: string;
        name: string;
        description: string;
        isActive: boolean;
        restaurantId: string;
        sortOrder: number;
    })[]>;
    addMenuItem(restaurantId: string, categoryId: string, menuItemData: any): Promise<{
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
    }>;
    addCategory(restaurantId: string, categoryData: any): Promise<{
        id: string;
        name: string;
        description: string;
        isActive: boolean;
        restaurantId: string;
        sortOrder: number;
    }>;
}
declare const _default: RestaurantService;
export default _default;
