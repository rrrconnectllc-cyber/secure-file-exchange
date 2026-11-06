# Secure File Exchange (SFX) — Security Architecture & Threat Model

## Security Principles

1. **Defense in Depth** — Multiple overlapping controls
2. **Secure by Default** — Deny access unless explicitly granted
3. **Least Privilege** — Minimal required permissions
4. **Fail Secure** — On error, deny access
5. **No Security Secrets** — Design is auditable; only implementation secrets are protected
6. **Cryptographic Correctness** — Use vetted libraries, never invent crypto
7. **Audit Everything** — Security events logged and protected
8. **Tenant Isolation** — Cross-tenant access is release-blocking defect

---

## Threat Model (STRIDE)

### Asset 1: Customer Files at Rest

**Threat:** Unauthorized access to stored customer files

**Scenario:** Attacker gains AWS account access, reads S3 bucket

**Risk:** Confidential customer documents disclosed

**Severity:** CRITICAL

**Mitigations:**
- S3 bucket private (no public ACLs)
- SSE-KMS encryption (customers see encrypted blobs even if they access S3)
- KMS key policy restricts key use to application IAM role
- Application accesses files only through decryption
- Principle: Even if S3 bucket is publicly accessible, files are encrypted

**Detection:**
- CloudTrail logging of all S3 access
- KMS key usage metrics
- Integrity checks on restore

**Testing:**
- [ ] Attempt unauth S3 download (should be denied)
- [ ] Verify files encrypted at rest
- [ ] Verify KMS key policy prevents external use

---

### Asset 2: Database (Sensitive Data)

**Threat:** Unauthorized database access

**Scenario:** Attacker gains access to RDS PostgreSQL instance

**Risk:** User credentials, customer metadata, audit logs, file metadata disclosed

**Severity:** CRITICAL

**Mitigations:**
- Database in private VPC subnet (not internet-accessible)
- RDS encryption enabled
- Strong master password (AWS Secrets Manager)
- Database authentication via IAM (RDS IAM DB Authentication)
- Network security group restricts to application servers only
- No public endpoint

**Detection:**
- RDS enhanced monitoring
- CloudTrail logs all RDS modifications
- Failed authentication attempts logged

**Testing:**
- [ ] Attempt direct connection from internet (should fail)
- [ ] Verify RDS is in private subnet
- [ ] Verify encryption enabled

---

### Asset 3: User Authentication & Sessions

**Threat:** Account Takeover (ATO)

**Scenarios:**
1. Credential stuffing attack
2. Session hijacking
3. Session fixation
4. MFA bypass

**Risk:** Attacker gains access to another user's account

**Severity:** CRITICAL

**Mitigations:**

**Passwords:**
- Argon2 hashing (bcryptjs) — resistant to GPU cracking
- Minimum 12 characters (enforced)
- No common passwords (checked against haveibeenpwned.com API on registration)
- Password reset tokens expire after 1 hour
- Reset links are single-use

**Sessions:**
- Server-side session store (Redis)
- HttpOnly, Secure, SameSite cookies
- Session ID is cryptographically random (256 bits)
- Session timeout: 24 hours, or 30 minutes idle
- Logout clears session immediately

**MFA:**
- TOTP (Time-based One-Time Password) — NIST-compatible
- Backup codes generated on setup (printed/downloaded)
- MFA required for sensitive operations (admin, file access)
- TOTP codes valid for 30-second window only

**Rate Limiting:**
- Login attempts: max 5 failures in 15 minutes → 30-minute lockout
- Password reset: max 3 attempts per email per hour
- API endpoints: global rate limit, per-user limits

**Additional:**
- Login notifications (email on new device)
- Session history visible to user
- Device/browser fingerprinting (optional, P1)
- Device revocation

**Detection:**
- Audit log of all login attempts (success + failure)
- Suspicious pattern detection (impossible travel, new devices)
- Failed MFA attempts logged

**Testing:**
- [ ] Credential stuffing test (rate limit enforced)
- [ ] Session hijacking test (stolen cookie rejected)
- [ ] MFA bypass test (TOTP required for sensitive ops)
- [ ] Password reset security (token expiration)

---

### Asset 4: Cross-Tenant Data Isolation

**Threat:** Broken Object-Level Authorization (BOLA) / Broken Function-Level Authorization (BFLA)

