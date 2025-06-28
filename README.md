# AuthStarter 🚀

**Lightweight Authentication API Template for Rapid MVP Deployment**

AuthStarter is a production-ready authentication service designed for rapid deployment alongside new MVPs or SaaS tools. It provides essential auth features like registration, login, email verification, and password resets using JWT tokens and Resend for email delivery.

## 🌟 Features

- **Complete Authentication Flow**: Registration, login, password reset, email verification
- **Magic Link Authentication**: Passwordless sign-in with secure email links
- **JWT-based Authentication**: Secure token-based auth with configurable expiration
- **Email Integration**: Transactional emails via Resend (welcome, verification, password reset, magic links)
- **Security First**: Password hashing with bcrypt, rate limiting, CORS protection
- **Database Ready**: PostgreSQL with Prisma ORM
- **Production Ready**: Error handling, validation, logging
- **One-Click Deploy**: Railway deployment template
- **Frontend Agnostic**: Works with React, mobile, CLI, or any HTTP client

## 🚀 Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new?template=https://github.com/YOUR_USERNAME/authstarter)

> **Multi-service deployment** - Automatically provisions PostgreSQL database service with persistent storage + AuthStarter API service with auto-generated secrets

## 📋 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/apps/register` | Register your app and get API key | ❌ |
| `GET` | `/api/apps/verify` | Verify API key and get app info | API Key |
| `POST` | `/api/auth/register` | Register new user & send verification email | API Key |
| `POST` | `/api/auth/login` | Login user and return JWT token | API Key |
| `POST` | `/api/auth/magic-link` | Send magic link for passwordless sign-in | API Key |
| `POST` | `/api/auth/verify-magic` | Verify magic link token and return JWT | API Key |
| `POST` | `/api/auth/forgot` | Send password reset email | API Key |
| `POST` | `/api/auth/reset` | Reset password with token | API Key |
| `GET` | `/api/auth/verify` | Verify email with token | API Key |
| `GET` | `/api/user/me` | Get current user info | API Key + JWT |
| `GET` | `/health` | Health check endpoint | ❌ |

## 🛠️ Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Resend API key (for emails)

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd authstarter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Fill in your `.env` file:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/authstarter"
   JWT_SECRET="your-super-secret-jwt-key"
   RESEND_API_KEY="your-resend-api-key"
   FRONTEND_BASE_URL="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   npm run prisma:push
   npm run prisma:generate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

The API will be running at `http://localhost:8000`

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret for signing JWT tokens | Required |
| `RESEND_API_KEY` | Resend API key for emails | Required |
| `FRONTEND_BASE_URL` | Frontend URL for email links | `http://localhost:3000` |
| `PORT` | Server port | `8000` |
| `JWT_EXPIRES_IN` | JWT token expiration | `1h` |
| `EMAIL_VERIFICATION_EXPIRES` | Email verification expiry (minutes) | `60` |
| `PASSWORD_RESET_EXPIRES` | Password reset expiry (minutes) | `30` |
| `MAGIC_LINK_EXPIRES` | Magic link expiry (minutes) | `15` |

## 📖 Usage Examples

### Step 1: Register Your App (One-time Setup)
```bash
curl -X POST https://your-authstarter.railway.app/api/apps/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My SaaS App",
    "domain": "https://myapp.com"
  }'

# Response:
# {
#   "success": true,
#   "app": {
#     "id": "app_abc123",
#     "name": "My SaaS App", 
#     "domain": "https://myapp.com",
#     "apiKey": "app_def456789",
#     "createdAt": "2024-01-01T00:00:00.000Z"
#   }
# }
```

### Step 2: Use Your API Key for All Requests

All authentication endpoints now require your app's API key in the `X-API-Key` header:

### Registration
```bash
curl -X POST https://your-authstarter.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST https://your-authstarter.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Magic Link Authentication
```bash
# Request magic link
curl -X POST https://your-authstarter.railway.app/api/auth/magic-link \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Verify magic link (after user clicks email link)
curl -X POST https://your-authstarter.railway.app/api/auth/verify-magic \
  -H "Content-Type: application/json" \
  -H "X-API-Key: app_def456789" \
  -d '{
    "token": "magic-link-token-from-email"
  }'
