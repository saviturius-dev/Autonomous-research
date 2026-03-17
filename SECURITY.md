# Security Implementation Guide

## Overview

This document outlines the security measures implemented in the Literature Agent application to prevent vulnerabilities and protect user data.

## Security Enhancements Made

### 1. **API Key Management** ✅

**Problem Fixed:**
- API keys were previously exposed in client-side JavaScript bundles
- The vite.config.ts was loading all GEMINI_API_KEY variables into the frontend

**Solution:**
- All API keys are now kept on the backend only
- Frontend never has access to external API credentials
- Backend uses environment variables with proper separation of concerns
- Sensitive keys use `SUPABASE_SERVICE_ROLE_KEY` (not exposed to clients)

### 2. **Authentication & Authorization** ✅

**Implementation:**
- Integrated Supabase Authentication for secure user management
- JWT token-based authentication with Bearer tokens
- Session management with token storage in localStorage
- Protected routes that require authentication
- Automatic token validation on API requests

**Auth Flow:**
1. Users sign up/login via `/api/auth/signup` or `/api/auth/signin`
2. Backend validates credentials against Supabase Auth
3. JWT session token is returned to client
4. Token stored in localStorage for persistence
5. Token included in all subsequent API requests
6. Backend verifies token on protected endpoints

### 3. **Database Security (RLS Policies)** ✅

**Row Level Security (RLS) Enabled:**
- Every table has RLS enabled by default
- Tables: `research_papers`, `hypotheses`, `experiments`, `reports`

**Policy Structure:**
- **Papers**: Public read (research sharing), authenticated insert
- **Hypotheses**: Users can only access their own (checked via `auth.uid()`)
- **Experiments**: Users can only access their own
- **Reports**: Users can only access their own

**Benefits:**
- Database enforces access control automatically
- Users cannot query other users' data even if they bypass frontend checks
- Defense in depth - multiple security layers

### 4. **CORS Configuration** ✅

**Implemented:**
- CORS headers configured in Express middleware
- Allowed origins: localhost (dev) and production domains (configurable)
- Credentials enabled for authentication
- Restricted HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Restricted headers for security

**Benefits:**
- Prevents malicious cross-origin requests
- Protects against CSRF attacks
- Browser enforces origin restrictions

### 5. **HTTP Security Headers** ✅

**Headers Implemented:**
```
X-Content-Type-Options: nosniff         - Prevents MIME type sniffing
X-Frame-Options: DENY                   - Prevents clickjacking
X-XSS-Protection: 1; mode=block         - Legacy XSS protection
Strict-Transport-Security: ...          - Forces HTTPS
Referrer-Policy: strict-origin-when-cross-origin
```

**Benefits:**
- Protection against common web vulnerabilities
- Enforces HTTPS usage
- Prevents embedding in iframes

### 6. **Input Validation & Error Handling** ✅

**Backend Validation:**
- Email format validation on signup/login
- Password length requirements (minimum 8 characters)
- Required field checks before database operations
- Sanitized error messages (no sensitive data leakage)

**Frontend Validation:**
- Client-side validation before submission
- Clear error messages for user feedback
- Protected routes for authenticated endpoints

### 7. **Environment Variable Management** ✅

**Proper Separation:**
- **Frontend (.env)**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
  - These are safe to expose (public Supabase credentials)
  - Prefixed with `VITE_` so they're not bundled unless explicitly used

- **Backend (.env)**:
  - `SUPABASE_SERVICE_ROLE_KEY` (sensitive, server-only)
  - `PORT` and `NODE_ENV` configuration
  - `ALLOWED_ORIGINS` for CORS

**Best Practice:**
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to frontend
- Production uses secure environment variable injection
- .env files are gitignored (in .gitignore)

### 8. **API Endpoint Security** ✅

