const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3000';

/**
 * Send welcome email with verification link
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} verificationToken - Email verification token
 * @param {string} frontendUrl - Optional frontend URL (uses app domain or fallback to env var)
 * @param {string} appName - Optional app name for branding (defaults to "AuthStarter")
 */
const sendWelcomeEmail = async (email, firstName, verificationToken, frontendUrl = null, appName = 'AuthStarter') => {
  const verificationUrl = `${frontendUrl || FRONTEND_BASE_URL}/verify-email?token=${verificationToken}`;

  try {
    await resend.emails.send({
      from: `${appName} <noreply@buttermetrics.com>`,
      to: email,
      subject: 'Welcome! Please verify your email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${appName}${firstName ? `, ${firstName}` : ''}!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p><small>This link will expire in 1 hour.</small></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} resetToken - Password reset token
 * @param {string} frontendUrl - Optional frontend URL (uses app domain or fallback to env var)
 * @param {string} appName - Optional app name for branding (defaults to "AuthStarter")
 */
const sendPasswordResetEmail = async (email, firstName, resetToken, frontendUrl = null, appName = 'AuthStarter') => {
  const resetUrl = `${frontendUrl || FRONTEND_BASE_URL}/reset-password?token=${resetToken}`;

  try {
    await resend.emails.send({
      from: `${appName} <noreply@buttermetrics.com>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello${firstName ? ` ${firstName}` : ''},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><small>This link will expire in 30 minutes.</small></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send magic link email for passwordless authentication
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} magicToken - Magic link token
 * @param {boolean} isNewUser - Whether this is a new user or existing user
 * @param {string} frontendUrl - Optional frontend URL (uses app domain or fallback to env var)
 * @param {string} appName - Optional app name for branding (defaults to "AuthStarter")
 */
const sendMagicLinkEmail = async (email, firstName, magicToken, isNewUser = false, frontendUrl = null, appName = 'AuthStarter') => {
  const magicUrl = `${frontendUrl || FRONTEND_BASE_URL}/auth/magic?token=${magicToken}`;

  console.log('DEBUG: Email function received:', {
    email,
    firstName,
    frontendUrl,
    appName,
    magicUrl
  });

  try {
    await resend.emails.send({
      from: `${appName} <noreply@buttermetrics.com>`,
      to: email,
      subject: isNewUser ? `Welcome to ${appName}! Your Magic Link` : `Your ${appName} Magic Link`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${isNewUser ? `Welcome to ${appName}${firstName ? `, ${firstName}` : ''}!` : `Sign in to ${appName}${firstName ? `, ${firstName}` : ''}`}</h2>
          <p>${isNewUser ? 'Your account has been created! ' : ''}Click the magic link below to ${isNewUser ? 'complete your registration and ' : ''}sign in:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicUrl}" 
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              🪄 ${isNewUser ? 'Complete Registration' : 'Sign In with Magic Link'}
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">${magicUrl}</p>
          <p><small>This magic link will expire in 15 minutes.</small></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request this magic link, you can safely ignore this email.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send magic link email:', error);
    throw new Error('Failed to send magic link email');
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail
}; 