```

### Protected Route Access
```bash
curl -X GET https://your-authstarter.railway.app/api/user/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "X-API-Key: app_def456789"
```

## 🔗 Frontend Integration

### Magic Link Flow for Web Apps

AuthStarter's magic link authentication provides a seamless passwordless experience. Here's how to integrate it:

#### 1. Request Magic Link
```javascript
// Frontend: Send magic link request
const sendMagicLink = async (email, firstName, lastName) => {
  const response = await fetch('https://your-authstarter.railway.app/api/auth/magic-link', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': 'app_def456789' // Your app's API key
    },
    body: JSON.stringify({ email, firstName, lastName })
  });
  
  const data = await response.json();
  // Shows: "Magic link sent! Check your email to sign in."
  // data.isNewUser tells you if this created a new account
};
```

#### 2. Handle Magic Link Click
```javascript
// Frontend: Handle magic link verification (e.g., /auth/magic?token=abc123)
const verifyMagicLink = async (token) => {
  const response = await fetch('https://your-authstarter.railway.app/api/auth/verify-magic', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-API-Key': 'app_def456789' // Your app's API key
    },
    body: JSON.stringify({ token })
  });
  
  const data = await response.json();
  if (data.success) {
    // Store JWT token
    localStorage.setItem('authToken', data.token);
    
    // User is now authenticated
    const user = data.user;
    console.log('Logged in:', user.email);
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
};

// Extract token from URL params
const urlParams = new URLSearchParams(window.location.search);
const magicToken = urlParams.get('token');
if (magicToken) {
  verifyMagicLink(magicToken);
}
```

#### 3. Use JWT for API Calls
```javascript
// Frontend: Make authenticated requests
const fetchUserData = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('https://your-authstarter.railway.app/api/user/me', {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'X-API-Key': 'app_def456789' // Your app's API key
    }
  });
  
  const userData = await response.json();
  return userData.user;
};
```

### Magic Link Benefits

- **Zero Password Friction**: Users never need to create or remember passwords
- **Auto-Registration**: New users are automatically created when they request a magic link
- **Email Verification**: Magic link users are automatically email-verified
- **Secure**: 15-minute expiration with cryptographically secure tokens
- **Flexible**: Works alongside traditional email/password authentication

## 🏢 Multi-Tenant Architecture

AuthStarter now supports **multiple apps** with complete data isolation:

### Benefits
- **One Service, Multiple Apps**: Deploy once, use for all your SaaS projects
- **Complete Data Isolation**: Each app's users are completely separate
- **Cost Effective**: Single Railway deployment serves unlimited apps
- **Centralized Management**: One auth service for your entire SaaS portfolio
- **Scalable**: Add new apps instantly without additional infrastructure

### How It Works
1. **Register Your App**: Get a unique API key for each SaaS project
2. **Isolated Users**: Same email can exist across different apps
3. **Scoped Authentication**: All auth operations are scoped to your app
4. **Shared Infrastructure**: All apps benefit from the same security features

## 🏗️ Architecture

```
src/
├── middleware/          # Express middleware
│   ├── auth.js         # JWT authentication
│   └── errorHandler.js # Global error handling
├── routes/             # API routes
│   ├── auth.js         # Authentication endpoints
│   └── user.js         # User endpoints
├── utils/              # Utility functions
│   ├── database.js     # Prisma client
│   ├── email.js        # Resend integration
│   └── jwt.js          # JWT utilities
├── validation/         # Input validation
│   └── schemas.js      # Joi schemas
└── server.js          # Express app setup
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Security**: Signed tokens with configurable expiration
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable origin whitelist
- **Input Validation**: Joi schema validation for all inputs
- **Email Security**: Secure token generation for email verification
- **Error Handling**: Sanitized error responses in production

## 🚀 Deployment

### Railway (Recommended)

1. Click the Railway deploy button above
2. The template will automatically:
   - Create PostgreSQL database service with persistent volume
   - Deploy the AuthStarter API service  
   - Auto-generate JWT_SECRET and POSTGRES_PASSWORD
   - Configure DATABASE_URL connection between services
3. You only need to provide:
   - **RESEND_API_KEY**: Your Resend API key (required)
   - **FRONTEND_BASE_URL**: Your frontend URL (optional, defaults to localhost:3000)
   
   All other variables are auto-configured:
   - JWT_SECRET, POSTGRES_PASSWORD (auto-generated)
   - All PostgreSQL connection variables (auto-configured)
   - Database URLs, SSL settings, operational configs
4. Both services deploy automatically on push to main

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Deploy to your platform of choice**
   - Heroku
   - Vercel
   - DigitalOcean
   - AWS

## 🧪 Testing

Test the API endpoints using the health check:

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "AuthStarter API is running",
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## 🛣️ Roadmap (Future Versions)

- [ ] Google OAuth integration
- [ ] Role-based access control (RBAC)
- [ ] Webhook support for auth events
- [ ] Admin dashboard
- [ ] Multi-tenant support
- [ ] Rate limiting per user
- [ ] Session management
- [ ] 2FA support

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, email saheed@example.com or create an issue in this repository.

---

**Built with ❤️ by [Saheed Adepoju](https://github.com/saheed)**
