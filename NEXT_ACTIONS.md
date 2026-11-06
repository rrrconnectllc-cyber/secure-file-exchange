# SFX Next Actions

**Last Updated:** 2026-10-16
**Current Phase:** 0 → 1 (transitioning to Foundation)

---

## Immediate Next Steps (This Session)

### 1. Initialize Monorepo Structure

**Task:** Create the project directory structure defined in ARCHITECTURE.md

**Steps:**
```bash
# Create main app directories
mkdir -p apps/web apps/api apps/worker

# Create package directories
mkdir -p packages/ui packages/shared packages/database

# Create infrastructure directories
mkdir -p infrastructure/docker infrastructure/monitoring infrastructure/terraform

# Create test directories
mkdir -p tests/unit tests/integration tests/e2e tests/security

# Create documentation directories
mkdir -p docs/architecture docs/security docs/operations docs/customer docs/api

# Create .claude directory
mkdir -p .claude/agents .claude/skills
```

**Definition of Done:**
- [ ] Directory structure created
- [ ] Verified with `find . -type d | head -20`

---

### 2. Initialize Node.js Project (Root + Workspaces)

**Task:** Set up monorepo with npm workspaces

**Steps:**
1. Create root `package.json` with workspaces
2. Create `package.json` for each app (web, api, worker)
3. Create `package.json` for each package (ui, shared, database)
4. Install dependencies

**Root package.json template:**
```json
{
  "name": "secure-file-exchange",
  "version": "0.0.1",
  "description": "Enterprise-grade secure file exchange platform",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "npm run dev --workspaces",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces"
  },
  "engines": {
    "node": ">=22.0.0",
    "npm": ">=11.0.0"
  }
}
```

**Definition of Done:**
- [ ] Root package.json created with workspaces
- [ ] All workspace package.json files created
- [ ] `npm install` succeeds without errors
- [ ] Verified with `npm list --all`

---

### 3. Initialize Git & Create Initial Commit

**Task:** Set up git and commit foundational documents

**Steps:**
```bash
# Already initialized, add files
git add CLAUDE.md PRODUCT.md ARCHITECTURE.md SECURITY.md ROADMAP.md PROGRESS.md DECISIONS.md NEXT_ACTIONS.md .gitignore README.md

# Create initial commit
git commit -m "Phase 0: Research complete. Initialize SFX project with foundational documents.

- CLAUDE.md: Operating manual for Claude Code sessions
- PRODUCT.md: Requirements, features, acceptance criteria
- ARCHITECTURE.md: Technical stack and data model
- SECURITY.md: Threat model and security requirements
- ROADMAP.md: 13-phase execution plan
- PROGRESS.md: Status tracking
- DECISIONS.md: Technical decision log

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Definition of Done:**
- [ ] Initial commit created
- [ ] `git log` shows clean history

---

### 4. Create .gitignore

**Task:** Set up git ignore rules for Node, OS, and secrets

**File:** `.gitignore`

```
# Dependencies
node_modules/
.pnp
.pnp.js
package-lock.json
yarn.lock

# Environment
.env
.env.local
.env.*.local
.env.prod

# Build outputs
dist/
build/
.next/
.turbo/
out/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Test coverage
coverage/
.nyc_output/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Database
*.db
*.sqlite
*.sqlite3

# Temporary
tmp/
temp/
*.tmp
.cache/

# OS
Thumbs.db
.DS_Store
```

**Definition of Done:**
- [ ] .gitignore created
- [ ] No node_modules tracked: `git status | grep node_modules` returns empty

---

### 5. Create README.md

**Task:** Create project overview and setup instructions

**File:** `README.md`

```markdown
# Secure File Exchange (SFX)

Enterprise-grade secure document exchange platform for organizations that need to share highly confidential or regulated files with other organizations.

## Quick Start

### Prerequisites
- Node.js 22+
- npm 11+
- Docker & Docker Compose (for PostgreSQL, Redis)

### Setup
\`\`\`bash
# Install dependencies
npm install

# Start local database and cache
docker-compose up -d

# Set up environment
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
\`\`\`

## Project Structure

```
secure-file-exchange/
  apps/web/         # Next.js frontend
  apps/api/         # Express.js backend
  apps/worker/      # Background jobs
  packages/
    ui/             # Design system components
    database/       # Prisma schemas & migrations
    shared/         # Shared types and utilities
  infrastructure/   # Terraform, Docker, monitoring
  tests/            # Test suites
  docs/             # Documentation
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) — Operating manual
- [PRODUCT.md](./PRODUCT.md) — Features and requirements
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical design
- [SECURITY.md](./SECURITY.md) — Threat model
- [ROADMAP.md](./ROADMAP.md) — Phase plan
- [PROGRESS.md](./PROGRESS.md) — Current status

