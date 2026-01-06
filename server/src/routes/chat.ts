import { Router, Response } from 'express';
import Chat from '../models/Chat';
import { auth, AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();

router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const messages = await Chat.find()
            .populate('sender', 'name role')
            .sort({ createdAt: -1 })
            .limit(100);
        res.json(messages.reverse());
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { message } = req.body;

        if (!message || message.trim().length === 0) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }

        const chat = new Chat({
            sender: req.user?._id,
            message: message.trim()
        });

        await chat.save();
        await chat.populate('sender', 'name role');

        const io = getIO();
        io.emit('newMessage', chat);

        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'teacher') {
            res.status(403).json({ message: 'Only teachers can clear chat' });
            return;
        }

        await Chat.deleteMany({});
        
        const io = getIO();
        io.emit('chatCleared');

        res.json({ message: 'Chat cleared' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