**Scenario:** User from Org A requests data from Org B

**Risk:** Confidential documents disclosed to unauthorized organization

**Severity:** CRITICAL (Release-blocking)

**Mitigations:**
- Every table has organization_id column
- Every query filters by organization_id
- Application extracts organization_id from authenticated session, never from request
- Authorization check before data return: `if (resource.organization_id !== user.organization_id) return 403`
- Database level: row-level security constraints
- API returns 404 for unauthorized resources (not 403, to prevent enumeration)

**Detection:**
- Audit log of all data access
- Alerting on authorization failures
- Canary data detection (test records in other orgs)

**Testing:**
- [ ] Create two test organizations
- [ ] Attempt cross-tenant file download (denied)
- [ ] Attempt cross-tenant room access (denied)
- [ ] Attempt cross-tenant audit log query (denied)
- [ ] Attempt object ID enumeration from URL (denied)
- [ ] Run adversarial test suite regularly

---

### Asset 5: File Upload/Malware

**Threat:** Malware Distribution / File-Based Attacks

**Scenarios:**
1. Attacker uploads malicious .exe, distributes to targets
2. Attacker uploads malicious .zip (zip bomb)
3. Attacker uploads polyglot files (e.g., PDF + executable)
4. Attacker exploits file parser vulnerability

**Risk:** End recipients infected with malware; reputation damage; liability

**Severity:** CRITICAL

**Mitigations:**

**Upload Validation:**
- File type allowlist (whitelist only: PDF, DOCX, XLSX, PPTX, TXT, ZIP, images, etc.)
- Extension validation (file.pdf must be PDF)
- MIME type validation (must match Content-Type header)
- Magic byte validation (first bytes of file match expected format)
- Reject executables, scripts, archives containing executables

**Size Limits:**
- Maximum file size: 5GB (configurable per plan)
- Maximum expanded archive size: 50GB (prevent disk exhaustion)
- Reject archives that would expand beyond limit

**Malware Scanning:**
- Integration with ClamAV or commercial scanner (e.g., VirusTotal API)
- All uploads scanned before marked AVAILABLE
- Infected files quarantined (not deleted, for forensics)
- Failure to scan → file remains in SCANNING state, not accessible
- Scanner outage → file stays unavailable (fail secure)

**Processing Isolation:**
- Scanner runs in separate container/process
- Scanner has no access to other files
- Scanner output validated before use
- No file execution (always served as Content-Disposition: attachment)

**Dangerous Features Disabled:**
- No file preview until processing isolation verified
- No macros execution (Office documents opened read-only)
- No embedded content auto-fetch

**Detection:**
- Audit log of scan results
- Alerting on infections
- Metrics on scan failures

**Testing:**
- [ ] Upload .exe (rejected)
- [ ] Upload malicious PDF (scanned, marked infected)
- [ ] Upload zip bomb (rejected)
- [ ] Upload allowed filetype (scanning executed)
- [ ] Verify scanner failure doesn't grant access
- [ ] Verify infected files not accessible

---

### Asset 6: Sharing Links / Access Tokens

**Threat:** Token Leakage / Link Sharing

**Scenarios:**
1. Sharing link forwarded to unauthorized user
2. Link exposed in email headers, browser history, Slack
3. Link exposed in web server logs
4. Token reuse after revocation

**Risk:** Unintended access, compliance violation

**Severity:** HIGH (by design, this is accepted risk with mitigations)

**Mitigations:**

**Token Generation:**
- 256-bit cryptographically random tokens
- Hashed in database (one-way) — even DB breach doesn't leak tokens
- Unique per file/recipient combination

**Token Delivery:**
- Tokens delivered via email only
- Never in URL parameters (use POST body instead)
- Short-lived tokens (1-hour validity for invite, or per-policy)
- Single-use tokens for sensitive operations (optional, P1)

**Token Security:**
- HTTPS only (TLS enforced)
- Referrer-Policy: no-referrer (prevent referrer leakage)
- No caching (Cache-Control: no-store, no-cache)
- No logging of full tokens (truncate to last 4 chars in logs)
- Secure HttpOnly, SameSite cookies for session auth

**Revocation:**
- Immediate revocation via API
- Token invalidated immediately in database
- No grace period
- User notified of revocation

