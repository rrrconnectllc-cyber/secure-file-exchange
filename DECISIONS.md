# SFX Technical Decisions

## Decision Log

Track all significant technical decisions with rationale, alternatives considered, and impact.

---

## D001: Frontend Framework - Next.js 14+

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use Next.js 14+ with React 19 and TypeScript for the frontend.

**Rationale:**
- Full-stack capability (API routes + frontend)
- Excellent developer experience
- Strong TypeScript support
- Vercel deployment option (easy staging/production)
- Server components for optimization
- Built-in image optimization, SEO
- Large ecosystem
- Suitable for enterprise SaaS

**Alternatives Considered:**
1. Vite + React — lighter, faster builds, less opinionated
   - Rejected: Requires separate backend, less integrated
2. Remix — excellent data loading
   - Rejected: Smaller ecosystem, less proven for enterprise
3. SvelteKit — excellent DX
   - Rejected: Smaller ecosystem, harder to hire

**Trade-offs:**
- Node.js requirement for hosting (acceptable, widely supported)
- Larger bundle size than Vite (mitigated by optimization features)

**Impact:** Phase 2 (design) will use Next.js patterns, middleware, API routes

---

## D002: Backend Framework - Express.js

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use Express.js for backend API with TypeScript.

**Rationale:**
- Lightweight, proven framework (20+ years)
- Excellent middleware ecosystem
- Strong TypeScript support
- Many security/auth libraries available
- Easy to understand and audit
- Suitable for secure/compliance-sensitive work

**Alternatives Considered:**
1. NestJS — opinionated, full-featured
   - Rejected: Over-engineered for initial MVP, complex DI
2. Fastify — fast, modern
   - Rejected: Smaller ecosystem, emerging
3. Koa — minimal core
   - Rejected: Even lighter than Express, less default security

**Trade-offs:**
- Less opinionated than NestJS (requires more setup)
- Smaller built-in feature set (mitigated by middleware)

**Impact:** Phase 1 will establish Express app structure with middleware for auth, logging, errors

---

## D003: Database - PostgreSQL 15+

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use PostgreSQL 15+ for primary data storage.

**Rationale:**
- ACID compliance (critical for financial/billing accuracy)
- Excellent security features (encryption, row-level security)
- Strong JSON/JSONB support (flexible audit logs)
- Proven for enterprise workloads
- Excellent backup/recovery tools
- Strong constraint enforcement (data integrity)

**Alternatives Considered:**
1. MySQL 8 — also strong, ACID-compliant
   - Rejected: Postgres has better security features, stronger constraints
2. MongoDB — flexible schema
   - Rejected: Weak ACID, risky for billing/authorization
3. DynamoDB — AWS-native
   - Rejected: Limited query flexibility, complex authorization modeling

**Trade-offs:**
- Operational complexity (more to monitor)
- Slightly higher resource usage vs. lighter options

**Impact:** Phase 1 schema design, Prisma migration setup

---

## D004: ORM - Prisma

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use Prisma for database abstraction and migrations.

**Rationale:**
- Type-safe query building (catch errors at compile time)
- Excellent TypeScript support
- Clean migration system (migrations as files)
- Built-in shadow database for migration testing
- Good performance
- Visual schema editor

**Alternatives Considered:**
1. TypeORM — full-featured ORM
   - Rejected: More complex, decorators for config
2. Raw SQL — maximal control
   - Rejected: SQL injection risk, harder to maintain
3. Sequelize — mature
   - Rejected: Older patterns, less TypeScript-friendly

**Trade-offs:**
- Vendor lock-in to Prisma (mitigated by clear SQL exports)
- Some complex queries require raw SQL

**Impact:** Phase 1 schema setup, Phase 4+ query implementations

---

## D005: Identity & Authentication - NextAuth.js + Custom Password

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use NextAuth.js for session management + custom password authentication with Argon2.

**Rationale:**
- NextAuth.js handles OAuth/social login (future)
- Session management battle-tested
- Server-side sessions with database backing
- No vendor lock-in (unlike Auth0)
- Credentials provider for password auth
- CSRF protection built-in
- SameSite cookies default

**Alternatives Considered:**
1. Auth0 — fully managed
   - Rejected: Vendor lock-in, cost for B2B
2. Clerk — modern, but
   - Rejected: Vendor lock-in, simpler than our security needs
