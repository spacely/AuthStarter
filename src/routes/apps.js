const express = require('express');
const prisma = require('../utils/database');
const { generateSecureToken } = require('../utils/jwt');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const registerAppSchema = Joi.object({
    name: Joi.string()
        .trim()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.min': 'App name is required',
            'string.max': 'App name must be less than 100 characters',
            'any.required': 'App name is required'
        }),
    domain: Joi.string()
        .uri({ scheme: ['http', 'https'] })
        .required()
        .messages({
            'string.uri': 'Domain must be a valid URL (http:// or https://)',
            'any.required': 'Domain is required'
        })
});

/**
 * POST /api/apps/register
 * Register a new app and get API key
 */
router.post('/register', async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = registerAppSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { name, domain } = value;

        // Check if domain already exists
        const existingApp = await prisma.app.findUnique({
            where: { domain: domain.toLowerCase() }
        });

        if (existingApp) {
            return res.status(400).json({
                error: 'Domain Already Registered',
                message: 'An app with this domain already exists'
            });
        }

        // Generate API key
        const apiKey = `app_${generateSecureToken()}`;

        // Create app
        const app = await prisma.app.create({
            data: {
                name: name.trim(),
                domain: domain.toLowerCase(),
                apiKey
            },
            select: {
                id: true,
                name: true,
                domain: true,
                apiKey: true,
                createdAt: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'App registered successfully',
            app
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/apps/verify
 * Verify API key and get app info
 */
router.get('/verify', async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                error: 'API Key Required',
                message: 'X-API-Key header is required'
            });
        }

        const app = await prisma.app.findUnique({
            where: { apiKey },
            select: {
                id: true,
                name: true,
                domain: true,
                createdAt: true,
                _count: {
                    select: { users: true }
                }
            }
        });

        if (!app) {
            return res.status(401).json({
                error: 'Invalid API Key',
                message: 'The provided API key is not valid'
            });
        }

        res.json({
            success: true,
            app: {
                ...app,
                userCount: app._count.users
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router; 