## Development

```bash
# Run all tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# View specific workspace
cd apps/web
npm run dev
```

## Status

**Phase:** 0/1 (Research complete, Foundation in progress)
**Target MVP:** 2026-11-30
**Public Launch:** 2027-02-15

See [PROGRESS.md](./PROGRESS.md) for detailed status.

## License

Private. All rights reserved.

---

For detailed information, see the documentation files in the project root.
```

**Definition of Done:**
- [ ] README.md created
- [ ] Formatted correctly for git repository display

---

### 6. Create .env.example

**Task:** Define environment variables template

**File:** `.env.example`

```bash
# ====== GENERAL ======
NODE_ENV=development
APP_NAME=Secure File Exchange
APP_URL=http://localhost:3000

# ====== POSTGRES DATABASE ======
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=sfx_dev
DATABASE_USER=sfx_user
DATABASE_PASSWORD=dev_password_change_me
DATABASE_URL=postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}

# ====== REDIS CACHE & SESSIONS ======
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://${REDIS_HOST}:${REDIS_PORT}

# ====== API SERVER ======
API_PORT=3001
API_HOST=0.0.0.0

# ====== NEXT.JS ======
NEXT_PUBLIC_API_URL=http://localhost:3001

# ====== SESSION ======
SESSION_SECRET=dev_session_secret_change_in_production

# ====== ENCRYPTION ======
# For local development, we'll use a local key.
# For production, use AWS KMS.
ENCRYPTION_KEY_ID=local-dev-key

# ====== AWS ======
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=sfx-dev-files

# ====== STRIPE ======
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...

# ====== EMAIL (AWS SES) ======
EMAIL_FROM=noreply@example.com
AWS_SES_REGION=us-east-1

# ====== MALWARE SCANNING (ClamAV) ======
CLAM_AV_HOST=clamav
CLAM_AV_PORT=3310

# ====== LOGGING ======
LOG_LEVEL=debug
```

**Definition of Done:**
- [ ] .env.example created
- [ ] All services have example values

---

### 7. Create docker-compose.yml

**Task:** Define local development database and cache services

**File:** `docker-compose.yml`

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: sfx_dev
      POSTGRES_USER: sfx_user
      POSTGRES_PASSWORD: dev_password_change_me
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sfx_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  clamav:
    image: clamav/clamav:latest
    ports:
      - "3310:3310"
    volumes:
      - clamav_data:/var/lib/clamav
    healthcheck:
      test: ["CMD", "clamscan", "--version"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  clamav_data:
```

**Definition of Done:**
- [ ] docker-compose.yml created
- [ ] `docker-compose up` succeeds
- [ ] All services healthy: `docker-compose ps`

---

### 8. Initialize Prisma Schema

**Task:** Create base Prisma schema for Phase 1

**File:** `packages/database/prisma/schema.prisma`

**Note:** This is foundational only. Will be expanded in Phase 3 onward.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  passwordHash  String
  emailVerified Boolean    @default(false)
  mfaEnabled    Boolean    @default(false)
  mfaSecret     String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  organizations OrganizationMembership[]
  files         File[]
  auditEvents   AuditEvent[]

  @@map("users")
}

model Organization {
  id            String     @id @default(cuid())
  name          String
  slug          String     @unique
  ownerId       String
  storageQuota  BigInt     @default(107374182400) // 100GB default
  userLimit     Int        @default(10)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  memberships   OrganizationMembership[]
  files         File[]
  rooms         ExchangeRoom[]
  subscriptions Subscription[]
  auditEvents   AuditEvent[]

  @@map("organizations")
}

model OrganizationMembership {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  role           String   @default("member") // owner, admin, member
  joinedAt       DateTime @default(now())

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([organizationId, userId])
  @@map("organization_memberships")
}

model File {
  id               String   @id @default(cuid())
  organizationId   String   // Tenant isolation
  roomId           String?
  storageKey       String
  filename         String
  mimeType         String
  sizeBytes        BigInt
  status           String   @default("initiated") // initiated, uploading, uploaded, scanning, available, rejected, expired, revoked, deleted
  virusScanStatus  String   @default("pending") // pending, clean, infected, error
  expiresAt        DateTime?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  createdById      String

  organization     Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  createdBy        User            @relation(fields: [createdById], references: [id])
  room             ExchangeRoom?   @relation(fields: [roomId], references: [id], onDelete: SetNull)
  accessTokens     FileAccessToken[]

  @@index([organizationId])
  @@index([roomId])
  @@map("files")
}

