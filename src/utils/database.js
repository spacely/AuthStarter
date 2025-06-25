const { PrismaClient } = require('@prisma/client');

// Validate DATABASE_URL is present
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
    errorFormat: 'pretty',
});

// Test database connection (async, non-blocking)
const testConnection = async () => {
    // Skip connection test if no DATABASE_URL (allows app to start)
    if (!process.env.DATABASE_URL) {
        console.log('⚠️  DATABASE_URL not found, skipping database connection test');
        return;
    }

    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
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

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = prisma; 