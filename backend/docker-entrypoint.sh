#!/bin/sh
set -e

echo "======================================"
echo "  NutriScan Database Init"
echo "======================================"

# PgBouncer URL (used by the app)
# e.g. postgresql://user:pass@jf-nutriscan-pgbouncer.everest.svc:5432/nutriscan
PGBOUNCER_URL="${DATABASE_URL}"

# Direct Postgres URL (bypasses PgBouncer for admin tasks)
# Set DATABASE_DIRECT_URL in your k8s secret/env, pointing straight to postgres pod/service
# e.g. postgresql://user:pass@jf-nutriscan-postgresql.everest.svc:5432/nutriscan
DIRECT_URL="${DATABASE_DIRECT_URL:-$DATABASE_URL}"

# Extract connection parts from DIRECT_URL
# Expected format: postgresql://user:pass@host:port/dbname
DB_USER=$(echo "$DIRECT_URL" | sed -E 's|postgresql://([^:]+):.*|\1|')
DB_PASS=$(echo "$DIRECT_URL" | sed -E 's|postgresql://[^:]+:([^@]+)@.*|\1|')
DB_HOST=$(echo "$DIRECT_URL" | sed -E 's|postgresql://[^@]+@([^:/]+).*|\1|')
DB_PORT=$(echo "$DIRECT_URL" | sed -E 's|postgresql://[^@]+@[^:]+:([^/]+)/.*|\1|')
DB_NAME=$(echo "$DIRECT_URL" | sed -E 's|postgresql://[^/]+/([^?]+).*|\1|')

echo "Host:     $DB_HOST"
echo "Port:     $DB_PORT"
echo "Database: $DB_NAME"
echo "User:     $DB_USER"

# Wait for PostgreSQL to be ready
echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
until PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c '\q' 2>/dev/null; do
  echo "   PostgreSQL not ready yet — retrying in 2s..."
  sleep 2
done
echo "✅ PostgreSQL is ready!"

# Create database if it doesn't exist (connect to 'postgres' default db)
echo ""
echo "🔍 Checking if database '$DB_NAME' exists..."
DB_EXISTS=$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
  echo "✅ Database '$DB_NAME' already exists"
else
  echo "📦 Creating database '$DB_NAME'..."
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" \
    -c "CREATE DATABASE \"$DB_NAME\";"
  echo "✅ Database '$DB_NAME' created!"
fi

# Run Prisma against PgBouncer (normal app URL)
echo ""
echo "🔄 Running Prisma db push..."
DATABASE_URL="$PGBOUNCER_URL" npx prisma db push --accept-data-loss
echo "✅ Schema synced!"

echo ""
echo "🚀 Starting application..."
exec npm start