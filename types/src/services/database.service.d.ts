import { PrismaClient } from '@prisma/client';
declare class DatabaseService {
    private static instance;
    private prisma;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseService;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): PrismaClient;
    healthCheck(): Promise<boolean>;
    executeTransaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T>;
    isConnectionActive(): boolean;
}
declare const _default: DatabaseService;
export default _default;
