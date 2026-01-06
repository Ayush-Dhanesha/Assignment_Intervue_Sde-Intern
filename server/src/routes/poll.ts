import { Router, Response } from 'express';
import Poll from '../models/Poll';
import { auth, teacherOnly, AuthRequest } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();

router.post('/', auth, teacherOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { question, options, duration, correctIndex } = req.body;

        if (!question || !options || options.length < 2) {
            res.status(400).json({ message: 'Question and at least 2 options required' });
            return;
        }

        const pollOptions = options.map((text: string, index: number) => ({
            text,
            votes: 0,
            votedBy: [],
            isCorrect: index === correctIndex
        }));

        const poll = new Poll({
            question,
            options: pollOptions,
            duration: duration || 60,
            createdBy: req.user?._id
        });

        await poll.save();
        await poll.populate('createdBy', 'name');

        res.status(201).json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const polls = await Poll.find()
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });
        res.json(polls);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/active', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const poll = await Poll.findOne({ isActive: true })
            .populate('createdBy', 'name');
        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const poll = await Poll.findById(req.params.id)
            .populate('createdBy', 'name');
        
        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/start', auth, teacherOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        await Poll.updateMany({ isActive: true }, { isActive: false, endedAt: new Date() });

        const poll = await Poll.findByIdAndUpdate(
            req.params.id,
            { isActive: true, startedAt: new Date() },
            { new: true }
        ).populate('createdBy', 'name');

        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        const io = getIO();
        io.emit('pollStarted', poll);

        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/stop', auth, teacherOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const poll = await Poll.findByIdAndUpdate(
            req.params.id,
            { isActive: false, endedAt: new Date() },
            { new: true }
        ).populate('createdBy', 'name');

        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        const io = getIO();
        io.emit('pollEnded', poll);

        res.json(poll);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/vote', auth, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { optionIndex } = req.body;
        const userId = req.user?._id;

        const poll = await Poll.findById(req.params.id);
        
        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        if (!poll.isActive) {
            res.status(400).json({ message: 'Poll is not active' });
            return;
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            res.status(400).json({ message: 'Invalid option' });
            return;
        }

        const hasVoted = poll.options.some(opt => 
            opt.votedBy.some(id => id.toString() === userId?.toString())
        );

        if (hasVoted) {
            res.status(400).json({ message: 'Already voted' });
            return;
        }

        poll.options[optionIndex].votes += 1;
        poll.options[optionIndex].votedBy.push(userId!);
        await poll.save();

        const io = getIO();
        io.emit('voteUpdate', {
            pollId: poll._id,
            options: poll.options.map(opt => ({
                _id: opt._id,
                text: opt.text,
                votes: opt.votes,
                votedBy: opt.votedBy.map(id => id.toString())
            }))
        });

        res.json({ message: 'Vote recorded', poll });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', auth, teacherOnly, async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const poll = await Poll.findByIdAndDelete(req.params.id);
        
        if (!poll) {
            res.status(404).json({ message: 'Poll not found' });
            return;
        }

        const io = getIO();
        io.emit('pollDeleted', { pollId: poll._id });

        res.json({ message: 'Poll deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
