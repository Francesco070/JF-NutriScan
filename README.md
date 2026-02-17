# JF-NutriScan
Justin & Francesco NutriScan App

NutriScan is a food product scanning application that allows users to scan barcodes and retrieve detailed nutritional information. The application consists of a Vue 3 frontend (packaged as a native Android APK via Capacitor) and a Node.js/Hono backend with a PostgreSQL database.

---

## Table of Contents

- [Requirements](#requirements)
- [Local Development Setup](#local-development-setup)
  - [Frontend](#frontend)
  - [Capacitor (Android)](#capacitor-android)
  - [Backend with Docker](#backend-with-docker)
- [Environment Variables](#environment-variables)
  - [Frontend](#frontend-env)
  - [Backend](#backend-env)
  - [GitHub Actions Secrets](#github-actions-secrets)
- [API Endpoints](#api-endpoints)
  - [Public Endpoints](#public-endpoints-no-authentication-required)
  - [Protected Endpoints](#protected-endpoints-bearer-token-required)
- [CI/CD Pipelines](#cicd-pipelines)
  - [Android APK Build](#android-apk-build)
  - [Docker Backend Build](#docker-backend-build)
- [Database](#database)
- [Architecture Overview](#architecture-overview)

---

## Requirements

### General

- Git
- Node.js >= 20
- npm >= 10

### Frontend Requirements

- Node.js 20
- A modern browser with camera access (for scanning)
- Android Studio (optional, for native Android development)

### Backend Requirements

- Docker >= 24
- Docker Compose >= 2.20

### Android APK Build Requirements

- Java 17 (Temurin distribution)
- Android SDK with Build Tools 34.0.0 and platform android-34
- A valid Android release keystore

---

## Local Development Setup

### Frontend

Clone the repository and navigate to the frontend directory.

```bash
git clone https://github.com/Francesco070/JF-NutriScan.git
cd jf-nutriscan/frontend
```

Install dependencies.

```bash
npm install
```

Create a local environment file. The `.env.development` file is already present in the repository with sensible defaults pointing to the production API. To use a local backend instead, edit the file and uncomment the localhost URL.

```bash
# frontend/.env.development
VITE_API_BASE_URL=http://localhost:3000/api
```

Start the development server.

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

To build the frontend for production.

```bash
npm run build
```

To preview the production build locally.

```bash
npm run preview
```

### Capacitor (Android)

The frontend is configured to run as a native Android application via Capacitor. The app ID is `com.jf.nutriscan`.

Sync the web build to the Android project.

```bash
npm run cap:sync
```

Open the Android project in Android Studio.

```bash
npm run cap:open
```

Build and run on a connected device or emulator.

```bash
npm run cap:run
```

---

### Backend with Docker

Navigate to the backend directory.

```bash
cd jf-nutriscan/backend
```

Copy the example environment file and configure it.

```bash
cp .env.example .env
```

The `.env` file provided in this repository already contains defaults suitable for local development. The only value you may need to change is `JWT_SECRET`.

Start the backend and database using Docker Compose.

```bash
docker compose up --build
```

This will:

1. Build the backend image using the `development` target from `backend/Dockerfile`.
2. Start a PostgreSQL 16 instance.
3. Run `prisma generate` and `prisma db push` to apply the schema.
4. Start the backend on port `3000` with hot-reload via `tsx watch`.

The backend will be available at `http://localhost:3000`. You can verify it is running by calling the health endpoint.

```bash
curl http://localhost:3000/health
```

To stop the containers.

```bash
docker compose down
```

To stop and remove all data volumes.

```bash
docker compose down -v
```

---

## Environment Variables

### Frontend env

**File:** `frontend/.env`

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL for backend API calls | `https://nutriscan.viel-erfolg.ch/api` |
| `VITE_OPEN_FOOD_FACTS_URL` | Open Food Facts API base URL | `https://world.openfoodfacts.org` |
| `VITE_ENABLE_AUTH` | Enable authentication features | `true` |
| `VITE_ENABLE_SYNC` | Enable sync features | `true` |
| `VITE_ENABLE_PWA` | Enable PWA capabilities | `true` |

### Backend env

**File:** `backend/.env`

| Variable | Description | Default (local) |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://jf:JF-NutriScan123@localhost:5432/nutriscan` |
| `PORT` | Port the server listens on | `3000` |
| `NODE_ENV` | Node environment | `development` |
| `JWT_SECRET` | Secret key for signing JWTs | Change this in production |
| `JWT_EXPIRES_IN` | JWT token expiry duration | `7d` |
| `OPEN_FOOD_FACTS_URL` | Open Food Facts API base URL | `https://world.openfoodfacts.net` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:5173,http://localhost:4173` |

### GitHub Actions Secrets

| Secret | Description |
|---|---|
| `VITE_API_BASE_URL` | Production API base URL injected into the APK build |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | Password for the keystore |
| `ANDROID_KEY_PASSWORD` | Password for the signing key |
| `ANDROID_KEY_ALIAS` | Alias of the signing key in the keystore |

---

## API Endpoints

Full documentation is available in `backend/ENDPOINTS.md`. A summary is provided here.

### Public Endpoints (no authentication required)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `GET` | `/api/products/:barcode` | Fetch product details from Open Food Facts by barcode (8-14 digits) |
| `GET` | `/health` | Server health check |

### Protected Endpoints (Bearer token required)

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/auth/me` | Get the current user's profile |
| `GET` | `/api/auth/stats` | Get scan and favorite statistics |
| `PUT` | `/api/auth/update` | Update profile information |
| `POST` | `/api/products` | Create a product record in the database |
| `DELETE` | `/api/products/:barcode` | Delete a product by barcode |
| `GET` | `/api/products/favorites` | List all favorited products |
| `POST` | `/api/products/favorites/:barcode` | Add a product to favorites |
| `DELETE` | `/api/products/favorites/:barcode` | Remove a product from favorites |
| `GET` | `/api/products/favorites/:barcode/check` | Check if a product is favorited |
| `GET` | `/api/products/history` | List scan history (last 50, deduplicated) |
| `POST` | `/api/products/history/:barcode` | Add a scan to history |

Authentication uses JWT Bearer tokens. Include the token in the `Authorization` header: `Authorization: Bearer <token>`.

---

## CI/CD Pipelines

### Android APK Build

**Workflow file:** `.github/workflows/build-android-apk.yml`

This pipeline builds, signs, and releases an Android APK. It is triggered automatically on every push to `main` or `develop`, on pull requests to those branches, and manually via `workflow_dispatch`.

**What it does:**

1. Checks out the repository.
2. Sets up Node.js 20, Java 17, and the Android SDK with Build Tools 34.0.0.
3. Installs frontend dependencies via `npm ci`.
4. Injects environment variables from GitHub Secrets into a `.env.production` file.
5. Builds the Vue.js application with `npm run build`.
6. Syncs the build to the Android project via Capacitor (`npx cap sync android`).
7. Updates `versionCode` (from the GitHub run number) and `versionName` (from `package.json`) in `build.gradle`.
8. Decodes the release keystore from the `ANDROID_KEYSTORE_BASE64` secret and creates `key.properties`.
9. Builds the release APK with Gradle (`assembleRelease`).
10. Verifies the APK signature and alignment using `apksigner` and `zipalign`.
11. Uploads the APK as a GitHub Actions artifact (retained for 90 days).
12. Cleans up all keystore files from the runner.

**Release creation:**

On pushes to `main`, a full GitHub Release is created with the APK attached. On pushes to `develop`, a pre-release is created. Pull request builds post a comment with a download link to the artifact.

**APK naming convention:** `NutriScan-{environment}-v{version}-build{run_number}.apk`

**To generate a release keystore locally:**

```bash
keytool -genkey -v -keystore release.keystore -alias your-key-alias \
  -keyalg RSA -keysize 2048 -validity 10000
```

Encode it for the GitHub Secret:

```bash
base64 -w 0 release.keystore
```

---

### Docker Backend Build

**Workflow file:** `.github/workflows/docker-backend.yml`

This pipeline builds and publishes the backend Docker image to the GitHub Container Registry (ghcr.io). It is triggered on pushes to `main` that include changes to the `backend/` directory or the workflow file itself, and manually via `workflow_dispatch`.

**What it does:**

1. Checks out the repository.
2. Authenticates with the GitHub Container Registry using `GITHUB_TOKEN`.
3. Extracts image metadata (tags and labels) using `docker/metadata-action`.
4. Builds the multi-stage Docker image using the `production` target from `backend/Dockerfile`.
5. Pushes the image to `ghcr.io/{owner}/{repo}/backend` with tags for the branch name, commit SHA, `latest` (on default branch), and semantic version tags if applicable.
6. Uses GitHub Actions cache (`type=gha`) to speed up subsequent builds.
7. Uploads deployment files (a production `docker-compose.prod.yml`, `.env.example`, and `deploy.sh`) as an artifact.

**Image targets in Dockerfile:**

The `backend/Dockerfile` is a multi-stage build with three targets:

- `development`: Runs `tsx watch` for hot-reload during local development.
- `builder`: Compiles TypeScript to `dist/` using `tsc`.
- `production`: Copies the compiled output from `builder`, installs only production dependencies, and runs as a non-root `nodejs` user. The entrypoint runs `prisma migrate deploy` before starting the server.

**To pull and run the production image manually:**

```bash
docker pull ghcr.io/francesco070/jf-nutriscan/backend:latest

# Copy and configure the environment file
cp .env.example .env
nano .env

# Deploy using the provided compose file
docker compose -f docker-compose.prod.yml up -d
```

---

## Database

The application uses PostgreSQL 16 with Prisma ORM.

**Schema summary:**

- `account` - User accounts with hashed passwords and optional profile images.
- `product` - Cached product data from Open Food Facts, keyed by barcode.
- `scanned_product` - Records of which users scanned which products and when.
- `favorites` - A join table recording user-product favorite relationships.

**Running migrations in production:**

The production Docker entrypoint automatically runs `prisma migrate deploy` on startup, applying any pending migrations. The migration history is tracked in `backend/prisma/migrations/`.

**Accessing the database locally:**

More commands are documented in `backend/DATABASE_ACCESS.md`.

---

## Architecture Overview

![Sequence diagram](/doc/diagram/UML-sequence-diagram.png)

**Product lookup flow:**

When a user scans a barcode, the backend checks if the product already exists in the local database. If it does and has complete data, it is returned immediately. If not, the backend fetches the product from the Open Food Facts API, stores it locally, and returns it. This means each product is only fetched from the external API once.

**Authentication:**

The application uses JWT-based authentication. Tokens are signed with `HS256`, stored in `localStorage` on the client, and included as Bearer tokens in all protected API requests. Tokens expire after 1 hour (configured in `backend/src/services/auth/login.ts`).

**Offline detection:**

The frontend includes an offline detection mechanism that pings the backend `/health` endpoint every 5 seconds. If the server is unreachable, the user is redirected to an offline page and automatically redirected back when connectivity is restored.