**Download Restrictions:**
- Download limit per link (e.g., 1 download only)
- Expiration time (e.g., 24 hours)
- IP address restrictions optional (P1)
- Recipient email restrictions (token issued for specific email)

**UX/Education:**
- UI warns recipients that downloads cannot be recalled
- Sender educated on link sharing risks
- Audit log shows all access (email + timestamp)
- Watermarking option (P2)

**Detection:**
- Audit log of token generation, use, revocation
- Monitoring for suspicious patterns (1000 downloads in 1 minute)

**Testing:**
- [ ] Revoked token rejected immediately
- [ ] Expired token rejected
- [ ] Invalid token rejected
- [ ] Correct token allows access
- [ ] Link forwarding detected and logged
- [ ] Download limit enforced
- [ ] IP/email restrictions enforced (P1)

---

### Asset 7: Operator Access / Break-Glass

**Threat:** Insider Abuse / Rogue Administrator

**Scenario:** SFX employee accesses customer files for espionage or curiosity

**Risk:** Privacy breach, customer data theft

**Severity:** CRITICAL

**Mitigations:**
- Platform operators do NOT have routine access to customer file contents
- All operator actions require explicit, auditable authorization
- Break-glass procedures require:
  - Specific operational need (support ticket, incident response)
  - Multiple approvers (CEO + CTO minimum)
  - Explicit customer notification
  - Comprehensive audit trail
  - Time-limited access (1 hour maximum)
  - Logged in write-only audit stream

**Detection:**
- Separate audit stream for operator access
- Real-time alerting on all break-glass access
- Quarterly review of break-glass events
- Customer notification on access

**Testing:**
- [ ] Operator cannot access customer files normally
- [ ] Break-glass access logged separately
- [ ] Break-glass access alert triggers

---

### Asset 8: Billing / Payment

**Threat:** Billing Fraud / Unauthorized Charges

**Scenarios:**
1. Attacker uses stolen credit card to create account
2. Attacker upgrades plan without authorization
3. Subscription hijacking (downgrade not enforced)
4. Duplicate charges

**Risk:** Chargebacks, fraud, revenue leakage

**Severity:** MEDIUM

**Mitigations:**
- Stripe integration with webhook verification
- All payment state changes require Stripe signature verification
- Idempotent processing (handle duplicate webhooks)
- CVV required for all payments
- 3D Secure optional for high-risk regions
- Free trial has credit card requirement (not charged)
- Subscription cancellation honored immediately
- Downgrade immediately revokes higher-tier features

**Detection:**
- Webhook failure alerting
- Stripe fraud detection enabled
- Chargeback monitoring
- Subscription state audit trail

**Testing:**
- [ ] Invalid webhook rejected
- [ ] Duplicate webhook handled idempotently
- [ ] Cancellation honored immediately
- [ ] Feature access revoked on downgrade
- [ ] Failed payment alert sent

---

### Asset 9: Secrets & Credentials

**Threat:** Secret Leakage

**Scenarios:**
1. API keys committed to git
2. Database passwords in environment variables
3. Encryption keys logged
4. Secrets in error messages

**Risk:** Complete system compromise

**Severity:** CRITICAL

**Mitigations:**
- No secrets in code repository
- Secrets management via AWS Secrets Manager
- Environment variables for secret references only (not values)
- Automatic secret scanning in CI (TruffleHog, etc.)
- Secrets never logged (filter from logs)
- Error messages never leak sensitive data
- Rotation procedures for all secrets
- API keys have expiration dates

**Detection:**
- Secret scanning on every commit
- Automated secrets rotation alerts
- Key usage metrics and anomalies

**Testing:**
- [ ] Scan repository for secrets (should find none)
- [ ] Verify error messages don't leak credentials
- [ ] Verify logs don't contain API keys

---

### Asset 10: Supply Chain / Dependencies

**Threat:** Dependency Vulnerabilities / Typosquatting

**Scenarios:**
1. Vulnerable npm package used (e.g., known RCE)
2. Typosquatted package installed (e.g., "bcypt" vs "bcryptjs")
3. Compromised maintainer publishes malicious version

**Risk:** RCE, data theft, service compromise

**Severity:** HIGH

**Mitigations:**
- Automated dependency scanning (npm audit, Dependabot)
- CI blocks on critical/high-severity vulnerabilities
- Pin major versions (minor/patch updates only)
- Verify package authenticity (checksum verification)
- Manual review of new dependencies
- Minimize external dependencies
- Production deploy requires passing security scan

