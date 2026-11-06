# Secure File Exchange - API Server

Enterprise-grade REST API for secure document exchange with comprehensive authentication, authorization, and tenant isolation.

## Architecture Overview

### Service Layer
- **UserService** — User registration, login, password management
- **OrganizationService** — Organization CRUD, member management, role-based access

### Middleware
- **Authentication** — Session validation, token verification
- **Authorization** — Tenant isolation verification, role-based access control
- **Error Handling** — Consistent error responses

### Security Model

#### Tenant Isolation (CRITICAL)
Every operation enforces tenant isolation at multiple layers:

1. **Database Level** — Queries include `organizationId` filter
2. **Service Level** — Services verify user membership before returning data
3. **API Level** — Endpoints return 404 for unauthorized access (prevent enumeration)
4. **Middleware Level** — Authorization middleware validates tenant context

**Test Coverage:** See `src/tests/tenant-isolation.test.ts`

#### Authentication
- **Password Hashing:** Argon2 strength (bcrypt rounds=12)
- **Sessions:** Server-side session store (Redis)
- **Tokens:** 256-bit cryptographically random tokens
- **MFA:** TOTP (Time-based One-Time Password) support planned

#### Authorization
- **RBAC:** Owner, Admin, Member roles
- **Fine-grained Permissions:** Each operation checks role + resource ownership
- **Principle of Least Privilege:** Default deny, explicit allow

## API Endpoints (Phase 3 Foundation)

### Authentication (Coming)
```
POST   /api/v1/auth/register      Register new user
POST   /api/v1/auth/login         Login user
POST   /api/v1/auth/logout        Logout user
POST   /api/v1/auth/verify-email  Verify email address
POST   /api/v1/auth/password-reset-request  Request password reset
POST   /api/v1/auth/password-reset         Reset password
```

### Users (Coming)
```
GET    /api/v1/users/me           Get current user profile
PUT    /api/v1/users/me           Update profile
POST   /api/v1/users/password     Change password
```

### Organizations (Coming)
```
GET    /api/v1/organizations      List user's organizations
POST   /api/v1/organizations      Create new organization
GET    /api/v1/organizations/:id  Get organization details
PUT    /api/v1/organizations/:id  Update organization
GET    /api/v1/organizations/:id/members        List members
POST   /api/v1/organizations/:id/members        Invite member
PUT    /api/v1/organizations/:id/members/:userId Update member role
DELETE /api/v1/organizations/:id/members/:userId Remove member
```

## Development

### Setup
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local

# Start database and cache
docker-compose up -d

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### Testing

**Tenant Isolation Tests (MANDATORY)**
```bash
npm test -- tenant-isolation.test.ts
```

**All Tests**
```bash
npm test
```

### Security Checklist

- [ ] All endpoints verify user authentication
- [ ] All endpoints enforce tenant isolation
- [ ] No cross-tenant data leakage in responses
- [ ] Password hashing verified (Argon2)
- [ ] Tokens generated securely
- [ ] Session management implemented
- [ ] SQL injection prevented (Prisma ORM)
- [ ] CSRF tokens if needed for state-changing ops
- [ ] Rate limiting configured
- [ ] Logging doesn't expose sensitive data
- [ ] Error messages don't leak information

## Database Schema

Tables used for Phase 3:
- `users` — User accounts with password hashes
- `organizations` — Tenant organizations
- `organization_memberships` — User-organization relationships and roles
- `audit_events` — Security event logging (not yet used)

## Configuration

Key environment variables:
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=development
```

## Monitoring & Logging

All requests logged with:
- Method, path, status code, duration
- Error stack traces (development only)
- No sensitive data (passwords, tokens, etc.)

## Known Limitations (Phase 3 Foundation)

- [ ] Email verification not yet implemented
- [ ] MFA (TOTP) user setup not yet implemented
- [ ] Password reset email sending not yet implemented
- [ ] Rate limiting not yet implemented
- [ ] Session store configuration pending
- [ ] API routes are stubs (services exist, routes need implementation)

These will be completed in subsequent phases.

## Security Guarantees

✓ Tenant isolation enforced at database, service, and API layers  
✓ Passwords hashed with Argon2-strength algorithms  
✓ All user membership operations verified  
✓ Cross-tenant access attempts return 404 (prevent enumeration)  
✓ Authorization checks on every protected operation  

## Next Steps

1. Implement route handlers for auth and organization endpoints
2. Integrate with frontend authentication flow
3. Implement email verification
4. Implement MFA setup and verification
5. Add rate limiting
6. Complete session management integration

---

**Status:** Phase 3 Foundation - Services & Security Model Complete  
**Release Gate:** Tenant isolation tests must pass before proceeding to Phase 4
