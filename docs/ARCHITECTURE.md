# 🏗️ SECURE FILE EXCHANGE - SYSTEM ARCHITECTURE

**Enterprise-Grade Architecture Documentation**

*Version: 1.0*  
*Last Updated: 2026-11-03*  
*Audience: Security Teams, CISOs, Technical Decision Makers*

---

## EXECUTIVE SUMMARY

Secure File Exchange (SFX) is a cloud-native, multi-tenant SaaS platform providing enterprise-grade secure file sharing with end-to-end encryption, comprehensive audit trails, and strict tenant isolation.

**Key Characteristics:**
- Multi-tenant architecture with cryptographic isolation
- AES-256-GCM encryption per organization
- Bank-grade security controls
- GDPR/HIPAA-ready compliance
- 99.9% uptime SLA
- < 500ms API latency (P99)

---

## SYSTEM ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                     End Users (Browsers/APIs)                   │
├──────────────────────────────────────────────────────────────────┤
                                │
                    ┌───────────┼───────────┐
                    │           │           │
            ┌───────▼────┐  ┌───▼────┐  ┌──▼─────┐
            │ CloudFront │  │  WAF   │  │  DDoS  │
            │    (CDN)   │  │        │  │ Shield │
            └────────────┘  └────────┘  └────────┘
                    │
        ┌───────────┼───────────┐
        │  DNS (Route 53)       │
        └───────────┼───────────┘
                    │
        ┌───────────▼───────────┐
        │ Load Balancer (ALB)   │
        │ (Multi-AZ)            │
        └───────────┬───────────┘
        
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐   ┌─────▼─────┐   ┌───▼────┐
│ ECS    │   │  ECS      │   │ ECS    │
│Cluster │   │ Cluster   │   │Cluster │
│(Web)   │   │ (API)     │   │(Worker)│
│AZ-1    │   │ AZ-1      │   │ AZ-1   │
└───┬────┘   └─────┬─────┘   └───┬────┘
    │              │             │
    └──────────────┼─────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐   ┌─────▼─────┐   ┌───▼────┐
│ RDS    │   │ ElastiC   │   │ S3     │
│(Multi- │   │ ache Redis│   │Versio- │
│AZ)     │   │(Multi-AZ) │   │ned)    │
└────────┘   └───────────┘   └────────┘

        ┌────────────┬────────────┐
        │            │            │
    ┌───▼──┐    ┌────▼────┐ ┌───▼──┐
    │ KMS  │    │Secrets  │ │ Logs │
    │(Keys)│    │Manager  │ │CWatch│
    └──────┘    └─────────┘ └──────┘
```

---

## COMPONENT OVERVIEW

### 1. PRESENTATION LAYER

#### 1.1 Web Application (Next.js)
- **Framework:** React 19 + Next.js 14  
- **Deployment:** ECS (Fargate)  
- **Replicas:** 2-4 (auto-scaling)  
- **Resources:** 1 vCPU, 2GB RAM per task  
- **Rendering:** Server-side + client-side  

**Pages:**
- Landing page (marketing)
- Authentication (signup/login/reset)
- Dashboard (organization)
- Admin dashboard (users, rooms, audit log, billing)
- Billing/subscription management

**Security:**
- CSRF tokens on all forms
- Secure session cookies (HttpOnly, Secure, SameSite)
- Content Security Policy headers
- XSS protection (HTML encoding)

#### 1.2 CloudFront (CDN)
- **Purpose:** Static asset delivery, caching
- **Cache Strategy:** 
  - HTML pages: 1 hour
  - CSS/JS: 7 days
  - Images: 30 days
- **SSL/TLS:** AWS Certificate Manager (auto-renewed)
- **Origin:** Application Load Balancer

---

### 2. API LAYER

#### 2.1 API Server (Express.js)
- **Framework:** Express.js + TypeScript  
- **Deployment:** ECS (Fargate)  
- **Replicas:** 2-6 (auto-scaling)  
- **Resources:** 2 vCPU, 4GB RAM per task  
- **Endpoints:** 35+ (REST API)  

**Core Services:**
```
POST   /api/v1/auth/signup           → Register account
POST   /api/v1/auth/login            → Authenticate user
GET    /api/v1/organizations         → Get org details
POST   /api/v1/files/upload          → Upload file (encrypted)
GET    /api/v1/files/:id/download    → Download file (decrypted)
POST   /api/v1/rooms                 → Create exchange room
PATCH  /api/v1/rooms/:id             → Update room settings
POST   /api/v1/rooms/:id/members     → Add member to room
POST   /api/v1/billing/checkout      → Initiate Stripe checkout
GET    /api/v1/dashboard/stats       → Get org statistics
GET    /api/v1/audit                 → Get audit logs
```

**Security Middleware:**
- JWT token validation on every request
- Organization context enforcement
- Rate limiting (100 req/min per IP)
- CSRF token validation
- Input validation (Zod schemas)
- Request logging (audit trail)

#### 2.2 Health Checks
- **Endpoint:** `GET /health`
- **Response:** Server status, timestamp, uptime
- **Frequency:** ECS checks every 30 seconds
- **Failure Action:** Auto-restart task after 3 failures

---

### 3. DATA LAYER

#### 3.1 PostgreSQL Database (RDS)
- **Engine:** PostgreSQL 14+
- **Deployment:** Multi-AZ (automatic failover)
- **Instance:** db.t4g.medium (production baseline)
- **Storage:** 100GB (expandable)
- **Encryption:** AWS KMS at-rest encryption
- **Backups:** Automated daily (7-day retention)

**Schema:**
```sql
-- Tenants
organizations (id, name, domain, storageQuota)

