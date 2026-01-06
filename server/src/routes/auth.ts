import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ message: 'Email already registered' });
            return;
        }

        const user = new User({ name, email, password, role });
        await user.save();

        const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
            expiresIn: '7d'
        });

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isKicked: user.isKicked
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user._id }, config.jwtSecret, {
            expiresIn: '7d'
        });

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isKicked: user.isKicked
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    res.json({
        user: {
            id: req.user?._id,
            name: req.user?.name,
            email: req.user?.email,
            role: req.user?.role,
            isKicked: req.user?.isKicked
        }
    });
});

export default router;
