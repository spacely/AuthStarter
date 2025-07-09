const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../utils/database');
const { generateToken, generateSecureToken } = require('../utils/jwt');
const { sendWelcomeEmail, sendPasswordResetEmail, sendMagicLinkEmail } = require('../utils/email');
const { authenticateApp } = require('../middleware/appAuth');
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    magicLinkSchema,
    verifyMagicLinkSchema
} = require('../validation/schemas');

const router = express.Router();

// Apply app authentication to all auth routes
router.use(authenticateApp);

/**
 * POST /api/auth/register
 * Register a new user and send verification email
 */
router.post('/register', async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { email, password, firstName, lastName } = value;

        // Check if user already exists in this app
        const existingUser = await prisma.user.findUnique({
            where: {
                email_appId: {
                    email: email.toLowerCase(),
                    appId: req.app.id
                }
            }
        });

        if (existingUser) {
            return res.status(400).json({
                error: 'User Already Exists',
                message: 'A user with this email address already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Generate email verification token
        const verificationToken = generateSecureToken();
        const verificationExpires = new Date(Date.now() + parseInt(process.env.EMAIL_VERIFICATION_EXPIRES || 60) * 60 * 1000);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
                appId: req.app.id,
                emailVerificationToken: verificationToken,
                emailVerificationExpires: verificationExpires
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                emailVerified: true,
                createdAt: true
            }
        });

        // Send welcome email with verification link
        try {
            await sendWelcomeEmail(user.email, user.firstName, verificationToken, req.app.domain, req.app.name);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
            user
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { email, password } = value;

        // Find user in this app
        const user = await prisma.user.findUnique({
            where: {
                email_appId: {
                    email: email.toLowerCase(),
                    appId: req.app.id
                }
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Invalid email or password'
            });
        }

        // Check if user has a password (magic link only users don't)
        if (!user.password) {
            return res.status(401).json({
                error: 'Password Not Set',
                message: 'This account uses magic link authentication. Please request a magic link to sign in.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid Credentials',
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        // Return user data (excluding password) and token
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/forgot
 * Send password reset email
 */
router.post('/forgot', async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = forgotPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { email } = value;

        // Find user in this app
        const user = await prisma.user.findUnique({
            where: {
                email_appId: {
                    email: email.toLowerCase(),
                    appId: req.app.id
                }
            }
        });

        // Always return success for security (don't reveal if email exists)
        if (!user) {
            return res.json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent.'
            });
        }

        // Generate reset token
        const resetToken = generateSecureToken();
        const resetExpires = new Date(Date.now() + parseInt(process.env.PASSWORD_RESET_EXPIRES || 30) * 60 * 1000);

        // Update user with reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: resetToken,
                passwordResetExpires: resetExpires
            }
        });

        // Send password reset email
        try {
            await sendPasswordResetEmail(user.email, user.firstName, resetToken, req.app.domain, req.app.name);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            return res.status(500).json({
                error: 'Email Error',
                message: 'Failed to send password reset email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'If an account with that email exists, a password reset link has been sent.'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/reset
 * Reset password using token
 */
router.post('/reset', async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = resetPasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { token, password } = value;

        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid Token',
                message: 'Password reset token is invalid or has expired'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update user password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpires: null
            }
        });

        res.json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/auth/verify
 * Verify email address using token
 */
router.get('/verify', async (req, res, next) => {
    try {
        const { token } = req.query;

        // Validate token
        const { error } = verifyEmailSchema.validate({ token });
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Verification token is required'
            });
        }

        // Find user with valid verification token
        const user = await prisma.user.findFirst({
            where: {
                emailVerificationToken: token,
                emailVerificationExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid Token',
                message: 'Email verification token is invalid or has expired'
            });
        }

        // Update user as verified and clear verification token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationExpires: null
            }
        });

        res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/magic-link
 * Send magic link for passwordless authentication
 */
router.post('/magic-link', async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = magicLinkSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { email, firstName, lastName } = value;

        // Generate magic link token
        const magicToken = generateSecureToken();
        const magicExpires = new Date(Date.now() + parseInt(process.env.MAGIC_LINK_EXPIRES || 15) * 60 * 1000);

        // Check if user exists in this app
        let user = await prisma.user.findUnique({
            where: {
                email_appId: {
                    email: email.toLowerCase(),
                    appId: req.app.id
                }
            }
        });

        let isNewUser = false;

        if (!user) {
            // Create new user with magic link token (no password required)
            user = await prisma.user.create({
                data: {
                    email: email.toLowerCase(),
                    firstName: firstName?.trim(),
                    lastName: lastName?.trim(),
                    appId: req.app.id,
                    emailVerified: true, // Auto-verify for magic link users
                    magicLinkToken: magicToken,
                    magicLinkExpires: magicExpires
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    emailVerified: true,
                    createdAt: true
                }
            });
            isNewUser = true;
        } else {
            // Update existing user with magic link token
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    magicLinkToken: magicToken,
                    magicLinkExpires: magicExpires
                }
            });
        }

        // Send magic link email
        try {
            console.log('DEBUG: App info:', {
                appId: req.app.id,
                appName: req.app.name,
                appDomain: req.app.domain
            });
            await sendMagicLinkEmail(user.email, user.firstName, magicToken, isNewUser, req.app.domain, req.app.name);
        } catch (emailError) {
            console.error('Failed to send magic link email:', emailError);
            return res.status(500).json({
                error: 'Email Error',
                message: 'Failed to send magic link email. Please try again.'
            });
        }

        res.json({
            success: true,
            message: 'Magic link sent! Check your email to sign in.',
            isNewUser
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/verify-magic
 * Verify magic link token and return JWT
 */
router.post('/verify-magic', async (req, res, next) => {
    try {
        // Validate request body
        const { error, value } = verifyMagicLinkSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.details[0].message
            });
        }

        const { token } = value;

        // Find user with valid magic link token
        const user = await prisma.user.findFirst({
            where: {
                magicLinkToken: token,
                magicLinkExpires: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid Token',
                message: 'Magic link token is invalid or has expired'
            });
        }

        // Clear magic link token and ensure email is verified
        await prisma.user.update({
            where: { id: user.id },
            data: {
                magicLinkToken: null,
                magicLinkExpires: null,
                emailVerified: true // Ensure magic link users are email verified
            }
        });

        // Generate JWT token
        const jwtToken = generateToken({
            userId: user.id,
            email: user.email
        });

        // Return user data (excluding password and sensitive fields) and token
        const { password, magicLinkToken: _, magicLinkExpires: __, passwordResetToken: ___, passwordResetExpires: ____, emailVerificationToken: _____, emailVerificationExpires: ______, ...userWithoutSensitiveData } = user;

        res.json({
            success: true,
            message: 'Magic link authentication successful',
            token: jwtToken,
            user: userWithoutSensitiveData
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router; 