3. Custom implementation — full control
   - Rejected: Security errors likely, reinventing crypto

**Trade-offs:**
- Database dependency for sessions (mitigated by Redis for performance)
- Some setup complexity

**MFA Decision:** TOTP (Time-based One-Time Password) via speakeasy + backup codes
- Rejected alternatives: SMS (lower security), push (requires app)

**Password Hashing:** Argon2 via bcryptjs
- Rejected alternatives: bcrypt alone (sufficient but older), scrypt (less hardware-resistant)

**Impact:** Phase 3 authentication implementation

---

## D006: File Storage - AWS S3 with KMS Encryption

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Store customer files in AWS S3 with server-side encryption using AWS KMS.

**Rationale:**
- S3 is industry-standard for secure file storage
- KMS encryption separates key management from storage
- Managed service (no infrastructure to maintain)
- Excellent audit logging (CloudTrail)
- Scalable (no size limits)
- Cost-effective (pay per GB)
- Easy to implement lifecycle policies

**Alternatives Considered:**
1. Azure Blob Storage — equally capable
   - Rejected: AWS is default, no compelling advantage
2. Self-hosted encrypted storage — full control
   - Rejected: Complexity, security harder
3. Wasabi/B2 — cheaper
   - Rejected: Less feature-rich, AWS preferred

**KMS Approach:** Customer-managed KMS keys (customer can rotate)
- Phase 1: AWS-managed keys (simpler)
- Phase 2+: Customer-managed keys (enterprise feature)

**Trade-offs:**
- AWS vendor lock-in (acceptable, best practice)
- KMS API latency (minimal, async operations)

**Impact:** Phase 1 S3 integration, Phase 4 file upload/download

---

## D007: Job Queue - BullMQ (Redis-backed)

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use BullMQ for background job processing (file scanning, email, etc.).

**Rationale:**
- Redis-backed, proven reliability
- Built-in retry, exponential backoff
- Job persistence (survives restarts)
- Good error handling
- Excellent TypeScript support
- Clear monitoring/inspection

**Alternatives Considered:**
1. Bull (older version of BullMQ)
   - Rejected: Older, BullMQ is actively maintained
2. AWS SQS + Lambda — managed
   - Rejected: Less control, adds complexity
3. Simple EventEmitter — lightweight
   - Rejected: Not durable, no persistence

**Trade-offs:**
- Redis dependency (add to infrastructure)
- Job inspection requires additional tooling

**Impact:** Phase 4 (file scanning), Phase 7 (billing webhooks)

---

## D008: Infrastructure - AWS

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use AWS as primary cloud provider.

**Key Services:**
- ECS Fargate (containers, no VM management)
- RDS PostgreSQL (managed database)
- S3 (file storage)
- KMS (key management)
- ElastiCache Redis (cache, sessions, job queue)
- ALB (load balancing)
- Route 53 (DNS)
- ACM (SSL certificates)
- CloudWatch (monitoring)
- CloudTrail (audit logging)
- Secrets Manager (secret storage)
- VPC (networking, security)

**Rationale:**
- Market leader, most mature
- Excellent security features
- Strong compliance certifications
- Good cost controls
- Terraform support

**Alternatives Considered:**
1. Azure — equally capable
   - Rejected: AWS is default
2. GCP — strong on data/ML
   - Rejected: Less common for enterprise SaaS
3. Self-hosted — full control
   - Rejected: Security, operations complexity

**IaC:** Terraform for all AWS resources

**Trade-offs:**
- AWS vendor lock-in (standard, acceptable)
- Cost control requires vigilance (budget alerts)

**Impact:** Phases 1, 9, 12 (infrastructure setup)

---

## D009: Billing - Stripe

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use Stripe for payment processing and subscription management.

**Rationale:**
- Industry standard for SaaS
- Excellent security (PCI compliance handled)
- Strong webhook system
- Good TypeScript SDK
- Excellent documentation
- Suitable for enterprise plans

**Alternatives Considered:**
1. Paddle — good EU support
   - Rejected: Smaller ecosystem, similar features
2. Chargebee — advanced billing
   - Rejected: Over-featured for MVP
3. Raw payment processor — full control
   - Rejected: PCI compliance complexity

**Payment Mode:** Test mode (staging), Live mode only after approval

**Webhook Signature Verification:** Mandatory on all webhooks (security requirement)

**Impact:** Phase 7 billing implementation

