#!/bin/bash

# SFX Auto-Start Script
# Brings up all services and resumes development build

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/logs/auto-start.log"
PID_FILE="$PROJECT_DIR/.auto-start.pid"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Log function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if already running
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        log "ERROR: Auto-start already running (PID: $OLD_PID)"
        exit 1
    fi
fi

# Save PID
echo $$ > "$PID_FILE"

log "=========================================="
log "SFX Auto-Start Sequence Initiated"
log "=========================================="

# Step 1: Start Docker services
log "Step 1/5: Starting Docker services..."
cd "$PROJECT_DIR"
docker-compose up -d

# Wait for services to be healthy
log "Step 2/5: Waiting for services to be healthy..."
max_retries=30
retry_count=0

while [ $retry_count -lt $max_retries ]; do
    if docker-compose exec -T postgres pg_isready -U sfx_user > /dev/null 2>&1 && \
       docker-compose exec -T redis redis-cli ping > /dev/null 2>&1 && \
       docker-compose exec -T minio curl -f http://localhost:9000/minio/health/live > /dev/null 2>&1; then
        log "✓ All services are healthy"
        break
    fi

    retry_count=$((retry_count + 1))
    log "Waiting for services... ($retry_count/$max_retries)"
    sleep 2
done

if [ $retry_count -eq $max_retries ]; then
    log "ERROR: Services failed to become healthy"
    exit 1
fi

# Step 3: Run database migrations
log "Step 3/5: Running database migrations..."
npm run db:migrate || log "WARNING: Migration failed or already applied"

# Step 4: Install dependencies
log "Step 4/5: Installing dependencies..."
npm install --legacy-peer-deps

# Step 5: Start development servers
log "Step 5/5: Starting development servers..."
npm run dev &
DEV_PID=$!

log "=========================================="
log "✓ SFX Auto-Start Complete"
log "=========================================="
log "Services running:"
log "  - API: http://localhost:3001"
log "  - Web: http://localhost:3000"
log "  - MinIO Console: http://localhost:9001"
log "  - Database: localhost:5432"
log "  - Redis: localhost:6379"
log "=========================================="

# Monitor process
wait $DEV_PID
log "Development server stopped"

# Cleanup
rm -f "$PID_FILE"
