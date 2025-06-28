#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AuthStarter...');

const { checkDatabaseSchema, testDatabaseOperation } = require('./utils/databaseSetup');

// Function to run database setup
const setupDatabase = () => {
    return new Promise((resolve, reject) => {
        console.log('📊 Setting up database schema...');

        // Use db push without force-reset for safer updates
        const dbPush = spawn('npx', ['prisma', 'db', 'push', '--accept-data-loss'], {
            stdio: 'inherit',
            cwd: process.cwd(),
            env: { ...process.env }
        });

        dbPush.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Database schema setup completed successfully');
                resolve();
            } else {
                console.log(`⚠️  Database setup process exited with code ${code}`);
                console.log('🔄 Attempting alternative setup...');

                // Try generate as fallback
                const generate = spawn('npx', ['prisma', 'generate'], {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    env: { ...process.env }
                });

                generate.on('close', (genCode) => {
                    console.log(`📦 Prisma generate completed with code ${genCode}`);
                    resolve(); // Continue regardless
                });

                generate.on('error', (error) => {
                    console.log('⚠️  Generate error:', error.message);
                    resolve(); // Continue anyway
                });
            }
        });

        dbPush.on('error', (error) => {
            console.log('⚠️  Database setup error:', error.message);
            console.log('🔄 Continuing with server startup...');
            resolve(); // Continue even if setup fails
        });

        // Timeout after 60 seconds
        setTimeout(() => {
            dbPush.kill();
            console.log('⚠️  Database setup timeout, continuing...');
            resolve();
        }, 60000);
    });
};

// Function to start the server
const startServer = () => {
    console.log('🌐 Starting Express server...');

    const server = spawn('node', [path.join(__dirname, 'server.js')], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env }
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

        console.log('📊 Database URL found, proceeding with setup...');

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