**Public Endpoints:**
- `GET /api/health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

**Protected Endpoints (require JWT):**
- `POST /api/hypotheses` - Create hypothesis
- `GET /api/hypotheses` - List user's hypotheses
- `POST /api/experiments` - Create experiment
- `GET /api/experiments` - List user's experiments
- `GET /api/reports` - List user's reports

**Protection Mechanism:**
```typescript
const verifyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Invalid token' });

  req.user = user;
  next();
}
```

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Frontend (React/Vite)           │
│  - Login/Signup Pages                   │
│  - Protected Routes                     │
│  - Dashboard & Features                 │
│  - Safe public credentials only         │
└──────────────┬──────────────────────────┘
               │ HTTPS + JWT Token
               │
┌──────────────▼──────────────────────────┐
│      Backend (Express/Node)             │
│  - Auth Endpoints                       │
│  - API Routes (protected)               │
│  - CORS & Security Headers              │
│  - Database Queries                     │
│  - Secret Key Management                │
└──────────────┬──────────────────────────┘
               │ Authenticated
               │
┌──────────────▼──────────────────────────┐
│    Supabase (Database & Auth)           │
│  - PostgreSQL with RLS                  │
│  - User Management                      │
│  - Row Level Security Policies          │
│  - Encrypted Credentials                │
└─────────────────────────────────────────┘
```

## Vulnerability Fixes

### Fixed Issues

| Issue | Before | After |
|-------|--------|-------|
| **API Key Exposure** | Keys in JavaScript bundle | Keys on backend only |
| **No Authentication** | Public access to all data | JWT-based protected routes |
| **No Data Isolation** | All users see all data | RLS policies isolate data |
| **Missing CORS** | Vulnerable to CSRF | CORS headers configured |
| **No Security Headers** | Missing protection headers | All security headers present |
| **Weak Validation** | No input validation | Email/password validation |
| **Error Leakage** | Raw errors exposed | Sanitized error messages |
| **Missing Database** | No data persistence | Full schema with RLS |

## Environment Setup

### Local Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials from [supabase.com](https://supabase.com):
   - `VITE_SUPABASE_URL` from project settings
   - `VITE_SUPABASE_ANON_KEY` from API settings
   - `SUPABASE_SERVICE_ROLE_KEY` from API settings (keep private!)

3. Update `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Set environment variables** in your deployment platform (Vercel, Heroku, etc.):
   - Use secure environment variable management
   - Never commit `.env` files
   - Rotate keys regularly

2. **Enable HTTPS** (automatic on modern platforms)

3. **Update ALLOWED_ORIGINS** in production .env

4. **Database backups**: Configure automated backups in Supabase

## Testing Security

### Test Cases

1. **Authentication Test**
   - Try accessing protected endpoints without token → Should return 401
   - Login and use valid token → Should succeed

2. **Authorization Test**
   - User A creates hypothesis
   - User B tries to access User A's hypothesis → Should fail

3. **CORS Test**
   - Request from different origin → Should be blocked
   - Preflight OPTIONS request → Should succeed

4. **Input Validation Test**
   - Submit empty email/password → Should be rejected
   - Submit weak password (< 8 chars) → Should be rejected

5. **SQL Injection Test**
   - Try SQL injection in input fields → Should be sanitized
   - Check parameterized queries in logs → Should see placeholders

## Monitoring & Maintenance

### Regular Tasks

- [ ] Review Supabase audit logs monthly
- [ ] Check for dependency updates: `npm audit`
- [ ] Rotate sensitive keys annually
- [ ] Review CORS allowlist quarterly
- [ ] Test authentication flows monthly
- [ ] Monitor error logs for suspicious activity

### Security Headers Checklist

- [x] X-Content-Type-Options
- [x] X-Frame-Options
- [x] X-XSS-Protection
- [x] Strict-Transport-Security
- [x] Referrer-Policy
- [ ] Content-Security-Policy (can be added later)
- [ ] Expect-CT (can be added later)

## Additional Recommendations

### Implement Later

1. **Rate Limiting**
   - Prevent brute force attacks on login
   - Use `express-rate-limit` package

2. **Request Logging**
   - Log all API requests for audit trail
   - Use Winston or Pino logger

3. **Two-Factor Authentication**
   - Add 2FA support via Supabase MFA

4. **API Key Rotation**
   - Implement automatic key rotation
   - Maintain key versioning

5. **Database Encryption**
   - Enable column-level encryption for sensitive data
   - Consider pgcrypto extension

6. **Content Security Policy**
   - Strict CSP headers
   - Script and resource whitelisting

7. **Automated Security Testing**
   - OWASP ZAP scanning
   - Dependency vulnerability scanning
   - Penetration testing

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Security](https://react.dev/learn/security)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

## Contact & Support

For security concerns or vulnerabilities, please report privately to your security team.
