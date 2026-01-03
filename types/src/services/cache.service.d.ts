declare class CacheService {
    private redis;
    constructor();
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
}
export declare const cacheService: CacheService;
export {};
