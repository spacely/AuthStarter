const Joi = require('joi');

// User registration schema
const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        }),
    firstName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional(),
    lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional()
});

// User login schema
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

// Forgot password schema
const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

// Reset password schema
const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Reset token is required'
        }),
    password: Joi.string()
        .min(8)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .required()
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        })
});

// Email verification schema
const verifyEmailSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Verification token is required'
        })
});

// Magic link request schema
const magicLinkSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    firstName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional(),
    lastName: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .optional()
});

// Magic link verification schema
const verifyMagicLinkSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Magic link token is required'
        })
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    magicLinkSchema,
    verifyMagicLinkSchema
}; 