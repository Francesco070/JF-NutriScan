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

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Remove the "user" directive from the global nginx.conf so it works as non-root
RUN sed -i '/^user /d' /etc/nginx/nginx.conf

# Copy our SPA config
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Directories nginx needs to write to as non-root
RUN mkdir -p /var/cache/nginx /var/log/nginx /tmp/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /tmp/nginx /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/log/nginx && \
    # Point nginx pid file to a writable location
    sed -i 's|pid\s*/run/nginx.pid;|pid /tmp/nginx/nginx.pid;|' /etc/nginx/nginx.conf

USER nginx

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]