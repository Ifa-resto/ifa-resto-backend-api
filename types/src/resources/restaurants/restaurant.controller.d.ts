import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
export declare class RestaurantController {
    static createRestaurant(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getRestaurantById(req: Request, res: Response): Promise<void>;
    static getAllRestaurants(req: Request, res: Response): Promise<void>;
    static updateRestaurant(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteRestaurant(req: AuthenticatedRequest, res: Response): Promise<void>;
}
