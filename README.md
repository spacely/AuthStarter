# AuthStarter 🚀

**Lightweight Authentication API Template for Rapid MVP Deployment**

AuthStarter is a production-ready authentication service designed for rapid deployment alongside new MVPs or SaaS tools. It provides essential auth features like registration, login, email verification, and password resets using JWT tokens and Resend for email delivery.

## 🌟 Features

- **Complete Authentication Flow**: Registration, login, password reset, email verification
- **JWT-based Authentication**: Secure token-based auth with configurable expiration
- **Email Integration**: Transactional emails via Resend (welcome, verification, password reset)
- **Security First**: Password hashing with bcrypt, rate limiting, CORS protection
- **Database Ready**: PostgreSQL with Prisma ORM
- **Production Ready**: Error handling, validation, logging
- **One-Click Deploy**: Railway deployment template
- **Frontend Agnostic**: Works with React, mobile, CLI, or any HTTP client

## 🚀 Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/new?template=https://github.com/YOUR_USERNAME/authstarter)

> **One-click deployment** - Automatically provisions PostgreSQL database and AuthStarter API

## 📋 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register new user & send verification email | ❌ |
| `POST` | `/api/auth/login` | Login user and return JWT token | ❌ |
| `POST` | `/api/auth/forgot` | Send password reset email | ❌ |
| `POST` | `/api/auth/reset` | Reset password with token | ❌ |
| `GET` | `/api/auth/verify` | Verify email with token | ❌ |
| `GET` | `/api/user/me` | Get current user info | ✅ |
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

## 📖 Usage Examples

### Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Protected Route Access
```bash
curl -X GET http://localhost:8000/api/user/me \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

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
2. Connect your GitHub repository
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

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
