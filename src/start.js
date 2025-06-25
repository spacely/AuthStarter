#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AuthStarter...');

const { checkDatabaseSchema, testDatabaseOperation } = require('./utils/databaseSetup');

// Function to run database setup
const setupDatabase = () => {
    return new Promise(async (resolve, reject) => {
        console.log('📊 Checking database state...');

        // Check database schema status
        const schemaStatus = await checkDatabaseSchema();

        if (schemaStatus.connectionError) {
            console.log('❌ Database connection failed, skipping setup');
            resolve();
            return;
        }

        if (schemaStatus.exists && !schemaStatus.needsSetup) {
            console.log('✅ Database schema already exists and is complete, skipping setup');

            // Test that operations work
            const testPassed = await testDatabaseOperation();
            if (testPassed) {
                console.log('✅ Database is ready for use');
            } else {
                console.log('⚠️  Database exists but operations failed');
            }

            resolve();
            return;
        }

        if (schemaStatus.exists && schemaStatus.needsSetup) {
            console.log('⚠️  Database exists but schema is incomplete, will update');
        }

        console.log('📊 Setting up database schema...');

        // Use db push for fresh database setup
        const dbPush = spawn('npx', ['prisma', 'db', 'push', '--force-reset'], {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        dbPush.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Database schema setup completed successfully');
                resolve();
            } else {
                console.log(`⚠️  Database setup process exited with code ${code}, continuing anyway...`);
                resolve(); // Continue even if setup fails
            }
        });

        dbPush.on('error', (error) => {
            console.log('⚠️  Database setup error:', error.message);
            resolve(); // Continue even if setup fails
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            dbPush.kill();
            console.log('⚠️  Database setup timeout, continuing...');
            resolve();
        }, 30000);
    });
};

// Function to start the server
const startServer = () => {
    console.log('🌐 Starting Express server...');

    const server = spawn('node', [path.join(__dirname, 'server.js')], {
        stdio: 'inherit',
        cwd: process.cwd()
    });

    server.on('error', (error) => {
        console.error('❌ Server error:', error);
        process.exit(1);
    });

    server.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
        process.exit(code);
    });
};

// Main startup sequence
const main = async () => {
    try {
        // Check if DATABASE_URL is available
        if (!process.env.DATABASE_URL) {
            console.log('⚠️  DATABASE_URL not found, starting server without migration...');
            startServer();
            return;
        }

        // Setup database first
        await setupDatabase();

        // Start the server
        startServer();

    } catch (error) {
        console.error('❌ Startup error:', error);
        console.log('🔄 Starting server anyway...');
        startServer();
    }
};

// Handle process signals
process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

main(); 