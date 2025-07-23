const express = require('express');
const prisma = require('../utils/database');
const { execSync } = require('child_process');

const router = express.Router();

/**
 * POST /api/debug/fix-prisma-client
 * Regenerate Prisma Client (Safe - No Database Changes)
 */
router.post('/fix-prisma-client', async (req, res) => {
    const result = {
        timestamp: new Date().toISOString(),
        steps: {},
        summary: {}
    };

    try {
        // Step 1: Generate Prisma Client
        result.steps.generate = 'Starting...';

        try {
            execSync('npx prisma generate', { stdio: 'pipe' });
            result.steps.generate = 'Success';
        } catch (error) {
            result.steps.generate = `Failed: ${error.message}`;
            throw error;
        }

        // Step 2: Test new client
        result.steps.testConnection = 'Testing...';

        // Force require the newly generated client
        delete require.cache[require.resolve('@prisma/client')];
        const { PrismaClient } = require('@prisma/client');
        const newPrisma = new PrismaClient();

        await newPrisma.$connect();
        result.steps.testConnection = 'Success';

        // Step 3: Test tables
        result.steps.testTables = 'Testing...';

        const appCount = await newPrisma.app.count();
        const userCount = await newPrisma.user.count();

        result.steps.testTables = 'Success';
        result.summary = {
            appsFound: appCount,
            usersFound: userCount,
            tablesAccessible: true
        };

        await newPrisma.$disconnect();

        res.json({
            success: true,
            message: 'Prisma Client regenerated successfully',
            result
        });

    } catch (error) {
        result.steps.error = error.message;

        res.status(500).json({
            success: false,
            message: 'Failed to regenerate Prisma Client',
            result,
            error: error.message
        });
    }
});

/**
 * GET /api/debug/database
 * Debug database connection and list apps
 */
router.get('/database', async (req, res) => {
    const debug = {
        timestamp: new Date().toISOString(),
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
        results: {}
    };

    try {
        // Test connection
        debug.results.connection = 'Testing...';
        await prisma.$connect();
        debug.results.connection = 'Success';

        // Test basic query
        debug.results.basicQuery = 'Testing...';
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        debug.results.basicQuery = 'Success';

        // Check if apps table exists and count
        debug.results.appsTable = 'Testing...';
        try {
            const appCount = await prisma.app.count();
            debug.results.appsTable = `Success - ${appCount} apps found`;
            debug.results.appCount = appCount;
        } catch (error) {
            debug.results.appsTable = `Error: ${error.message}`;
            debug.results.appTableError = error.code;

            // Try to list all tables
            try {
                const tables = await prisma.$queryRaw`
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                `;
                debug.results.availableTables = tables.map(t => t.table_name);
            } catch (tableError) {
                debug.results.tableListError = tableError.message;
            }
        }

        // List all apps if table exists
        if (debug.results.appCount !== undefined) {
            debug.results.apps = 'Fetching...';
            const apps = await prisma.app.findMany({
                select: {
                    id: true,
                    name: true,
                    domain: true,
                    apiKey: true,
                    createdAt: true,
                    _count: {
                        select: { users: true }
                    }
                }
            });

            debug.results.apps = apps.map(app => ({
                name: app.name,
                domain: app.domain,
                apiKeyPrefix: app.apiKey.substring(0, 20) + '...',
                userCount: app._count.users,
                createdAt: app.createdAt
            }));
        }

        // Check users table too
        try {
            const userCount = await prisma.user.count();
            debug.results.userCount = userCount;
        } catch (error) {
            debug.results.userTableError = error.message;
        }

        res.json({
            success: true,
            debug
        });

    } catch (error) {
        debug.results.error = error.message;
        debug.results.errorCode = error.code;

        res.status(500).json({
            success: false,
            debug,
            error: error.message
        });
    }
});

/**
 * POST /api/debug/test-app-creation
 * Test app creation without actually creating
 */
router.post('/test-app-creation', async (req, res) => {
    try {
        const { name, domain } = req.body;

        if (!name || !domain) {
            return res.status(400).json({
                error: 'Name and domain required for test'
            });
        }

        // Check if domain already exists
        const existing = await prisma.app.findUnique({
            where: { domain: domain.toLowerCase() }
        });

        const result = {
            wouldCreate: true,
            testData: { name, domain: domain.toLowerCase() },
            domainExists: !!existing
        };

        if (existing) {
            result.existingApp = {
                id: existing.id,
                name: existing.name,
                createdAt: existing.createdAt
            };
            result.wouldCreate = false;
        }

        res.json({
            success: true,
            result
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/debug/schema-check
 * Check if database schema is deployed
 */
router.get('/schema-check', async (req, res) => {
    try {
        const schemaCheck = {
            timestamp: new Date().toISOString(),
            tables: {},
            issues: []
        };

        // Check each table from our schema
        const expectedTables = ['apps', 'users'];

        for (const tableName of expectedTables) {
            try {
                const count = await prisma[tableName].count();
                schemaCheck.tables[tableName] = {
                    exists: true,
                    count: count
                };
            } catch (error) {
                schemaCheck.tables[tableName] = {
                    exists: false,
                    error: error.message,
                    errorCode: error.code
                };
                schemaCheck.issues.push(`Table '${tableName}' missing or inaccessible`);
            }
        }

        // Check table structure
        try {
            const appsColumns = await prisma.$queryRaw`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns 
                WHERE table_name = 'apps' AND table_schema = 'public'
                ORDER BY ordinal_position
            `;
            schemaCheck.appsTableStructure = appsColumns;
        } catch (error) {
            schemaCheck.schemaQueryError = error.message;
        }

        const hasIssues = schemaCheck.issues.length > 0;

        res.json({
            success: !hasIssues,
            schemaDeployed: !hasIssues,
            schemaCheck
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            suggestion: 'Run schema deployment: npm run prisma:push'
        });
    }
});

module.exports = router; 