#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AuthStarter...');

// Function to run database migration
const runMigration = () => {
    return new Promise((resolve, reject) => {
        console.log('📊 Running database migrations...');

        const migration = spawn('npx', ['prisma', 'migrate', 'deploy'], {
            stdio: 'inherit',
            cwd: process.cwd()
        });

        migration.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Database migrations completed successfully');
                resolve();
            } else {
                console.log(`⚠️  Migration process exited with code ${code}, continuing anyway...`);
                resolve(); // Continue even if migration fails
            }
        });

        migration.on('error', (error) => {
            console.log('⚠️  Migration error:', error.message);
            resolve(); // Continue even if migration fails
        });

        // Timeout after 30 seconds
        setTimeout(() => {
            migration.kill();
            console.log('⚠️  Migration timeout, continuing...');
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

        // Run migration first
        await runMigration();

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