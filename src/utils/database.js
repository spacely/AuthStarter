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

// Test database connection
const testConnection = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Database connected successfully');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('📝 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

        // Retry connection in Railway environment
        if (process.env.RAILWAY_ENVIRONMENT) {
            console.log('🔄 Retrying database connection in 5 seconds...');
            setTimeout(async () => {
                try {
                    await prisma.$connect();
                    console.log('✅ Database connected on retry');
                } catch (retryError) {
                    console.error('❌ Database retry failed:', retryError.message);
                }
            }, 5000);
        }
    }
};

// Test connection on startup
testConnection();

// Graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

module.exports = prisma; 