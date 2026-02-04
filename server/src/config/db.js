import mongoose from 'mongoose';
import { MONGODB_URI } from './env.js';
import logger from '../utils/logger.js';

const connectDB = async () => {
    try {
        // Mongoose connection options
        const options = {
            serverSelectionTimeoutMS: 10000, // 10 seconds timeout
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(MONGODB_URI, options);

        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
        logger.info(`📊 Database: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            logger.error(`❌ MongoDB connection error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️  MongoDB disconnected');
        });

        return conn;
    } catch (error) {
        logger.error(`❌ MongoDB Connection Error: ${error.message}`);
        if (error.reason) {
            logger.error(`Reason: ${JSON.stringify(error.reason, null, 2)}`);
        }
        throw error; // Re-throw to be caught in server.js
    }
};

export default connectDB;
