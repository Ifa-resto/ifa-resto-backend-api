import { User, Profile } from '@prisma/client';
export interface CreateUserData {
    email: string;
    password: string;
    role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_PERSON';
    firstName: string;
    lastName: string;
    phone?: string;
}
export interface UpdateUserData {
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}
declare class UserService {
    private prisma;
    constructor();
    createUser(userData: CreateUserData): Promise<User & {
        profile: Profile;
    }>;
    getUserById(id: string): Promise<(User & {
        profile: Profile | null;
    }) | null>;
    getUserByEmail(email: string): Promise<(User & {
        profile: Profile | null;
    }) | null>;
    updateUser(id: string, updateData: UpdateUserData): Promise<User & {
        profile: Profile | null;
    }>;
    deleteUser(id: string): Promise<void>;
    getAllUsers(page?: number, limit?: number): Promise<{
        users: (User & {
            profile: Profile | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    updatePassword(id: string, newPassword: string): Promise<void>;
}
declare const _default: UserService;
export default _default;
