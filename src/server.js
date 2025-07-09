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
console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);

// Trust proxy for Railway
if (isRailway) {
    app.set('trust proxy', 1);
}

// Request timeout middleware (prevent hanging requests)
const timeout = require('connect-timeout');
app.use(timeout('30s')); // 30 second timeout

// Timeout error handler
app.use((req, res, next) => {
    if (!req.timedout) next();
});

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
    origin: true,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 5000, // increased from 1000 to 5000 requests per windowMs
    message: {
        error: 'Rate Limit Exceeded',
        message: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Body parsing middleware with size limits
app.use(express.json({ limit: '1mb' })); // Reduced from 10mb for performance
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health check endpoint (fastest possible response)
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'AuthStarter API is running',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/apps', appRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist'
    });
});

// Global error handler
app.use(errorHandler);

// Start server with keep-alive optimization
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AuthStarter API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`✅ Server ready to accept connections`);
});

// Server performance optimizations
server.keepAliveTimeout = 65000; // Keep connections alive longer
server.headersTimeout = 66000; // Headers timeout slightly longer than keep-alive

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`📴 ${signal} received, shutting down gracefully...`);
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app; 