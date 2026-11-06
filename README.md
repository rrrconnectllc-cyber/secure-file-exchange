# Secure File Exchange (SFX)

Enterprise-grade secure document exchange platform for organizations that need to share highly confidential or regulated files with other organizations.

## Quick Start

### Prerequisites
- Node.js 22+
- npm 11+
- Docker & Docker Compose (for PostgreSQL, Redis)
- Git

### Setup

1. **Clone & Install**
```bash
cd secure-file-exchange
npm install
```

2. **Start Services**
```bash
docker-compose up -d
```

3. **Configure Environment**
```bash
cp .env.example .env.local
# Edit .env.local with your values
```

4. **Run Migrations**
```bash
npm run db:migrate
```

5. **Start Development**
```bash
npm run dev
```

## Project Structure

```
secure-file-exchange/
  apps/
    web/              # Next.js frontend (port 3000)
    api/              # Express.js API (port 3001)
    worker/           # Background jobs
  packages/
    ui/               # Design system components
    database/         # Prisma schemas & migrations
    shared/           # Shared types and utilities
  infrastructure/
    docker/           # Docker configurations
    monitoring/       # Monitoring setup
    terraform/        # IaC (AWS)
  tests/              # Test suites
  docs/               # Project documentation
  .claude/            # Claude Code configuration
```

## Documentation

- **[CLAUDE.md](./CLAUDE.md)** — Operating manual for Claude Code
- **[PRODUCT.md](./PRODUCT.md)** — Product requirements and features
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Technical architecture and design
- **[SECURITY.md](./SECURITY.md)** — Threat model and security controls
- **[ROADMAP.md](./ROADMAP.md)** — 13-phase execution plan
- **[PROGRESS.md](./PROGRESS.md)** — Current project status
- **[DECISIONS.md](./DECISIONS.md)** — Technical decision log
- **[NEXT_ACTIONS.md](./NEXT_ACTIONS.md)** — Next steps and tasks

## Development

### Running Services

```bash
# All services (recommended)
npm run dev

# Individual services
cd apps/web && npm run dev        # Frontend on port 3000
cd apps/api && npm run dev        # API on port 3001
cd apps/worker && npm run dev     # Worker jobs
```

### Testing

```bash
# Run all tests
npm test

# Run tests for specific workspace
npm test --workspace=apps/api

# Run tests in watch mode
npm test -- --watch
```

### Linting & Formatting

```bash
# Lint all code
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check
```

### Database

```bash
# Run migrations
npm run db:migrate

# Seed database (if needed)
npm run db:seed

# Open Prisma Studio (database viewer)
npm run db:studio
```

## Docker Services

Services are defined in `docker-compose.yml`:

- **PostgreSQL** on port 5432 (database)
- **Redis** on port 6379 (cache, sessions, job queue)

To manage services:

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Reset database (WARNING: deletes data)
docker-compose down -v
```

## Status

| Phase | Name | Status | Target |
|-------|------|--------|--------|
| 0 | Research | ✅ COMPLETE | 2026-10-16 |
| 1 | Foundation | 🔄 IN PROGRESS | 2026-10-22 |
| 2 | Design | ⏳ Planned | 2026-10-29 |
| 3 | Identity | ⏳ Planned | 2026-11-05 |
| 4 | File Storage | ⏳ Planned | 2026-11-19 |
| 5 | Exchange Rooms | ⏳ Planned | 2026-11-26 |
| 6 | Admin Dashboard | ⏳ Planned | 2026-12-03 |
| 7 | Billing | ⏳ Planned | 2026-12-10 |
| 8 | Security Hardening | ⏳ Planned | 2026-12-24 |
| 9 | Staging Deployment | ⏳ Planned | 2026-12-31 |
| 10 | Review Package | ⏳ Planned | 2027-01-07 |
| 11 | Private Pilot | ⏳ Planned | 2027-01-21 |
| 12 | Launch Readiness | ⏳ Planned | 2027-02-04 |
| 13 | Post-Launch | ⏳ Ongoing | 2027-02-15+ |

For detailed progress, see [PROGRESS.md](./PROGRESS.md).

## Technology Stack

- **Frontend:** Next.js 14+, React 19, TypeScript, Tailwind CSS
- **Backend:** Express.js, Node.js, TypeScript
- **Database:** PostgreSQL 15+
- **Cache:** Redis
- **ORM:** Prisma
- **Infrastructure:** AWS (ECS, RDS, S3, KMS, ALB, etc.)
- **Identity:** NextAuth.js + Argon2 password hashing
- **Billing:** Stripe (test mode initially)
- **Testing:** Jest, Vitest, Supertest, Playwright

## Contributing

This project follows the guidelines in [CLAUDE.md](./CLAUDE.md).

Key principles:
- Security requirements are hard gates
- Build real working software, not prototypes
- Maintain durable project state
- Document decisions in [DECISIONS.md](./DECISIONS.md)

## Support

For questions or issues:
1. Check the [documentation](./docs/)
2. Review [ROADMAP.md](./ROADMAP.md) for planned work
3. See [PROGRESS.md](./PROGRESS.md) for current status
4. Check [DECISIONS.md](./DECISIONS.md) for design rationale

## License

Private. All rights reserved.

---

**Current Phase:** 1 (Foundation)  
**Last Updated:** 2026-10-16  
**Next Milestone:** Phase 1 completion (2026-10-22)
