# SFX Deployment & Auto-Start Guide

## Quick Start (Manual)

```bash
# Start all services
docker-compose up -d

# Run migrations
npm run db:migrate

# Install dependencies
npm install

# Start development servers
npm run dev
```

## Auto-Start Setup

### Option 1: Windows (Recommended for your setup)

**Setup One-Time:**

1. Open Task Scheduler (Win + R → `taskschd.msc`)
2. Create Basic Task:
   - Name: "SFX Auto-Start"
   - Trigger: "At startup"
   - Action: Start a program
   - Program: `C:\Windows\System32\cmd.exe`
   - Arguments: `/c "cd C:\Users\Admin\secure-file-exchange && scripts\auto-start.bat"`
   - Run with highest privileges: ✓

**Alternative: Direct shortcut**

```batch
@echo off
C:
cd C:\Users\Admin\secure-file-exchange
call scripts\auto-start.bat
```

Save as `SFX-Start.bat` in Startup folder:
```
C:\Users\Admin\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\
```

### Option 2: Linux/WSL

**Setup One-Time:**

```bash
# Make script executable
chmod +x /c/Users/Admin/secure-file-exchange/scripts/auto-start.sh

# Add to crontab (runs at system boot)
crontab -e

# Add this line:
@reboot /c/Users/Admin/secure-file-exchange/scripts/auto-start.sh >> /tmp/sfx-auto-start.log 2>&1
```

### Option 3: Docker Desktop Auto-Start

**Settings → Resources → File Sharing**
- Ensure project directory is shared
- Docker Desktop → Settings → General → "Start Docker Desktop when you log in"

---

## Service Health Checks

All services have health checks that automatically recover from failures:

```bash
# Check service status
docker-compose ps

# View service logs
docker-compose logs -f [service]

# Available services:
# - postgres: Database (port 5432)
# - redis: Cache (port 6379)
# - minio: Object storage (port 9000/9001)
# - clamav: Malware scanning (port 3310)
```

---

## Monitoring & Logging

### View Auto-Start Logs

```bash
# Windows
type logs\auto-start.log

# Linux/WSL
cat logs/auto-start.log

# Real-time
tail -f logs/auto-start.log
```

### Service-Specific Logs

```bash
# Docker services
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f minio
docker-compose logs -f clamav

# Development servers
# Check npm logs in console output
```

---

## Manual Recovery

If services stop unexpectedly:

```bash
# Check what's running
docker-compose ps

# Restart all services
docker-compose restart

# Full restart (clean slate)
docker-compose down
docker-compose up -d

# Verify health
docker-compose ps
```

---

## Development Workflow

### Day-to-Day

1. **System boots** → Auto-start script runs
2. **Services come up** → Docker containers with restart policies
3. **Database migrates** → Latest schema applied
4. **Dev servers start** → API (3001) & Web (3000) ready
5. **You return** → Everything already running

### Manual Start (if needed)

```bash
cd /c/Users/Admin/secure-file-exchange

# Full restart
docker-compose down
docker-compose up -d
npm run db:migrate
npm run dev
```

### Quick Commands

```bash
# Stop everything
docker-compose down

# See what's running
docker-compose ps

# Check logs
docker-compose logs

# View single service
docker-compose logs minio

# Scale a service
docker-compose up -d --scale [service]=2
```

---

## Continuity Guarantees

✅ **Services auto-restart on failure**
- Restart policy: `always`
- Docker monitors and revives dead containers

✅ **Health checks prevent degraded state**
- Postgres: Checks pg_isready every 10s
- Redis: Checks PING every 10s
- MinIO: Checks /health/live every 10s
- ClamAV: Checks health every 30s

✅ **Data persistence**
- Database: `/var/lib/postgresql/data`
- Cache: `/data` (Redis)
- Files: `/data` (MinIO)
- All stored in Docker volumes (survives container restart)

✅ **Auto-migration on start**
- Detects schema version
- Runs pending migrations
- Idempotent (safe to run multiple times)

---

## Troubleshooting

### Services not starting

```bash
# Check if Docker is running
docker ps

# Check Docker Desktop status
# Windows: System tray → Docker icon

# Try manual start
docker-compose up -d --no-deps postgres redis minio
```

### Database connection errors

```bash
# Check if postgres is healthy
docker-compose exec postgres pg_isready

# View postgres logs
docker-compose logs postgres

# Reset database (careful!)
docker-compose exec postgres dropdb sfx_dev -U sfx_user
docker-compose exec postgres createdb sfx_dev -U sfx_user
npm run db:migrate
```

### MinIO not accessible

```bash
# Check MinIO status
docker-compose logs minio

# Verify bucket exists
# Go to http://localhost:9001 (admin/admin)
# Create bucket "sfx-files" if missing
```

### ClamAV not scanning

```bash
# Check ClamAV health
docker-compose exec clamav clamdscan --ping

# View logs
docker-compose logs clamav

# Restart ClamAV
docker-compose restart clamav
```

---

## Environment Variables

All settings in `.env.local`:

```env
NODE_ENV=development
API_PORT=3001
DATABASE_HOST=postgres
DATABASE_PORT=5432
AWS_S3_ENDPOINT=http://minio:9000
CLAM_AV_HOST=clamav
CLAM_AV_PORT=3310
```

⚠️ **Never commit `.env.local` to git**

---

## Performance Notes

- First start: ~30-60 seconds (Docker pulls images)
- Subsequent starts: ~10-20 seconds (containers restart)
- Database migration: ~5-10 seconds
- Development servers: ~5-10 seconds ready

**Total boot time: ~1-2 minutes**

---

## Backup & Recovery

### Backup data

```bash
# Backup database
docker-compose exec postgres pg_dump sfx_dev > backup.sql

# Backup files
docker run --rm -v sfx-minio_data:/data -v $(pwd):/backup alpine tar czf /backup/minio-backup.tar.gz /data
```

### Restore from backup

```bash
# Restore database
cat backup.sql | docker-compose exec -T postgres psql sfx_dev

# Restore files
docker run --rm -v sfx-minio_data:/data -v $(pwd):/backup alpine tar xzf /backup/minio-backup.tar.gz -C /
```

---

## Next Steps

1. **Set up auto-start** (choose Windows/Linux option above)
2. **Verify setup** with `docker-compose ps`
3. **Check logs** with `docker-compose logs`
4. **Test manually** with `npm run dev`
5. **Restart system** to verify auto-start works

Then: **Continue with Phase 5** (Exchange Rooms)