---

## D010: Tenant Isolation - Pervasive Enforcement

**Date:** 2026-10-16
**Status:** APPROVED (CRITICAL)

**Decision:** Enforce tenant isolation at all layers: database, application, API.

**Principle:** Every data access must verify organization membership.

**Implementation:**
- Database: organization_id on every table
- App: authorization check before returning data
- API: 404 for unauthorized access (prevent enumeration)
- Tests: Adversarial cross-tenant tests

**Impact:** RELEASE GATE - Phase 3

---

## D011: Malware Scanning - Integration Approach

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Integrate with ClamAV (free) or commercial scanning API (VirusTotal, Metadefender) for production.

**Rationale:**
- Files scanned before marked AVAILABLE
- Infected files quarantined (not deleted)
- Scanner failure prevents access (fail-secure)
- No delivery of unscanned files

**Alternatives:**
1. Manual review — not scalable
2. No scanning — unacceptable for security product

**Trade-offs:**
- Scanning adds latency (background job, user accepts delay)
- ClamAV requires infrastructure; API requires cost

**Phase 1 Approach:** Mock scanner (returns clean) for development
**Phase 4 Approach:** Real ClamAV or API integration

**Impact:** Phase 4 file security pipeline

---

## D012: Cryptography - Vetted Libraries Only

**Date:** 2026-10-16
**Status:** APPROVED (POLICY)

**Decision:** Never invent cryptographic primitives. Use vetted, maintained libraries only.

**Approach:**
- Passwords: bcryptjs (Argon2)
- Sessions: NextAuth.js handling
- Token generation: crypto.randomBytes (Node.js built-in)
- TLS: Node.js/AWS native
- Encryption: AWS KMS (server-side)

**Rationale:** Cryptography is hard; use tested libraries instead.

**Impact:** All phases with cryptographic requirements

---

## D013: Email Delivery - Transactional Service

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Use AWS SES or Sendgrid for transactional emails (verification, invitations, etc.).

**Rationale:**
- Managed service (deliverability handled)
- Good reputation management
- Excellent tracking
- Cost-effective

**Phase 1 Approach:** Sandbox mode (test only)
**Phase 2+:** Production mode with approval

**Impact:** Phase 3+ (email notifications)

---

## D014: Logging & Monitoring

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Structured JSON logging (pino) + AWS CloudWatch + optional Datadog.

**Rationale:**
- Structured logs are queryable
- CloudWatch integrated with AWS
- No sensitive data in logs (filter enforced)
- Audit logs separate stream
- Real-time alerting capability

**Impact:** All phases with operational requirements

---

## D015: Testing Strategy - Layered

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Implement unit + integration + E2E + security tests with clear responsibilities.

**Breakdown:**
- **Unit Tests:** Individual functions/services (Jest, Vitest)
- **Integration Tests:** API endpoints + database (Supertest)
- **E2E Tests:** Complete workflows (Playwright, Cypress)
- **Security Tests:** Authorization, threat model mitigations
- **Load Tests:** Performance under typical load

**Coverage Target:** 80%+ for critical paths

**Impact:** All phases with quality gates

---

## D016: Documentation Approach

**Date:** 2026-10-16
**Status:** APPROVED

**Decision:** Keep durable project documents (CLAUDE.md, ROADMAP.md, ARCHITECTURE.md, etc.) updated as source of truth. Code is documented via comments only when WHY is non-obvious.

**Approach:**
- CLAUDE.md — operating manual
- ARCHITECTURE.md — system design
- SECURITY.md — threat model and controls
- ROADMAP.md — phase plan
- PROGRESS.md — current status
- DECISIONS.md — technical choices (this file)
- Code comments — only non-obvious WHY

**Rationale:** Documentation evolves with project; code speaks for itself

**Impact:** All phases with communication requirements

---

## Decision Template

For future decisions, use this template:

```
## D###: [Decision Title]

**Date:** YYYY-MM-DD
**Status:** APPROVED | PENDING | REJECTED

**Decision:** [What decision was made]

**Rationale:** [Why this choice]

**Alternatives Considered:**
1. [Alt 1] — rejected because...
2. [Alt 2] — rejected because...

**Trade-offs:** [What are the costs of this decision]

**Impact:** [Which phases/components affected]
```

---

**Last Updated:** 2026-10-16
**Total Decisions:** 16
