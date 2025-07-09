const { PrismaClient } = require('@prisma/client');

// Validate DATABASE_URL is present
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

// Optimize DATABASE_URL for production performance with connection pooling
let optimizedDatabaseUrl = process.env.DATABASE_URL;

// Add connection pooling parameters if not already present
if (!optimizedDatabaseUrl.includes('connection_limit') && !optimizedDatabaseUrl.includes('pool_timeout')) {
    const separator = optimizedDatabaseUrl.includes('?') ? '&' : '?';
    const poolingParams = [
        'connection_limit=20',
        'pool_timeout=10',
        'schema_cache_size=1000',
        'connect_timeout=30'
    ].join('&');

    optimizedDatabaseUrl = `${optimizedDatabaseUrl}${separator}${poolingParams}`;
    console.log('✅ Added connection pooling parameters to DATABASE_URL');
}

// Production-optimized Prisma configuration with proper connection pooling
const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    errorFormat: 'pretty',
    datasources: {
        db: {
            url: optimizedDatabaseUrl,
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

        // Quick health check with timeout
        const healthPromise = prisma.$queryRaw`SELECT 1 as health_check`;
        const healthTimeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Health check timeout')), 2000)
        );

        await Promise.race([healthPromise, healthTimeoutPromise]);

        console.log('✅ Database connected successfully with connection pooling enabled');
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