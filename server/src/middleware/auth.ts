import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

interface JwtPayload {
    userId: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            res.status(401).json({ message: 'Authentication required' });
            return;
        }

        const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

export const teacherOnly = (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (req.user?.role !== 'teacher') {
        res.status(403).json({ message: 'Access denied. Teachers only.' });
        return;
    }
    next();
};
