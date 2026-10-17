# syntax=docker/dockerfile:1

# ---------- 1. deps: install node_modules from the lockfile ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- 2. builder: create the production build ----------
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# NEXT_PUBLIC_* values are baked into the browser JavaScript at BUILD time,
# so they must be passed as build args (docker-compose.yaml does this).
# Changing them means rebuilding the image, not just restarting the container.
ARG NEXT_PUBLIC_GRAPHQL_URL
ARG NEXT_PUBLIC_MOCK_API=false
ARG NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY=CC-Attribution-NonCommercial-NoDerivatives
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL \
    NEXT_PUBLIC_MOCK_API=$NEXT_PUBLIC_MOCK_API \
    NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY=$NEXT_PUBLIC_FULLCALENDAR_LICENSE_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- 3. runner: the small image that actually runs ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as a non-root user
RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# The standalone server (needs output: "standalone" in next.config.ts),
# plus the static files it does not copy by itself
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null || exit 1

CMD ["node", "server.js"]