-- Users
users (id, email, password_hash, organizationId)
organizationMemberships (userId, organizationId, role)

-- Files & Storage
files (id, organizationId, storageKey, sizeBytes, created)
fileAccess (id, fileId, userId, downloadCount, expiresAt)

-- Rooms & Sharing
rooms (id, organizationId, name, created)
roomMembers (id, roomId, userId, role, expiresAt, downloadLimit)
roomFiles (roomId, fileId, order)

-- Billing & Subscriptions
subscriptions (organizationId, plan, stripeCustomerId, status)
billingEvents (id, organizationId, type, amount, timestamp)

-- Audit & Compliance
auditLogs (id, organizationId, userId, action, resource, timestamp)
userSessions (id, userId, token, expiresAt, ipAddress)
```

**Connections:**
- Connection pooling: 20-50 concurrent connections
- Query timeout: 30 seconds
- SSL/TLS: Enforced for all connections

#### 3.2 Redis (ElastiCache)
- **Engine:** Redis 7+
- **Deployment:** Multi-AZ (automatic failover)
- **Instance:** cache.t4g.micro
- **Purpose:** Session storage, rate limiting
- **TTL:** 24 hours for sessions
- **Encryption:** In-transit (TLS) + at-rest

**Data Stored:**
- User sessions: `session:{userId} → {token, expiry, permissions}`
- Rate limit counters: `ratelimit:{ip} → {count, window}`
- Cache: `cache:{key} → {value}`

---

### 4. STORAGE LAYER

#### 4.1 Amazon S3 (File Storage)
- **Bucket:** sfx-staging-files (default)
- **Encryption:** AES-256 (server-side)
- **Versioning:** Enabled (30-day cleanup policy)
- **Public Access:** Blocked (private by default)
- **Logging:** Access logs to separate bucket

**File Organization:**
```
sfx-staging-files/
├── org-{orgId}/
│   ├── raw/
│   │   ├── {fileId}.bin (encrypted content)
│   │   └── {fileId}.metadata.json
│   └── archived/ (old versions)
└── logs/ (access logs)
```

**Lifecycle Policies:**
- Delete incomplete multipart uploads after 7 days
- Archive old versions to Glacier after 30 days
- Delete versions older than 90 days

#### 4.2 Pre-signed URLs
- **Purpose:** Secure file downloads without exposing credentials
- **Expiration:** 1 hour (configurable)
- **Format:** `https://s3.amazonaws.com/bucket/key?Signature=...`
- **Usage:** Download initiated via API

---

### 5. SECURITY LAYER

#### 5.1 Encryption Pipeline

**File Upload Flow:**
```
1. User uploads file via browser
   ├─ File chunked (5MB chunks for resumable upload)
   └─ Calculate SHA-256 hash (integrity check)

2. API receives file
   ├─ Validate file type (whitelist: PDF, DOCX, images, etc.)
   ├─ Check file size (max 100MB)
   ├─ Run malware scan (ClamAV)
   └─ Return result (proceed or reject)

3. Encryption (per-organization)
   ├─ Get organization encryption key (via PBKDF2)
   │  - Salt: organizationId
   │  - Iterations: 100,000
   │  - Output: 256-bit key
   │
   ├─ Generate IV (Initialization Vector)
   │  - Random 12 bytes
   │  - Unique per file
   │
   └─ Encrypt file with AES-256-GCM
      - Plaintext: file content
      - Additional Authenticated Data (AAD): organizationId
      - Output: ciphertext + 16-byte auth tag

4. Store encrypted data
   ├─ S3 put: {fileId}.bin (encrypted content)
   ├─ S3 put: {fileId}.metadata.json
   │  {
   │    "iv": "...", 
   │    "tag": "...",
   │    "originalName": "...",
   │    "fileSize": 1024
   │  }
   └─ Database: Record created in `files` table

5. Return to client
   └─ Response: {fileKey, iv, tag, fileSize}
```

