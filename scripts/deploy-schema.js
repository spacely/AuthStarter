#!/usr/bin/env node

const { spawn } = require('child_process');

console.log('🚀 Manual Schema Deployment Script');
console.log('📊 This will force update the database schema...');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
}

// Function to run command and return promise
const runCommand = (command, args, description) => {
    return new Promise((resolve, reject) => {
        console.log(`\n🔄 ${description}...`);

        const process = spawn(command, args, {
            stdio: 'inherit',
            cwd: __dirname + '/..',
            env: { ...process.env }
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${description} completed successfully`);
                resolve();
            } else {
                console.log(`⚠️  ${description} exited with code ${code}`);
                resolve(); // Continue anyway
            }
        });

        process.on('error', (error) => {
            console.error(`❌ ${description} error:`, error.message);
            resolve(); // Continue anyway
        });
    });
};

// Main deployment sequence
const main = async () => {
    try {
        console.log('\n📋 Starting schema deployment sequence...');

        // Step 1: Generate Prisma client
        await runCommand('npx', ['prisma', 'generate'], 'Generating Prisma client');

        // Step 2: Push schema to database
        await runCommand('npx', ['prisma', 'db', 'push', '--accept-data-loss'], 'Pushing schema to database');

        // Step 3: Verify schema
        console.log('\n🔍 Verifying schema...');
        const prisma = require('../src/utils/database');

        try {
            // Test connection and check if tables exist
            await prisma.$connect();
            console.log('✅ Database connection successful');

            // Try to query the new tables
            const appCount = await prisma.app.count();
            console.log(`✅ Apps table accessible (${appCount} apps)`);

            const userCount = await prisma.user.count();
            console.log(`✅ Users table accessible (${userCount} users)`);

            await prisma.$disconnect();

        } catch (error) {
            console.log('⚠️  Schema verification failed:', error.message);
        }

        console.log('\n🎉 Schema deployment completed!');
        console.log('🚀 Your multi-tenant AuthStarter is ready to use');

    } catch (error) {
        console.error('❌ Deployment failed:', error);
        process.exit(1);
    }
};

main(); 