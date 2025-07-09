const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const appRoutes = require('./routes/apps');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 8000;

// Railway-specific environment detection
const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🚂 Railway: ${isRailway ? 'Yes' : 'No'}`);
console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_BASE_URL || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 1000, // configurable limit, default 1000 requests per windowMs
    message: {
        error: 'Rate Limit Exceeded',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'AuthStarter API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/apps', appRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Global error handler
app.use(errorHandler);

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AuthStarter API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`✅ Server ready to accept connections`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 SIGTERM received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📴 SIGINT received, shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

module.exports = app; 