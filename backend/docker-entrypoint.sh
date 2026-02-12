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
STRIPPED=$(echo "$DIRECT_URL" | sed 's|^postgresql://||')

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

# Wait for PostgreSQL to be ready (max 60 seconds)
echo "⏳ Waiting for PostgreSQL to be ready..."
TIMEOUT=60
ELAPSED=0
until PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c '\q' 2>/dev/null; do
  if [ $ELAPSED -ge $TIMEOUT ]; then
    echo "❌ ERROR: PostgreSQL did not become ready within ${TIMEOUT}s"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if PostgreSQL pod is running: kubectl get pods -n everest | grep postgres"
    echo "  2. Check DATABASE_DIRECT_URL points to correct service"
    echo "  3. Check credentials are correct"
    echo "  4. Check network policies allow connection"
    exit 1
  fi
  echo "   PostgreSQL not ready yet — retrying in 2s... ($ELAPSED/$TIMEOUT)"
  sleep 2
  ELAPSED=$((ELAPSED + 2))
done
echo "✅ PostgreSQL is ready!"

# Create database if it doesn't exist (connect to 'postgres' default db)
echo ""
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