const { PrismaClient } = require('@prisma/client');

// Validate DATABASE_URL is present
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

// Production-optimized Prisma configuration
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    errorFormat: 'pretty',
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    // Connection pool configuration for production performance
    __internal: {
        engine: {
            // Connection pool settings
            connection_limit: parseInt(process.env.DB_CONNECTION_LIMIT) || 20,
            pool_timeout: parseInt(process.env.DB_POOL_TIMEOUT) || 10,
            // Query timeout to prevent hanging
            query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30,
            // Enable connection pooling
            schema_cache_size: 100,
        },
    },
});

// Test database connection with timeout (async, non-blocking)
const testConnection = async () => {
    // Skip connection test if no DATABASE_URL (allows app to start)
    if (!process.env.DATABASE_URL) {
        console.log('⚠️  DATABASE_URL not found, skipping database connection test');
        return;
    }

    try {
        // Set a connection timeout
        const connectionPromise = prisma.$connect();
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );

        await Promise.race([connectionPromise, timeoutPromise]);

        // Quick health check
        await prisma.$queryRaw`SELECT 1`;

        console.log('✅ Database connected successfully with connection pooling');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('📝 DATABASE_URL:', process.env.DATABASE_URL ? 'Set but invalid' : 'Not set');

        // Retry connection in Railway environment (don't block startup)
        const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID;
        if (isRailway) {
            console.log('🔄 Will retry database connection in background...');
            setTimeout(async () => {
                try {
                    await prisma.$connect();
                    console.log('✅ Database connected on retry');
                } catch (retryError) {
                    console.error('⚠️  Database retry failed, but app continues running');
                }
            }, 10000); // Wait 10 seconds before retry
        }
    }
};

// Test connection on startup (non-blocking)
setTimeout(testConnection, 1000);

// Graceful shutdown with proper cleanup
const gracefulShutdown = async () => {
    console.log('🔄 Closing database connections...');
    try {
        await prisma.$disconnect();
        console.log('✅ Database connections closed');
    } catch (error) {
        console.error('⚠️  Error closing database connections:', error);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

module.exports = prisma; 