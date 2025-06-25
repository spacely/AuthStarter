const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/database');

/**
 * Authentication middleware to protect routes
 */
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Access Denied',
                message: 'No authentication token provided'
            });
        }

        // Verify token
        const decoded = verifyToken(token);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                emailVerified: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid Token',
                message: 'User not found'
            });
        }

        // Attach user to request object
        req.user = user;
        next();

    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to ensure email is verified
 */
const requireEmailVerification = (req, res, next) => {
    if (!req.user.emailVerified) {
        return res.status(403).json({
            error: 'Email Verification Required',
            message: 'Please verify your email address before accessing this resource'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireEmailVerification
}; 