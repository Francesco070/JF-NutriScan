# Multi-stage Dockerfile for Vue.js Frontend

# ─── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ─── Stage 2: Builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Vite bakes these values into the JS bundle at build time.
# The production API URL is the default — override via --build-arg if needed.
ARG VITE_API_BASE_URL=https://nutriscan.viel-erfolg.ch/api
ARG VITE_OPEN_FOOD_FACTS_URL=https://world.openfoodfacts.org
ARG VITE_ENABLE_AUTH=true
ARG VITE_ENABLE_SYNC=true
ARG VITE_ENABLE_PWA=true

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_OPEN_FOOD_FACTS_URL=$VITE_OPEN_FOOD_FACTS_URL
ENV VITE_ENABLE_AUTH=$VITE_ENABLE_AUTH
ENV VITE_ENABLE_SYNC=$VITE_ENABLE_SYNC
ENV VITE_ENABLE_PWA=$VITE_ENABLE_PWA

RUN npm run build

# ─── Stage 3: Production (nginx) ──────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=builder /app/dist /usr/share/nginx/html

RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /usr/share/nginx/html && \
    chown -R appuser:appgroup /var/cache/nginx && \
    chown -R appuser:appgroup /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]