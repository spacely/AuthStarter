# AuthStarter Integration Guide

This guide explains how to integrate your application with AuthStarter for authentication services.

## Overview

AuthStarter is a multi-tenant authentication service that provides user registration, login, email verification, password resets, and magic link authentication for your applications.

## Quick Start

### 1. Register Your Application

First, register your application with AuthStarter:

```bash
curl -X POST "https://authstarter-production-9d68.up.railway.app/api/apps/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your App Name",
    "domain": "https://yourapp.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "app": {
    "id": "app_unique_id",
    "name": "Your App Name",
    "domain": "https://yourapp.com",
    "apiKey": "app_your_api_key_here",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Save the `apiKey` - you'll need it for all API calls.**

### 2. Environment Variables

Set these environment variables in your application:

```env
# Required
AUTHSTARTER_API_URL=https://authstarter-production-9d68.up.railway.app
AUTHSTARTER_API_KEY=app_your_api_key_here

# Optional - for frontend redirects
AUTH_SUCCESS_REDIRECT=/dashboard
AUTH_ERROR_REDIRECT=/login?error=true
```

### 3. Verify Your Setup

Test your API key:

```bash
curl -X GET "https://authstarter-production-9d68.up.railway.app/api/apps/verify" \
  -H "X-API-Key: your_api_key_here"
```

## Authentication Endpoints

All API calls must include your API key in the `X-API-Key` header.

### User Registration

```javascript
// POST /api/auth/register
const registerUser = async (email, password) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTHSTARTER_API_KEY
    },
    body: JSON.stringify({ email, password })
  });
  
  return response.json();
};
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "emailVerified": false
  }
}
```

### User Login

```javascript
// POST /api/auth/login
const loginUser = async (email, password) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTHSTARTER_API_KEY
    },
    body: JSON.stringify({ email, password })
  });
  
  return response.json();
};
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "emailVerified": true
  }
}
```

### Magic Link Authentication

```javascript
// POST /api/auth/magic-link
const sendMagicLink = async (email) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/magic-link`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTHSTARTER_API_KEY
    },
    body: JSON.stringify({ email })
  });
  
  return response.json();
};

// GET /api/auth/magic-link/verify?token=TOKEN
const verifyMagicLink = async (token) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/magic-link/verify?token=${token}`, {
    method: 'GET',
    headers: {
      'X-API-Key': AUTHSTARTER_API_KEY
    }
  });
  
  return response.json();
};
```

### Email Verification

```javascript
// POST /api/auth/resend-verification
const resendVerification = async (email) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTHSTARTER_API_KEY
    },
    body: JSON.stringify({ email })
  });
  
  return response.json();
};

// GET /api/auth/verify-email?token=TOKEN
const verifyEmail = async (token) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/verify-email?token=${token}`, {
    method: 'GET',
    headers: {
      'X-API-Key': AUTHSTARTER_API_KEY
    }
  });
  
  return response.json();
};
```

### Password Reset

```javascript
// POST /api/auth/forgot-password
const forgotPassword = async (email) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTHSTARTER_API_KEY
    },
    body: JSON.stringify({ email })
  });
  
  return response.json();
};

// POST /api/auth/reset-password
const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': AUTHSTARTER_API_KEY
    },
    body: JSON.stringify({ token, newPassword })
  });
  
  return response.json();
};
```

### Get User Profile

```javascript
// GET /api/user/profile
const getUserProfile = async (jwtToken) => {
  const response = await fetch(`${AUTHSTARTER_API_URL}/api/user/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'X-API-Key': AUTHSTARTER_API_KEY
    }
  });
  
  return response.json();
};
```

## Frontend Integration Examples

### React Hook Example

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));

  const AUTHSTARTER_API_URL = process.env.REACT_APP_AUTHSTARTER_API_URL;
  const AUTHSTARTER_API_KEY = process.env.REACT_APP_AUTHSTARTER_API_KEY;

  useEffect(() => {
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${AUTHSTARTER_API_URL}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': AUTHSTARTER_API_KEY
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth error:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AUTHSTARTER_API_KEY
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('authToken', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const register = async (email, password) => {
    try {
      const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AUTHSTARTER_API_KEY
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!user
  };
};
```

### Vue.js Composable Example

```javascript
// composables/useAuth.js
import { ref, computed } from 'vue';

const user = ref(null);
const token = ref(localStorage.getItem('authToken'));

export const useAuth = () => {
  const AUTHSTARTER_API_URL = import.meta.env.VITE_AUTHSTARTER_API_URL;
  const AUTHSTARTER_API_KEY = import.meta.env.VITE_AUTHSTARTER_API_KEY;

  const isAuthenticated = computed(() => !!user.value);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${AUTHSTARTER_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': AUTHSTARTER_API_KEY
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        token.value = data.token;
        user.value = data.user;
        localStorage.setItem('authToken', data.token);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('authToken');
  };

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout
  };
};
```

