import dotenv from 'dotenv';
dotenv.config();

export default {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pollsystem',
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret',
    jwtExpiry: '7d'
};
