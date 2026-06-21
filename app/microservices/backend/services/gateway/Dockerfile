# Gateway Service Dockerfile
FROM node:24-alpine AS builder

WORKDIR /workspace

# Install from the workspace lockfile so Docker builds use the same pnpm policy as CI.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/services/gateway/package.json backend/services/gateway/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter gateway-service

# Copy source code and build TypeScript
COPY backend/services/gateway backend/services/gateway
RUN corepack pnpm@11.8.0 --filter gateway-service build

# Production stage
FROM node:24-alpine

WORKDIR /workspace

# Install production dependencies only from the workspace lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/services/gateway/package.json backend/services/gateway/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --prod --filter gateway-service

# Copy built application
COPY --from=builder /workspace/backend/services/gateway/dist backend/services/gateway/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /workspace/backend/services/gateway
USER nodejs

EXPOSE 3001

CMD ["node", "dist/index.js"]