**File Download Flow:**
```
1. User requests download
   ├─ API validates membership in room
   ├─ API checks access not expired
   └─ API checks download limit not exceeded

2. API generates pre-signed URL (expires in 1 hour)
   └─ S3 returns URL

3. Client downloads encrypted file from S3
   ├─ Get {fileId}.bin
   └─ Get {fileId}.metadata.json (iv, tag)

4. Client decrypts (in browser)
   ├─ Derive organization key (same PBKDF2)
   ├─ Decrypt with AES-256-GCM
   │  - Ciphertext: downloaded file
   │  - IV: from metadata
   │  - Auth tag: from metadata
   │  - AAD: organizationId
   └─ Verify integrity (auth tag check)

5. Display to user
   └─ Browser handles file (download/preview)
```

#### 5.2 Key Management

**Key Derivation (PBKDF2):**
```
Input:
  - Password: (fixed string per deployment)
  - Salt: organizationId (as bytes)
  - Iterations: 100,000
  - Hash: SHA-256
  - Output Length: 32 bytes (256 bits)

Output:
  - 256-bit encryption key for organization
  - Derived at runtime (no persistent keys)
  - Unique per organization
  - Never stored in database
```

**AWS KMS:**
- Encrypts database connections
- Encrypts S3 storage
- Manages certificate keys
- Automatic key rotation

#### 5.3 Authentication & Authorization

**JWT Tokens:**
```json
{
  "sub": "user-{userId}",
  "org": "{organizationId}",
  "role": "owner|member|viewer",
  "exp": 1735689600,
  "iat": 1735603200
}
```

**Validation Flow:**
```
1. Request arrives with Authorization header
   └─ Extract token from "Bearer {token}"

2. Verify token signature
   ├─ Algorithm: HS256
   └─ Secret: Stored in AWS Secrets Manager

3. Check expiration
   ├─ Compare exp claim to current time
   └─ Reject if expired

4. Extract claims
   ├─ userId from 'sub'
   ├─ organizationId from 'org'
   └─ role from 'role'

5. Verify organization membership
   ├─ Query organizationMemberships table
   ├─ Confirm user is member of org
   └─ Attach to request context

6. Proceed to route handler
   └─ All subsequent database queries filtered by organizationId
```

#### 5.4 Multi-Tenant Isolation

**Database Level:**
```sql
-- Every query filters by organizationId
SELECT * FROM files 
WHERE organizationId = $1  -- Enforced in service layer

SELECT * FROM rooms
WHERE organizationId = $1  -- Organization context required
```

**Service Level:**
```typescript
// RoomService validates org context
async hasAccess(userId: string, roomId: string, orgId: string) {
  const room = await db.room.findUnique({
    where: { id: roomId },
  });
  
  // CRITICAL: Verify room belongs to request org
  if (room.organizationId !== orgId) {
    throw new UnauthorizedError("Access denied");
  }
  
  // Proceed with permission check
  return this.checkMembership(userId, roomId);
}
```

**API Level:**
```
GET /api/v1/rooms/room-123
  ├─ Extract org from JWT token
  ├─ Query database: WHERE roomId = 'room-123' AND orgId = '{org}'
  ├─ If not found → Return 404 (not 403, prevents info leakage)
  └─ If access denied → Return 403
```

---

### 6. EXTERNAL INTEGRATIONS

#### 6.1 Stripe (Payment Processing)
- **Purpose:** Subscription billing
- **Integration:** REST API
- **Security:** Webhook signature verification
- **Data:** Minimal customer PII exchanged
- **PCI Compliance:** Stripe handles card data (SAP)

**Webhook Events:**
- `invoice.payment_succeeded` → Update subscription status
- `invoice.payment_failed` → Send alert to customer
- `customer.subscription.updated` → Update plan in database
- `customer.subscription.deleted` → Mark subscription canceled

#### 6.2 ClamAV (Malware Scanning)
- **Purpose:** Scan uploaded files for malware
- **Integration:** TCP socket (port 3310)
- **Protocol:** INSTREAM scanning (real-time)
- **Fallback:** Conservative (reject if unavailable)
- **Signature Updates:** Automatic

**Scan Flow:**
```
1. File received from client
2. Connect to ClamAV daemon (localhost:3310)
3. Send INSTREAM command + file size
4. Stream file content
5. Receive scan result
   ├─ OK → Proceed with encryption/storage
   └─ INFECTED → Reject file, log incident, alert user
```

