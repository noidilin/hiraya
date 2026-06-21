# Product Service Dockerfile
FROM node:24-alpine AS builder

WORKDIR /workspace

# Install from the workspace lockfile so Docker builds use the same pnpm policy as CI.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/services/product-service/package.json backend/services/product-service/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter product-service

# Copy source code and build TypeScript
COPY backend/services/product-service backend/services/product-service
RUN corepack pnpm@11.8.0 --filter product-service build

# Production stage
FROM node:24-alpine

WORKDIR /workspace

# Install production dependencies only from the workspace lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json backend/package.json
COPY backend/services/product-service/package.json backend/services/product-service/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --prod --filter product-service

# Copy built application
COPY --from=builder /workspace/backend/services/product-service/dist backend/services/product-service/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /workspace/backend/services/product-service
USER nodejs

EXPOSE 3003

CMD ["node", "dist/index.js"]
