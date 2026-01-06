import { Router, Response } from 'express';
import User from '../models/User';
import { auth, teacherOnly, AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();

router.get('/', auth, teacherOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name email isKicked createdAt')
            .sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/kick', auth, teacherOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const student = await User.findByIdAndUpdate(
            req.params.id,
            { isKicked: true },
            { new: true }
        ).select('name email isKicked');

        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        const io = getIO();
        io.emit('studentKicked', { 
            userId: student._id.toString(),
            studentId: student._id.toString()
        });

        res.json({ message: 'Student kicked', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/unkick', auth, teacherOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const student = await User.findByIdAndUpdate(
            req.params.id,
            { isKicked: false },
            { new: true }
        ).select('name email isKicked');

        if (!student) {
            res.status(404).json({ message: 'Student not found' });
            return;
        }

        res.json({ message: 'Student restored', student });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
