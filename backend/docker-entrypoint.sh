#!/bin/sh
set -e

echo "======================================"
echo "  NutriScan Database Init"
echo "======================================"

# PgBouncer URL (used by the app)
PGBOUNCER_URL="${DATABASE_URL}"

# Direct Postgres URL (bypasses PgBouncer for admin tasks)
DIRECT_URL="${DATABASE_DIRECT_URL:-$DATABASE_URL}"

# URL-Decode Funktion (für encoded Passwörter)
url_decode() {
    printf '%b' "$(echo "$1" | sed 's/%/\\x/g')"
}

# Extract connection parts from DIRECT_URL using proper parsing
# Remove postgresql:// prefix
STRIPPED=$(echo "$DIRECT_URL" | sed 's|^postgresql://||' | sed 's|^postgres://||')

# Extract user:password@host:port/database
# Split at @ to separate credentials from host
CREDENTIALS=$(echo "$STRIPPED" | cut -d'@' -f1)
HOST_DB=$(echo "$STRIPPED" | cut -d'@' -f2)

# Split credentials into user and password
DB_USER=$(echo "$CREDENTIALS" | cut -d':' -f1)
DB_PASS_ENCODED=$(echo "$CREDENTIALS" | cut -d':' -f2-)
DB_PASS=$(url_decode "$DB_PASS_ENCODED")

# Split host:port/database
HOST_PORT=$(echo "$HOST_DB" | cut -d'/' -f1)
DB_NAME=$(echo "$HOST_DB" | cut -d'/' -f2 | cut -d'?' -f1)

# Split host and port
DB_HOST=$(echo "$HOST_PORT" | cut -d':' -f1)
DB_PORT=$(echo "$HOST_PORT" | cut -d':' -f2)

echo ""
echo "Connection Details:"
echo "  Host:     $DB_HOST"
echo "  Port:     $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo ""

# DNS Resolution Test
echo "🔍 Testing DNS resolution..."
if nslookup "$DB_HOST" >/dev/null 2>&1; then
    echo "✅ DNS resolution successful for $DB_HOST"
    nslookup "$DB_HOST" | grep -A2 "Name:"
elif getent hosts "$DB_HOST" >/dev/null 2>&1; then
    echo "✅ DNS resolution successful (via getent)"
    getent hosts "$DB_HOST"
else
    echo "❌ DNS resolution FAILED for $DB_HOST"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if service exists: kubectl get svc -n everest | grep postgres"
    echo "  2. Service name might be different"
    echo "  3. Try short name: jf-nutriscan-postgresql (without namespace)"
    echo ""
fi
echo ""

# Network connectivity test
echo "🔍 Testing network connectivity..."
if nc -zv "$DB_HOST" "$DB_PORT" 2>&1; then
    echo "✅ Port $DB_PORT is reachable on $DB_HOST"
else
    echo "⚠️  Port check failed (nc might not be available or port unreachable)"
fi
echo ""

# Wait for PostgreSQL to be ready (max 60 seconds)
echo "⏳ Waiting for PostgreSQL to be ready..."
TIMEOUT=60
ELAPSED=0
CONNECTION_ATTEMPTS=0

until PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c '\q' 2>&1; do
  CONNECTION_ATTEMPTS=$((CONNECTION_ATTEMPTS + 1))

  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo ""
    echo "❌ ERROR: PostgreSQL did not become ready within ${TIMEOUT}s"
    echo ""
    echo "Debugging Information:"
    echo "  Connection attempts: $CONNECTION_ATTEMPTS"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo ""
    echo "Possible Issues:"
    echo "  1. PostgreSQL pod is not running"
    echo "  2. Wrong service name (check: kubectl get svc -n everest)"
    echo "  3. Network policy blocking connection"
    echo "  4. Wrong credentials"
    echo "  5. PostgreSQL not accepting connections yet"
    echo ""
    echo "Manual Test Commands:"
    echo "  # Check PostgreSQL pods:"
    echo "  kubectl get pods -n everest | grep postgres"
    echo ""
    echo "  # Check services:"
    echo "  kubectl get svc -n everest | grep postgres"
    echo ""
    echo "  # Test connection from debug pod:"
    echo "  kubectl run -it --rm debug --image=postgres:16-alpine -n everest -- sh"
    echo "  # Then: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres"
    echo ""
    exit 1
  fi

  # Show progress every 10 seconds
  if [ $((ELAPSED % 10)) -eq 0 ] && [ $ELAPSED -gt 0 ]; then
    echo "   Still waiting... ($ELAPSED/$TIMEOUT seconds, $CONNECTION_ATTEMPTS attempts)"
  else
    echo "   PostgreSQL not ready yet — retrying in 2s... ($ELAPSED/$TIMEOUT)"
  fi

  sleep 2
  ELAPSED=$((ELAPSED + 2))
done

echo "✅ PostgreSQL is ready!"
echo ""

# Create database if it doesn't exist (connect to 'postgres' default db)
echo "🔍 Checking if database '$DB_NAME' exists..."
DB_EXISTS=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "")

if [ "$DB_EXISTS" = "1" ]; then
  echo "✅ Database '$DB_NAME' already exists"
else
  echo "📦 Creating database '$DB_NAME'..."
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" \
    -c "CREATE DATABASE \"$DB_NAME\";" 2>/dev/null || {
    echo "⚠️  Database creation failed (might already exist or permission issue)"
  }
  echo "✅ Database setup complete!"
fi

# Run Prisma against PgBouncer (normal app URL)
echo ""
echo "🔄 Running Prisma db push..."
DATABASE_URL="$PGBOUNCER_URL" npx prisma db push --accept-data-loss
echo "✅ Schema synced!"

echo ""
echo "🚀 Starting application..."
exec npm start