---

## 7. MONITORING & OBSERVABILITY

### 7.1 CloudWatch Dashboards

**API Dashboard:**
- Request rate (requests/sec)
- Error rate (% of requests returning 4xx/5xx)
- Latency (P50, P95, P99)
- Active connections
- CPU utilization
- Memory utilization

**Database Dashboard:**
- Query execution time
- Connection count
- Replication lag (Multi-AZ)
- Storage growth
- CPU/Memory
- IOPS consumed

**Business Metrics Dashboard:**
- Daily signups
- Files uploaded
- Total storage used
- Active organizations
- Subscription status

### 7.2 Alarms

| Metric | Threshold | Action |
|--------|-----------|--------|
| API Error Rate | > 5% for 5 min | SNS notification |
| Database CPU | > 80% for 10 min | Auto-scale |
| Memory Usage | > 85% | Alert + manual review |
| Replication Lag | > 10 seconds | Alert |
| Disk Usage | < 10% free | Urgent alert |

### 7.3 Logging

**Application Logs:**
- Stored in CloudWatch Logs (/ecs/sfx-api)
- Retention: 7 days
- Format: JSON (timestamp, level, message, context)
- PII Redacted: Passwords, tokens never logged

**Audit Logs:**
- Stored in PostgreSQL (`auditLogs` table)
- Retention: 90 days (configurable)
- Immutable: Append-only
- Fields: userId, action, resource, timestamp, result

---

## 8. DISASTER RECOVERY

### 8.1 Backup Strategy
- **RDS:** Automated daily snapshots (7-day retention)
- **S3:** Versioning enabled (90-day cleanup policy)
- **Cross-Region:** Replicated to secondary region
- **Restore Test:** Monthly

### 8.2 Failover
- **Database:** Automatic Multi-AZ failover (< 5 minutes)
- **Application:** ECS auto-restart on unhealthy tasks
- **Storage:** S3 bucket in multiple regions
- **DNS:** Route 53 health checks + failover routing

### 8.3 RTO/RPO
- **RTO:** 1 hour maximum
- **RPO:** 1 hour maximum (continuous replication)

---

## 9. SCALABILITY

### 9.1 Horizontal Scaling
- **API:** 2-6 tasks (auto-scaling)
  - Scale up: CPU > 70% for 2 minutes
  - Scale down: CPU < 40% for 5 minutes
- **Web:** 2-4 tasks (auto-scaling)
- **Database:** Read replicas (manual setup for high-load)

### 9.2 Vertical Scaling
- **Instance Types:** ECS uses t4g instances (burstable)
- **Database:** Can upgrade RDS instance class
- **Storage:** S3 and Redis handle unlimited data

### 9.3 Performance Targets
- **API Latency:** P99 < 500ms
- **Uptime:** 99.9% (< 43 minutes downtime/month)
- **Concurrent Users:** 10,000+ supported
- **Storage:** Unlimited (S3 scalable)

---

## 10. COMPLIANCE & STANDARDS

### 10.1 Standards Addressed
- **OWASP Top 10:** All controls implemented
- **GDPR:** Data processing agreements, privacy controls
- **HIPAA:** Ready (BAA available on request)
- **SOC 2:** Type II audit in progress

### 10.2 Data Residency
- **Default:** US East region
- **EU Option:** EU Central region (separate deployment)
- **Customer Choice:** Configurable at signup

---

## 11. SECURITY TESTING

### 11.1 Automated Tests
- **Unit Tests:** 65+ security-focused tests
- **Integration Tests:** Full request flow validation
- **API Tests:** 35+ endpoint tests
- **Encryption Tests:** Key derivation, encryption/decryption

### 11.2 Manual Testing
- **OWASP Top 10:** Validation against each category
- **Penetration Testing:** Quarterly (3rd party)
- **Code Review:** Security focus on all PRs

---

## 12. INCIDENT RESPONSE

### 12.1 Detection
- Automated monitoring (CloudWatch)
- Real-time alerts (SNS)
- Manual review (daily logs)

### 12.2 Response
1. Alert triggered
2. On-call engineer notified
3. Investigation begins
4. Severity classified
5. Remediation plan created
6. Fix deployed
7. Incident closed

### 12.3 Communication
- Internal: Slack
- Customer: Status page + email
- Public: Blog post (30 days post-incident)

---

## 13. CONTACT & SUPPORT

**Security Issues:** security@securefileexchange.com  
**Technical Questions:** support@securefileexchange.com  
**Compliance:** compliance@securefileexchange.com  

---

**© 2026 Secure File Exchange. Confidential.**

*This document contains proprietary architecture details. Distribution is restricted to authorized recipients.*
