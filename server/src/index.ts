import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/database';
import config from './config';
import { initSocket } from './socket';
import authRoutes from './routes/auth';
import pollRoutes from './routes/poll';
import studentRoutes from './routes/students';
import chatRoutes from './routes/chat';

const app = express();
const server = createServer(app);

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:3001',
    process.env.CLIENT_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

initSocket(server);

connectDB().then(() => {
    server.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
});