## Backend Integration Examples

### Node.js/Express Middleware

```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const AUTHSTARTER_API_URL = process.env.AUTHSTARTER_API_URL;
const AUTHSTARTER_API_KEY = process.env.AUTHSTARTER_API_KEY;

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token with AuthStarter
    const response = await fetch(`${AUTHSTARTER_API_URL}/api/user/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Key': AUTHSTARTER_API_KEY
      }
    });

    if (!response.ok) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const data = await response.json();
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
};

module.exports = authMiddleware;
```

### Python/Flask Integration

```python
# auth.py
import os
import requests
from functools import wraps
from flask import request, jsonify, g

AUTHSTARTER_API_URL = os.getenv('AUTHSTARTER_API_URL')
AUTHSTARTER_API_KEY = os.getenv('AUTHSTARTER_API_KEY')

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'No token provided'}), 401
        
        token = auth_header.replace('Bearer ', '')
        
        try:
            response = requests.get(
                f'{AUTHSTARTER_API_URL}/api/user/profile',
                headers={
                    'Authorization': f'Bearer {token}',
                    'X-API-Key': AUTHSTARTER_API_KEY
                }
            )
            
            if response.status_code != 200:
                return jsonify({'error': 'Invalid token'}), 401
            
            g.user = response.json()['user']
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': 'Token verification failed'}), 401
    
    return decorated_function
```

## Email Configuration

AuthStarter sends emails using your app's name and domain:

- **Welcome emails**: "Welcome to [Your App Name]"
- **Password reset**: "Reset your [Your App Name] password"
- **Magic links**: "Sign in to [Your App Name]"
- **Email verification**: "Verify your [Your App Name] email"

All email links redirect to your registered domain.

## Error Handling

### Common HTTP Status Codes

- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid API key or JWT)
- **404**: Not Found
- **429**: Rate Limited (too many requests)
- **500**: Server Error

### Common 400 Error Cases

```javascript
// Handle validation errors
const handleAuthError = (error) => {
  if (error.status === 400) {
    // Common validation errors:
    // - "Email is required"
    // - "Password must be at least 8 characters"
    // - "Password must contain uppercase, lowercase, and number"
    // - "Email already exists"
    // - "Invalid email format"
    console.log('Validation error:', error.message);
  }
};
```

## Rate Limits

- **5000 requests per 15 minutes** per IP address
- Applies to all endpoints
- Returns 429 status when exceeded

## Security Best Practices

1. **Never expose your API key** in frontend code
2. **Use environment variables** for configuration
3. **Implement proper CORS** in your frontend
4. **Store JWT tokens securely** (httpOnly cookies recommended)
5. **Validate user input** before sending to AuthStarter
6. **Handle token expiration** gracefully

## Testing Your Integration

### Postman Collection

You can test all endpoints using this Postman collection structure:

1. Set environment variables:
   - `AUTHSTARTER_URL`: `https://authstarter-production-9d68.up.railway.app`
   - `API_KEY`: Your app's API key

2. Test endpoints in this order:
   - Register user
   - Login user
   - Get user profile
   - Send magic link
   - Reset password

### Example Test Script

```javascript
// test-auth.js
const AUTHSTARTER_API_URL = 'https://authstarter-production-9d68.up.railway.app';
const AUTHSTARTER_API_KEY = 'your_api_key_here';

async function testAuth() {
  try {
    // Test registration
    const registerResponse = await fetch(`${AUTHSTARTER_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': AUTHSTARTER_API_KEY
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123'
      })
    });
    
    console.log('Registration:', await registerResponse.json());
    
    // Test login
    const loginResponse = await fetch(`${AUTHSTARTER_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': AUTHSTARTER_API_KEY
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPass123'
      })
    });
    
    console.log('Login:', await loginResponse.json());
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAuth();
```

## Support

If you encounter issues:

1. **Check your API key** is correct and active
2. **Verify your domain** is registered correctly
3. **Review error messages** in API responses
4. **Check rate limits** if getting 429 errors
5. **Ensure proper headers** are included in requests

For additional support, contact the AuthStarter team with:
- Your app ID
- Error messages
- Request examples
- Expected vs actual behavior

## Next Steps

1. **Register your app** using the registration endpoint
2. **Set up environment variables** in your application
3. **Implement authentication flows** using the provided examples
4. **Test thoroughly** with your specific use cases
5. **Deploy with confidence** knowing your auth is handled securely

---

**AuthStarter Version**: 1.0  
**Last Updated**: December 2024  
**API Base URL**: https://authstarter-production-9d68.up.railway.app 