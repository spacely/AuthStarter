# AuthStarter API Documentation

## Overview

AuthStarter is a lightweight authentication API template designed for rapid MVP deployment. It provides complete authentication services including registration, login, email verification, password reset, and magic link authentication with multi-tenant support and dynamic frontend URLs for branded email experiences.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Middleware](#middleware)
5. [Utility Functions](#utility-functions)
6. [Validation Schemas](#validation-schemas)
7. [Database Models](#database-models)
8. [Email Services](#email-services)
9. [Examples](#examples)

---

## API Endpoints

### Health Check

#### GET `/health`
Health check endpoint to verify the API is running.

**Authentication:** None required

**Response:**
```json
{
  "status": "OK",
  "message": "AuthStarter API is running",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

**Example:**
```bash
curl -X GET https://your-api.com/health
```

---

### App Management

#### POST `/api/apps/register`
Register a new application and receive an API key for authentication.

**Authentication:** None required

**Request Body:**
```json
{
  "name": "My SaaS App",
  "domain": "https://myapp.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "App registered successfully",
  "app": {
    "id": "app_abc123",
    "name": "My SaaS App",
    "domain": "https://myapp.com",
    "apiKey": "app_def456789",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/apps/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SaaS App",
    "domain": "https://myapp.com"
  }'
```

#### GET `/api/apps/verify`
Verify an API key and get app information.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Response:**
```json
{
  "success": true,
  "app": {
    "id": "app_abc123",
    "name": "My SaaS App",
    "domain": "https://myapp.com",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "userCount": 42
  }
}
```

**Example:**
```bash
curl -X GET https://your-api.com/api/apps/verify \
  -H "X-API-Key: app_def456789"
```

---

### Authentication

#### POST `/api/auth/register`
Register a new user and send verification email.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### POST `/api/auth/login`
Login user and return JWT token.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

#### POST `/api/auth/forgot`
Send password reset email to user.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/auth/forgot \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "email": "user@example.com"
  }'
```

#### POST `/api/auth/reset`
Reset user password using reset token.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/auth/reset \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "token": "reset_token_from_email",
    "password": "NewSecurePass123"
  }'
```

#### GET `/api/auth/verify`
Verify email address using verification token.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Query Parameters:**
- `token`: Email verification token

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Example:**
```bash
curl -X GET "https://your-api.com/api/auth/verify?token=verification_token" \
  -H "X-API-Key: app_def456789"
```

#### POST `/api/auth/magic-link`
Send magic link for passwordless authentication.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent! Check your email to sign in.",
  "isNewUser": false
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### POST `/api/auth/verify-magic`
Verify magic link token and return JWT.

**Authentication:** API Key required

**Headers:**
- `X-API-Key: your_api_key`

**Request Body:**
```json
{
  "token": "magic_token_from_email"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/auth/verify-magic \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "token": "magic_token_from_email"
  }'
```

---

### User Management

#### GET `/api/user/me`
Get current user information (protected route).

**Authentication:** API Key + JWT Token required

**Headers:**
- `X-API-Key: your_api_key`
- `Authorization: Bearer jwt_token`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X GET https://your-api.com/api/user/me \
  -H "X-API-Key: app_def456789" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### GET `/api/user/profile`
Get current user profile (requires email verification).

**Authentication:** API Key + JWT Token + Email Verification required

**Headers:**
- `X-API-Key: your_api_key`
- `Authorization: Bearer jwt_token`

**Response:**
```json
{
  "success": true,
  "message": "Profile access granted",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X GET https://your-api.com/api/user/profile \
  -H "X-API-Key: app_def456789" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Authentication

### API Key Authentication
All endpoints (except `/health` and `/api/apps/register`) require an API key in the `X-API-Key` header. API keys are obtained by registering an app via `/api/apps/register`.

### JWT Token Authentication
Protected user routes require a valid JWT token in the `Authorization` header with the format `Bearer <token>`. JWT tokens are obtained from login or magic link verification.

### Multi-Tenant Architecture
Each app has its own isolated user base. The same email can exist across different apps, but users are completely separated per app.

### Dynamic Frontend URLs
Email links (verification, password reset, magic links) automatically use the app's registered domain instead of a global frontend URL, providing a seamless branded experience for each application.

**How it works:**
1. When registering an app via `/api/apps/register`, you provide a `domain` (e.g., `https://myapp.com`)
2. All email links for that app will use this domain instead of the global `FRONTEND_BASE_URL`
3. If no app domain is available, it falls back to the `FRONTEND_BASE_URL` environment variable

**Benefits:**
- **Branded Experience**: Users see your app's domain in email links, not a generic URL
- **Multi-App Support**: Each app can have its own domain for email links
- **Seamless Integration**: No additional configuration required - works automatically
- **Fallback Protection**: Always has a fallback URL if app domain is unavailable

**Example Email Links:**
- **Verification**: `https://myapp.com/verify-email?token=verification_token`
- **Password Reset**: `https://myapp.com/reset-password?token=reset_token`
- **Magic Link**: `https://myapp.com/auth/magic?token=magic_token`

**Implementation Details:**
- Email functions receive `req.app.domain` as the `frontendUrl` parameter
- URL construction: `${frontendUrl || FRONTEND_BASE_URL}/endpoint?token=token`
- Automatic fallback ensures email links always work even if app domain is unavailable

---

## Error Handling

### Error Response Format
All errors follow a consistent format:

```json
{
  "error": "Error Type",
  "message": "Human-readable error message"
}
```

### Common Error Types

#### 400 Bad Request
- **Validation Error**: Invalid input data
- **User Already Exists**: Email already registered
- **Invalid Token**: Token expired or invalid

#### 401 Unauthorized
- **API Key Required**: Missing X-API-Key header
- **Invalid API Key**: Invalid API key provided
- **Access Denied**: No JWT token provided
- **Invalid Token**: JWT token invalid or expired
- **Invalid Credentials**: Login failed

#### 403 Forbidden
- **Email Verification Required**: Email not verified for protected resource

#### 404 Not Found
- **Endpoint not found**: Invalid endpoint

#### 500 Internal Server Error
- **Internal Server Error**: Server error occurred

---

## Middleware

### `authenticateApp`
Validates API key and attaches app information to request.

**Usage:**
```javascript
const { authenticateApp } = require('./middleware/appAuth');
router.use(authenticateApp);
```

**Request Enhancement:**
```javascript
req.app = {
  id: "app_123",
  name: "My App",
  domain: "https://myapp.com",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### `authenticateToken`
Validates JWT token and attaches user information to request.

**Usage:**
```javascript
const { authenticateToken } = require('./middleware/auth');
router.get('/protected', authenticateToken, (req, res) => {
  // Access user via req.user
});
```

**Request Enhancement:**
```javascript
req.user = {
  id: "user_123",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  emailVerified: true,
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

### `requireEmailVerification`
Ensures user has verified their email address.

**Usage:**
```javascript
const { requireEmailVerification } = require('./middleware/auth');
router.get('/verified-only', authenticateToken, requireEmailVerification, (req, res) => {
  // Only verified users can access this
});
```

### `errorHandler`
Global error handling middleware that formats errors consistently.

**Features:**
- Handles Prisma database errors
- Handles JWT token errors
- Handles Joi validation errors
- Provides development vs production error details

---

## Utility Functions

### JWT Utilities (`src/utils/jwt.js`)

#### `generateToken(payload)`
Generate a JWT token for user authentication.

**Parameters:**
- `payload` (Object): User data to include in token

**Returns:**
- `string`: JWT token

**Example:**
```javascript
const token = generateToken({
  userId: user.id,
  email: user.email
});
```

#### `verifyToken(token)`
Verify and decode a JWT token.

**Parameters:**
- `token` (string): JWT token to verify

**Returns:**
- `Object`: Decoded token payload

**Example:**
```javascript
try {
  const decoded = verifyToken(token);
  console.log(decoded.userId);
} catch (error) {
  console.error('Invalid token');
}
```

#### `generateSecureToken()`
Generate a secure random token for email verification/password reset.

**Returns:**
- `string`: Random token

**Example:**
```javascript
const verificationToken = generateSecureToken();
```

### Database Utilities (`src/utils/database.js`)

#### `prisma`
Prisma client instance for database operations.

**Features:**
- Automatic connection management
- Development logging
- Graceful shutdown handling
- Railway environment detection

**Example:**
```javascript
const prisma = require('./utils/database');

const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});
```

---

## Validation Schemas

### `registerSchema`
Validates user registration data.

**Fields:**
- `email`: Valid email address (required)
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number (required)
- `firstName`: String, max 50 chars (optional)
- `lastName`: String, max 50 chars (optional)

### `loginSchema`
Validates user login data.

**Fields:**
- `email`: Valid email address (required)
- `password`: Any string (required)

### `forgotPasswordSchema`
Validates forgot password request.

**Fields:**
- `email`: Valid email address (required)

### `resetPasswordSchema`
Validates password reset data.

**Fields:**
- `token`: Reset token (required)
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 number (required)

### `verifyEmailSchema`
Validates email verification token.

**Fields:**
- `token`: Verification token (required)

### `magicLinkSchema`
Validates magic link request.

**Fields:**
- `email`: Valid email address (required)
- `firstName`: String, max 50 chars (optional)
- `lastName`: String, max 50 chars (optional)

### `verifyMagicLinkSchema`
Validates magic link verification.

**Fields:**
- `token`: Magic link token (required)

---

## Database Models

### App Model
Represents a registered application.

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: Application name
- `domain`: Application domain (unique)
- `apiKey`: API key for authentication (unique)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Relations:**
- `users`: One-to-many relationship with User model

### User Model
Represents a user within an application.

**Fields:**
- `id`: Unique identifier (CUID)
- `email`: User email address
- `password`: Hashed password (optional for magic link users)
- `firstName`: User first name (optional)
- `lastName`: User last name (optional)
- `appId`: Reference to App model
- `emailVerified`: Email verification status
- `emailVerificationToken`: Email verification token (unique)
- `emailVerificationExpires`: Token expiration time
- `passwordResetToken`: Password reset token (unique)
- `passwordResetExpires`: Token expiration time
- `magicLinkToken`: Magic link token (unique)
- `magicLinkExpires`: Token expiration time
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Constraints:**
- Email must be unique per app (composite unique index)

---

## Email Services

### `sendWelcomeEmail(email, firstName, verificationToken, frontendUrl)`
Sends welcome email with email verification link.

**Parameters:**
- `email`: User's email address
- `firstName`: User's first name
- `verificationToken`: Email verification token
- `frontendUrl`: Optional frontend URL (uses app domain or fallback to env var)

**Features:**
- Professional HTML email template
- Verification link with token
- 1-hour expiration notice
- **Dynamic frontend URLs**: Uses app-specific domain if provided, otherwise falls back to `FRONTEND_BASE_URL`

### `sendPasswordResetEmail(email, firstName, resetToken, frontendUrl)`
Sends password reset email.

**Parameters:**
- `email`: User's email address
- `firstName`: User's first name
- `resetToken`: Password reset token
- `frontendUrl`: Optional frontend URL (uses app domain or fallback to env var)

**Features:**
- Professional HTML email template
- Reset link with token
- 30-minute expiration notice
- **Dynamic frontend URLs**: Uses app-specific domain if provided, otherwise falls back to `FRONTEND_BASE_URL`

### `sendMagicLinkEmail(email, firstName, magicToken, isNewUser, frontendUrl)`
Sends magic link email for passwordless authentication.

**Parameters:**
- `email`: User's email address
- `firstName`: User's first name
- `magicToken`: Magic link token
- `isNewUser`: Whether this is a new user
- `frontendUrl`: Optional frontend URL (uses app domain or fallback to env var)

**Features:**
- Different messaging for new vs existing users
- Professional HTML email template
- Magic link with token
- 15-minute expiration notice
- **Dynamic frontend URLs**: Uses app-specific domain if provided, otherwise falls back to `FRONTEND_BASE_URL`

---

## Examples

### Complete Registration Flow

```javascript
// 1. Register app (one-time)
const appResponse = await fetch('/api/apps/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My SaaS App',
    domain: 'https://myapp.com'  // Email links will use this domain
  })
});
const { app } = await appResponse.json();
const API_KEY = app.apiKey;

// 2. Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// 3. User receives verification email with link to https://myapp.com/verify-email?token=verification_token
// Email automatically uses the app's domain instead of a global frontend URL

// 4. User clicks verification link in email
// GET /api/auth/verify?token=verification_token

// 5. User logs in
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123'
  })
});
const { token } = await loginResponse.json();

// 6. Access protected resources
const userResponse = await fetch('/api/user/me', {
  headers: {
    'X-API-Key': API_KEY,
    'Authorization': `Bearer ${token}`
  }
});
const { user } = await userResponse.json();
```

### Magic Link Authentication Flow

```javascript
// 1. Request magic link
const magicResponse = await fetch('/api/auth/magic-link', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe'
  })
});

// 2. User receives magic link email with link to https://myapp.com/auth/magic?token=magic_token
// Email automatically uses the app's domain (https://myapp.com) instead of global frontend URL

// 3. User clicks magic link in email
// This redirects to your frontend with token parameter

// 4. Verify magic link token
const verifyResponse = await fetch('/api/auth/verify-magic', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    token: 'magic_token_from_url'
  })
});
const { token, user } = await verifyResponse.json();

// 5. User is now authenticated
localStorage.setItem('authToken', token);
```

### Password Reset Flow

```javascript
// 1. Request password reset
const forgotResponse = await fetch('/api/auth/forgot', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    email: 'user@example.com'
  })
});

// 2. User receives password reset email with link to https://myapp.com/reset-password?token=reset_token
// Email automatically uses the app's domain (https://myapp.com) instead of global frontend URL

// 3. User clicks reset link in email
// This redirects to your frontend with token parameter

// 4. Reset password
const resetResponse = await fetch('/api/auth/reset', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  },
  body: JSON.stringify({
    token: 'reset_token_from_url',
    password: 'NewSecurePass123'
  })
});

// 5. User can now log in with new password
```

---

## Environment Variables

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT token signing
- `RESEND_API_KEY`: Resend API key for email delivery

### Optional Variables

- `FRONTEND_BASE_URL`: Frontend URL for email links (default: `http://localhost:3000`)
- `PORT`: Server port (default: `8000`)
- `JWT_EXPIRES_IN`: JWT token expiration (default: `1h`)
- `EMAIL_VERIFICATION_EXPIRES`: Email verification expiry in minutes (default: `60`)
- `PASSWORD_RESET_EXPIRES`: Password reset expiry in minutes (default: `30`)
- `MAGIC_LINK_EXPIRES`: Magic link expiry in minutes (default: `15`)

---

## Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Security**: Signed tokens with configurable expiration
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin whitelist
- **Input Validation**: Joi schema validation for all inputs
- **Token Security**: Cryptographically secure token generation
- **Multi-tenancy**: Complete data isolation between apps
- **Error Sanitization**: Production-safe error messages

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per 15 minutes per IP address
- **Response**: Returns 429 status with error message when limit exceeded
- **Scope**: Applied globally to all endpoints

---

## Development Tools

### Database Management

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

### Local Development

```bash
# Start development server
npm run dev

# Start production server
npm start

# Build project
npm run build
```

This documentation provides complete coverage of all public APIs, functions, and components in the AuthStarter project with practical examples and implementation details.