# Orders Service Dockerfile
FROM node:24-alpine AS builder

WORKDIR /workspace

# Install from the workspace lockfile so Docker builds use the same pnpm policy as CI.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/services/orders/package.json backend/services/orders/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter orders-service

# Copy source code and build TypeScript
COPY backend/services/orders backend/services/orders
RUN corepack pnpm@11.8.0 --filter orders-service build

# Production stage
FROM node:24-alpine

WORKDIR /workspace

# Install production dependencies only from the workspace lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/services/orders/package.json backend/services/orders/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --prod --filter orders-service

# Copy built application
COPY --from=builder /workspace/backend/services/orders/dist backend/services/orders/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /workspace/backend/services/orders
USER nodejs

EXPOSE 3005

CMD ["node", "dist/index.js"]