**Detection:**
- Automated vulnerability alerts
- CI pipeline blocks on new vulns

**Testing:**
- [ ] Run npm audit (no critical issues)
- [ ] Run SAST on dependencies
- [ ] Verify only expected packages installed

---

## Security Testing Checklist

### Authorization Tests
- [ ] Cross-tenant access denied
- [ ] Unauthorized user cannot access others' files
- [ ] Guest cannot access non-invited rooms
- [ ] Revoked access immediately denied
- [ ] Expired links rejected
- [ ] Insufficient permissions → 403
- [ ] Role escalation prevented

### Authentication Tests
- [ ] Invalid credentials rejected
- [ ] Session hijacking prevented
- [ ] MFA required and enforced
- [ ] MFA bypass prevented
- [ ] Password reset secure
- [ ] Login rate limiting enforced
- [ ] Logout clears session

### File Security Tests
- [ ] Executable files rejected
- [ ] Malware-infected files quarantined
- [ ] Oversized files rejected
- [ ] Zip bombs rejected
- [ ] Invalid MIME type rejected
- [ ] Scanner failure prevents access
- [ ] Files not accessible until scanning complete

### Input Validation Tests
- [ ] SQL injection prevented (parameterized queries)
- [ ] XSS prevented (output encoding)
- [ ] CSRF prevented (token validation)
- [ ] Path traversal prevented
- [ ] Command injection prevented
- [ ] XXE prevented (XML parsing)

### Infrastructure Tests
- [ ] TLS 1.3+ enforced
- [ ] No plaintext communication
- [ ] Database not internet-accessible
- [ ] Secrets not in environment
- [ ] Backups encrypted
- [ ] No hardcoded credentials

### Compliance Tests
- [ ] Audit logging enabled and protected
- [ ] Sensitive data not logged
- [ ] Data retention policies enforced
- [ ] Data deletion secure
- [ ] Privacy policy accurate
- [ ] GDPR subject requests honored
- [ ] HIPAA BAA scope defined (P1)

---

## Compliance Mapping

### OWASP ASVS 5.0

| Control | Status | Evidence |
|---------|--------|----------|
| V1.1 Secure SDLC | IMPLEMENTED | CLAUDE.md, process docs |
| V2.1 Password Policy | IMPLEMENTED | Argon2, 12+ char |
| V2.3 MFA | IMPLEMENTED | TOTP, backup codes |
| V4.1 Access Control | IMPLEMENTED | RBAC, AuthZ checks |
| V5.1 Input Validation | IMPLEMENTED | TS, Zod schemas |
| V5.3 Output Encoding | IMPLEMENTED | React auto-escaping |
| V6.2 Cryptography | IMPLEMENTED | TLS 1.3, KMS |
| V8.2 Data Protection | IMPLEMENTED | Encryption, retention |
| V9.1 CSRF | IMPLEMENTED | Token validation |
| V10.4 Secrets | IMPLEMENTED | Secrets Manager |
| V12.1 File Security | IMPLEMENTED | Type allowlist, scanning |
| V13.1 Input Validation | IMPLEMENTED | API input validation |
| V14.1 Config Security | IMPLEMENTED | Secrets, no defaults |

### NIST Cybersecurity Framework 2.0

| Function | Mapped Controls |
|----------|-----------------|
| GOVERN | Security governance (CLAUDE.md), risk management (threat model), supply chain (dependency scanning) |
| PROTECT | Access controls (AuthZ), data security (encryption), asset management (inventory) |
| DETECT | Monitoring (CloudWatch), audit logging, threat detection (rate limiting) |
| RESPOND | Incident response procedures (P1), break-glass access, notifications |
| RECOVER | Backups, disaster recovery, RTO/RPO targets |

---

## Post-Launch Security Review

Before public launch, engage:

1. **Independent Security Audit** — Penetration testing, code review, architecture review
2. **Compliance Review** — Legal review of privacy/terms, GDPR/HIPAA scoping
3. **Infrastructure Review** — Cloud security configuration, IAM, network
4. **Operational Security Review** — Incident response, secret management, access controls

**Timeline:** 4-6 weeks minimum

---

**Status:** Phase 0/1 — Implementation & Validation
**Last Updated:** 2026-10-16
