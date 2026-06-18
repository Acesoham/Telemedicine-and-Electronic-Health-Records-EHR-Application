# ─────────────────────────────────────────────────────────────────
# MediVault Backend — Multi-stage Dockerfile
# ─────────────────────────────────────────────────────────────────

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# ─────────────────────────────────────────────────────────────────
# Stage 2: Production
# ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

# Security: don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S medivault -u 1001

WORKDIR /app

# Copy only production artifacts
COPY --from=builder --chown=medivault:nodejs /app/dist ./dist
COPY --from=builder --chown=medivault:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=medivault:nodejs /app/package.json ./

# Create log and upload directories
RUN mkdir -p /app/logs /app/uploads && \
    chown -R medivault:nodejs /app/logs /app/uploads

USER medivault

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "dist/server.js"]
