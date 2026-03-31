import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const connectionOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
};


export const redisCache = new Redis(connectionOptions);

redisCache.on('ready', () => {
    console.log('✅ Connected to Redis');
});

redisCache.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export const redisQueue = connectionOptions;

