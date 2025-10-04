const prisma = require('../utils/database');

/**
 * Middleware to authenticate apps using API keys
 * Adds the authenticated app to req.app
 */
const authenticateApp = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            return res.status(401).json({
                error: 'API Key Required',
                message: 'X-API-Key header is required'
            });
        }

        // Find app by API key
        const app = await prisma.app.findUnique({
            where: { apiKey },
            select: {
                id: true,
                name: true,
                domain: true,
                fromEmail: true,  // Custom verified sending email
                fromName: true,   // Custom display name for emails
                createdAt: true
            }
        });

        if (!app) {
            return res.status(401).json({
                error: 'Invalid API Key',
                message: 'The provided API key is not valid'
            });
        }

        // Attach app to request
        req.app = app;
        next();

    } catch (error) {
        console.error('App authentication error:', error);
        res.status(500).json({
            error: 'Authentication Error',
            message: 'Failed to authenticate app'
        });
    }
};

/**
 * Optional middleware - allows requests without API key for public endpoints
 * But if API key is provided, it must be valid
 */
const optionalAppAuth = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            // No API key provided, continue without app context
            req.app = null;
            return next();
        }

        // API key provided, must be valid
        return authenticateApp(req, res, next);

    } catch (error) {
        console.error('Optional app authentication error:', error);
        res.status(500).json({
            error: 'Authentication Error',
            message: 'Failed to authenticate app'
        });
    }
};

module.exports = {
    authenticateApp,
    optionalAppAuth
}; 