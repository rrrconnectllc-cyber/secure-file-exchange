# Secure File Exchange (SFX) — Technical Architecture

## Stack Overview

### Frontend
- **Framework:** Next.js 14+ (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI primitives + custom accessible components
- **Authentication:** NextAuth.js (credible managed solution)
- **HTTP Client:** Fetch API + React Query
- **Forms:** React Hook Form + Zod validation
- **Deployment:** Vercel (default) or AWS CloudFront + Lambda

### Backend
- **Runtime:** Node.js 22+
- **Framework:** Express.js or Fastify (decision: Express for broader ecosystem)
- **Language:** TypeScript
- **API Style:** REST with OpenAPI/Swagger contracts
- **Database:** PostgreSQL 15+
- **ORM:** Prisma (type-safe, migrations, excellent DX)
- **Job Queue:** BullMQ (Redis-backed, reliable)
- **Logging:** Structured JSON (pino)
- **Monitoring:** CloudWatch + Datadog (optional)
- **Deployment:** AWS ECS/Fargate + ALB

### Data & Storage
- **Primary Database:** PostgreSQL (managed AWS RDS)
- **Session Store:** Redis (AWS ElastiCache)
- **Document Storage:** AWS S3 (private buckets, SSE-KMS)
- **KMS:** AWS KMS (customer-managed keys)
- **Backups:** Automated RDS snapshots + S3 versioning

### Identity & Security
- **Password Hashing:** Argon2 (via bcryptjs)
- **Token Generation:** Cryptographically secure random bytes (crypto.randomBytes)
- **Sessions:** Server-side with secure HttpOnly cookies
- **MFA:** TOTP (Time-based One-Time Password)
- **TLS:** All external communication
- **Secrets:** AWS Secrets Manager

### Infrastructure
- **Cloud Provider:** AWS
- **Compute:** ECS Fargate
- **Database:** RDS PostgreSQL
- **Cache:** ElastiCache Redis
- **Storage:** S3 + CloudFront
- **Load Balancer:** Application Load Balancer (ALB)
- **DNS:** Route 53
- **Certificates:** AWS Certificate Manager
- **KMS:** AWS KMS
- **IaC:** Terraform
- **CI/CD:** GitHub Actions
- **Monitoring:** CloudWatch + optional Datadog
- **Email:** AWS SES or Sendgrid

### Billing
- **Payment Processor:** Stripe
- **SDK:** Stripe Node.js library
- **Webhooks:** Verified signatures, idempotent processing

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│  Marketing Website | App Shell | Admin Dashboard        │
└────────────────────────┬────────────────────────────────┘
                         │
                    HTTPS/TLS
                         │
     ┌───────────────────┴───────────────────┐
     │                                       │
┌────▼─────────────────────────┐  ┌────────▼──────────────┐
│   API Server (Express)        │  │ Background Workers    │
│ - Auth endpoints              │  │ (BullMQ/Node.js)      │
│ - Org/tenant management       │  │ - File scanning       │
│ - File upload/download        │  │ - Email delivery      │
│ - Room operations             │  │ - Billing sync        │
│ - Admin operations            │  │ - Cleanup jobs        │
│ - Audit log queries           │  │ - Notifications       │
└────┬──────────────────────────┘  └────────┬──────────────┘
     │                                      │
     └──────────────┬───────────────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
    ┌────▼──────────┐  ┌──────▼─────────┐
    │  PostgreSQL   │  │  Redis (Cache  │
    │  - Users      │  │  + Jobs +      │
    │  - Orgs       │  │  Sessions)     │
    │  - Files      │  └────────────────┘
    │  - Rooms      │
    │  - Audit logs │
    │  - Subscriptions
    └────┬──────────┘
         │
         └──────────────────┬──────────────────┐
                            │                  │
                       ┌────▼──────┐  ┌──────▼────┐
                       │  AWS S3    │  │  AWS KMS  │
                       │ (encrypted)│  │ (key mgmt)│
                       └────────────┘  └───────────┘
```

---

## Database Schema (Summary)

### Core Tables

**users**
- id (UUID, PK)
- email (UNIQUE)
- password_hash (Argon2)
- email_verified (boolean)
- mfa_enabled (boolean)
- mfa_secret (encrypted)
- created_at
- updated_at

**organizations**
- id (UUID, PK)
- name
- slug (UNIQUE)
- owner_id (FK → users)
- subscription_id (FK → subscriptions)
- storage_quota_bytes
- user_limit
- guest_limit
- created_at
- updated_at

**organization_memberships**
- id (UUID, PK)
- organization_id (FK)
- user_id (FK)
- role (owner|admin|member)
- joined_at

**files**
- id (UUID, PK)
- organization_id (FK) [tenant isolation]
- room_id (FK → rooms, nullable)
- storage_key (S3 path)
- filename
- mime_type
- size_bytes
- status (initiated|uploading|uploaded|scanning|available|rejected|expired|revoked)
- virus_scan_status (pending|clean|infected|error)
- expires_at
- created_at
- created_by_id (FK → users)

**exchange_rooms**
- id (UUID, PK)
- organization_id (FK) [tenant isolation]
- name
- description
- created_by_id (FK → users)
- expires_at
- is_archived
- created_at
- updated_at

**room_members**
- id (UUID, PK)
- room_id (FK)
- user_id (FK, nullable)
- email (nullable, for external guests)
- role (owner|member|viewer)
- access_expires_at
- can_download (boolean)
- download_limit (int, nullable)
- created_at

**file_access_tokens**
- id (UUID, PK)
- file_id (FK)
- room_id (FK)
- created_for_email (email of intended recipient)
- token (secure random bytes, hashed)
- expires_at
- is_single_use
- download_count
- download_limit
- created_at

**audit_events**
- id (UUID, PK)
- organization_id (FK) [tenant isolation]
- event_type (user.registered|user.login|file.uploaded|file.downloaded|etc.)
- actor_id (FK → users, nullable for system)
- actor_email (nullable for guests)
- resource_type (user|file|room|org|etc.)
- resource_id (UUID)
- details (JSONB, NO sensitive data)
- ip_address (masked)
- user_agent (masked)
- timestamp (server-generated)

**subscriptions**
- id (UUID, PK)
- organization_id (FK, UNIQUE)
- stripe_customer_id
- stripe_subscription_id
- plan (starter|business|enterprise)
- status (trialing|active|past_due|canceled)
- current_period_start
- current_period_end
- trial_end (nullable)
- canceled_at (nullable)
- created_at
- updated_at

**subscription_entitlements**
- subscription_id (FK, PK part)
- feature_key (string, PK part)
- limit_value (int, nullable)
- created_at

---

## API Design (REST)

### Authentication
- `POST /api/auth/register` — Create account
- `POST /api/auth/verify-email` — Verify email token
- `POST /api/auth/login` — Authenticate (returns session)
- `POST /api/auth/logout` — Clear session
- `POST /api/auth/mfa-setup` — Initialize TOTP
- `POST /api/auth/mfa-verify` — Verify TOTP during login
- `POST /api/auth/password-reset-request` — Send reset email
- `POST /api/auth/password-reset` — Reset password with token

### Organizations
- `POST /api/organizations` — Create organization
- `GET /api/organizations/:id` — Get organization details
- `PUT /api/organizations/:id` — Update organization
- `GET /api/organizations/:id/members` — List members
- `POST /api/organizations/:id/invitations` — Invite member
- `DELETE /api/organizations/:id/members/:memberId` — Remove member

### Files & Upload
- `POST /api/files/initialize-upload` — Get presigned URL, session ID
- `PUT /api/{uploadId}/{partNumber}` — Upload part (to S3 presigned URL)
- `POST /api/files/complete-upload` — Finalize upload, trigger scanning
- `GET /api/files/:id/download-link` — Get presigned download URL (authorized)
- `GET /api/files/:id/info` — Get file metadata
- `DELETE /api/files/:id` — Mark for deletion (soft delete initially)

### Exchange Rooms
- `POST /api/rooms` — Create room
- `GET /api/rooms/:id` — Get room details
- `PUT /api/rooms/:id` — Update room
- `GET /api/rooms/:id/files` — List files in room
- `POST /api/rooms/:id/add-file` — Add file to room
- `GET /api/rooms/:id/members` — List room members
- `POST /api/rooms/:id/invite` — Invite recipient
- `DELETE /api/rooms/:id/members/:email` — Revoke access
- `POST /api/rooms/:id/archive` — Archive room

### Guest Access
- `POST /api/guest/verify-email` — Verify email for access (unauthenticated)
- `GET /api/guest/access/:token` — Get authorized resources (unauthenticated)
- `GET /api/guest/files/:fileId/download` — Download as guest (unauthenticated, token-verified)

### Admin Dashboard
- `GET /api/org/dashboard` — Organization overview
- `GET /api/org/audit-log` — Audit events (with pagination)
- `POST /api/org/audit-log/export` — Export audit log (CSV)
- `GET /api/org/usage` — Storage/user usage
- `GET /api/org/notifications` — Recent notifications

---

## Tenant Isolation Strategy

**Principle:** Every data access enforces tenant authorization. No cross-tenant data leakage.

### Implementation

1. **Database Level**
   - Every table referencing a tenant has organization_id column
   - Foreign keys enforce consistency
   - Row-level security rules (database level) for bonus isolation
   - Queries always filter by `organization_id`

2. **Application Level**
   - Extract organization_id from authenticated session
   - Verify membership before returning data
   - All queries parameterized (prevent SQL injection)
   - Every controller checks authorization before operation

3. **API Level**
   - Organization ID extracted from URL path, never from request body
   - No guessing based on object ID
   - Return 404 for unauthorized access (prevent enumeration)

4. **Testing**
   - Create independent test organizations
   - Adversarial tests attempting cross-tenant access
   - All denied with 404 or 403

---

## Security Architecture

### Encryption at Rest
- S3 files encrypted with SSE-KMS (AWS managed keys initially, customer keys later)
- Database encrypted (RDS encryption enabled)
- Sensitive fields (MFA secrets, passwords) encrypted before storage
- Backups encrypted

### Encryption in Transit
- All external communication over TLS 1.3+
- Certificate pinning optional for ultra-sensitive flows
- Internal services communicate over encrypted channels

### Key Management
- AWS KMS for key storage and rotation
- Application never has raw key material
- Decryption happens server-side only
- Key access audit logging

### Secret Management
- No secrets in code or environment files
- AWS Secrets Manager for all secrets
- Rotated regularly (password, API keys, etc.)

### Authentication
- Passwords hashed with Argon2 (bcryptjs)
- Sessions server-side with secure HttpOnly cookies
- CSRF tokens for state-changing operations
- MFA for sensitive operations

### Authorization
- Role-based access control (RBAC)
- Fine-grained permissions for P1+
- Default deny (whitelist approach)

---

## File Security Pipeline

### States
- INITIATED → UPLOADING → UPLOADED → SCANNING → AVAILABLE (or REJECTED)
- From AVAILABLE: EXPIRED, REVOKED, DELETION_PENDING
- Final: DELETED

### Protections
1. File type allowlist (whitelist approach)
2. File extension validation (MIME type + magic bytes)
3. Maximum size enforcement
4. Archive depth limits (prevent zip bombs)
5. Malware scanning (integration with ClamAV or commercial scanner)
6. Quarantine on detection
7. No public S3 exposure (private URLs only)
8. No file execution (application/x-executable blocked)
9. Controlled downloads via scoped presigned URLs
10. Safe response headers (Content-Disposition: attachment; filename=..., no-cache headers)

---

## Monitoring & Observability

### Metrics
- Request latency (p50, p95, p99)
- Error rate by endpoint
- Database query time
- S3 operation latency
- Queue depth and job duration
- Cache hit/miss rates
- Authentication success/failure rates
- File upload/download volume

### Logs
- Structured JSON logging (pino)
- Request correlation IDs
- Security events (login, access denial, etc.)
- Error stack traces (no sensitive data)
- Audit events (separate stream)

### Alerts
- High error rate (>5% 4xx/5xx)
- Database connection pool exhaustion
- Queue backlog growing
- Suspicious login patterns
- Security scan failures
- Payment webhook failures
- Storage quota exceeded

---

## Compliance & Controls

### OWASP ASVS 5.0 Coverage
- V1: Architecture (documented)
- V2: Authentication (password, MFA, session)
- V4: Access Control (authorization checks)
- V5: Input Validation (type-safe TS + runtime validation)
- V6: Crypto (TLS, encryption at rest)
- V8: Data Protection (encryption, minimization, retention)
- V9: Communications (TLS, CSRF, headers)
- V10: Malicious Code (dependency scanning, secrets scanning)
- V11: Business Logic (quota enforcement, etc.)
- V12: Files & Resources (file type control, safe downloads)
- V13: API & Web Services (input validation, CORS, rate limiting)
- V14: Configuration (secrets management, secure defaults)

### Threat Model Mitigations
- Cross-tenant access → tenant isolation testing
- Account takeover → MFA, rate limiting, password reset security
- Malware distribution → malware scanning
- Credential stuffing → rate limiting, account lockout
- Insider abuse → audit logging, role separation
- Token leakage → secure token generation, expiration
- SSRF → network policies, internal service validation

---

**Status:** Phase 0 → Phase 1 (Foundation Implementation)
**Last Updated:** 2026-10-16
