import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { FRONTEND_URL } from './config/env.js';
import routes from './routes.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Trust proxy for rate limiter
app.set('trust proxy', 1);

// Middlewares
app.use(cors({
    origin: FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use(errorMiddleware);

export default app;
