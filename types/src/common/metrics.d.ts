import promClient from 'prom-client';
export declare const httpRequestDuration: promClient.Histogram<"method" | "route" | "status_code">;
export declare const activeConnections: promClient.Gauge<string>;
export declare const orderMetrics: promClient.Counter<"status" | "restaurant_id">;
