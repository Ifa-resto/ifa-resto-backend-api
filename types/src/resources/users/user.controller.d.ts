import { Request, Response, NextFunction } from 'express';
declare class UserController {
    createUser(req: Request, res: Response, next: NextFunction): Promise<void>;
    getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllUsers(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
    getUserProfile(req: Request, res: Response): Promise<void>;
}
declare const _default: UserController;
export default _default;
