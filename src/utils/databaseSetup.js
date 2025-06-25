const { PrismaClient } = require('@prisma/client');

/**
 * Check if the database has the required tables and schema
 */
const checkDatabaseSchema = async () => {
    const prisma = new PrismaClient();

    try {
        // Test 1: Check if users table exists and has expected structure
        const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND table_schema = 'public'
    `;

        await prisma.$disconnect();

        // If we have the users table with expected columns
        if (result.length > 0) {
            console.log(`✅ Found users table with ${result.length} columns`);

            // Check for key columns
            const columns = result.map(col => col.column_name);
            const requiredColumns = ['id', 'email', 'password', 'emailVerified'];
            const hasRequiredColumns = requiredColumns.every(col => columns.includes(col));

            if (hasRequiredColumns) {
                console.log('✅ Database schema appears complete');
                return { exists: true, needsSetup: false };
            } else {
                console.log('⚠️  Users table exists but missing required columns');
                return { exists: true, needsSetup: true };
            }
        }

        return { exists: false, needsSetup: true };

    } catch (error) {
        await prisma.$disconnect();

        // Error could mean database not ready, table doesn't exist, or connection issues
        if (error.code === 'P1001') {
            console.log('❌ Cannot connect to database');
            return { exists: false, needsSetup: false, connectionError: true };
        }

        console.log('📊 Database schema check failed, assuming setup needed');
        return { exists: false, needsSetup: true };
    }
};

/**
 * Test a simple database operation to verify everything works
 */
const testDatabaseOperation = async () => {
    const prisma = new PrismaClient();

    try {
        // Try a simple count operation
        const userCount = await prisma.user.count();
        await prisma.$disconnect();

        console.log(`✅ Database test successful (${userCount} users)`);
        return true;

    } catch (error) {
        await prisma.$disconnect();
        console.log('❌ Database test failed:', error.message);
        return false;
    }
};

module.exports = {
    checkDatabaseSchema,
    testDatabaseOperation
}; 