import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '../config';
import Poll from '../models/Poll';

let io: Server;

interface UserSocket extends Socket {
    userId?: string;
    userRole?: string;
}

export const initSocket = (server: HttpServer): Server => {
    io = new Server(server, {
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5173'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.use((socket: UserSocket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket: UserSocket) => {
        console.log('Client connected:', socket.id);

        socket.on('joinPoll', async (pollId: string) => {
            socket.join(`poll:${pollId}`);
            
            const poll = await Poll.findById(pollId);
            if (poll) {
                socket.emit('pollData', poll);
            }
        });

        socket.on('leavePoll', (pollId: string) => {
            socket.leave(`poll:${pollId}`);
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};