model ExchangeRoom {
  id             String   @id @default(cuid())
  organizationId String   // Tenant isolation
  name           String
  description    String?
  createdById    String
  expiresAt      DateTime?
  isArchived     Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization   Organization     @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  files          File[]
  members        RoomMember[]

  @@index([organizationId])
  @@map("exchange_rooms")
}

model RoomMember {
  id               String   @id @default(cuid())
  roomId           String
  userId           String?
  email            String?
  role             String   @default("viewer") // owner, member, viewer
  accessExpiresAt  DateTime?
  canDownload      Boolean  @default(true)
  downloadLimit    Int?
  createdAt        DateTime @default(now())

  room             ExchangeRoom @relation(fields: [roomId], references: [id], onDelete: Cascade)

  @@index([roomId])
  @@map("room_members")
}

model FileAccessToken {
  id                String   @id @default(cuid())
  fileId            String
  roomId            String?
  createdForEmail   String
  token             String   @unique
  expiresAt         DateTime
  isSingleUse       Boolean  @default(false)
  downloadCount     Int      @default(0)
  downloadLimit     Int?
  createdAt         DateTime @default(now())

  file              File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@index([fileId])
  @@map("file_access_tokens")
}

model Subscription {
  id                 String   @id @default(cuid())
  organizationId     String   @unique
  stripeCustomerId   String?
  stripeSubscriptionId String?
  plan               String   @default("starter") // starter, business, enterprise
  status             String   @default("trialing") // trialing, active, past_due, canceled
  currentPeriodStart DateTime?
  currentPeriodEnd   DateTime?
  trialEnd           DateTime?
  canceledAt         DateTime?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  organization       Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@map("subscriptions")
}

model AuditEvent {
  id             String   @id @default(cuid())
  organizationId String   // Tenant isolation
  eventType      String   // user.registered, user.login, file.uploaded, etc.
  actorId        String?
  actorEmail     String?
  resourceType   String   // user, file, room, org, etc.
  resourceId     String
  details        Json?    // No sensitive data
  ipAddress      String?  // Masked
  userAgent      String?  // Masked
  timestamp      DateTime @default(now()) @db.Timestamptz()

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@index([organizationId])
  @@index([timestamp])
  @@map("audit_events")
}
```

**Definition of Done:**
- [ ] Schema created and committed
- [ ] Database migration files can be generated

---

### 9. Set Up GitHub Actions (Placeholder)

**Task:** Create CI/CD pipeline structure

**File:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - run: npm install
      
      - run: npm run lint
      
      - run: npm run test
      
      - run: npm run build
```

**Definition of Done:**
- [ ] .github/workflows/ci.yml created
- [ ] Workflow file is valid YAML

---

### 10. Verify Complete Phase 1 Setup

**Acceptance Tests:**

```bash
# 1. Verify structure
ls -la apps/web apps/api packages/ui packages/database

# 2. Verify npm
npm list | head -20

# 3. Verify docker
docker-compose ps

# 4. Verify git
git status
git log --oneline

# 5. Verify env
cat .env.example | head -10
```

**Definition of Done:**
- [ ] All directories created
- [ ] npm workspaces initialized
- [ ] Docker services running
- [ ] git repository clean
- [ ] Environment template created

---

## Session Checklist

- [ ] Phase 0 documents committed
- [ ] Monorepo structure created
- [ ] npm workspaces initialized
- [ ] Docker Compose running
- [ ] Git repository clean
- [ ] README and setup guides complete
- [ ] PROGRESS.md updated
- [ ] NEXT_ACTIONS.md prepared for Phase 2

---

## Next Session Actions

Once this session completes, the next session should:

1. **Verify Foundation**
   - Clone fresh checkout
   - Run `npm install && docker-compose up`
   - Verify all services healthy

2. **Begin Phase 2: Design System**
   - Create Tailwind CSS configuration
   - Build component library
   - Design marketing website
   - Implement authentication screens

**Target:** Phase 2 complete by 2026-10-22

---

**Prepared By:** Founding CTO (Claude Haiku 4.5)
**Date:** 2026-10-16
**Status:** Ready for execution
