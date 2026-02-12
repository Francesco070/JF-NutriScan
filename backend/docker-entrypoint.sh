#!/bin/sh
set -e

npx prisma migrate deploy

npx prisma generate

npx prisma db push --accept-data-loss

npm run dev