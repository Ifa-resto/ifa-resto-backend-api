import { PrismaClient } from '@prisma/client';
export declare class DatabaseService {
    private static instance;
    static getInstance(): PrismaClient;
    static disconnect(): Promise<void>;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
