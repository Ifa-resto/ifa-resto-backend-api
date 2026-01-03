import { PrismaClient } from '@prisma/client';
declare class DBService {
    private static databaseService;
    static connect(): Promise<void>;
    static disconnect(): Promise<void>;
    static getClient(): PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
    static healthCheck(): Promise<boolean>;
    static executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
    static isConnectionActive(): boolean;
}
export default DBService;
