import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const connectionOptions = {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
};

export const redisCache = new Redis(connectionOptions);

export const redisQueue = connectionOptions;

