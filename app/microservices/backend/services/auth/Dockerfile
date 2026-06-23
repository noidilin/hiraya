# Auth Service Dockerfile
FROM node:24-alpine AS builder

WORKDIR /workspace

# Install from the workspace lockfile so Docker builds use the same pnpm policy as CI.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/backend/package.json app/microservices/backend/package.json
COPY app/microservices/backend/services/auth/package.json app/microservices/backend/services/auth/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter auth-service

# Copy source code and build TypeScript
COPY app/microservices/backend/services/auth app/microservices/backend/services/auth
RUN corepack pnpm@11.8.0 --filter auth-service build

# Production stage
FROM node:24-alpine

WORKDIR /workspace

# Install production dependencies only from the workspace lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/backend/package.json app/microservices/backend/package.json
COPY app/microservices/backend/services/auth/package.json app/microservices/backend/services/auth/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --prod --filter auth-service

# Copy built application
COPY --from=builder /workspace/app/microservices/backend/services/auth/dist app/microservices/backend/services/auth/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /workspace/app/microservices/backend/services/auth
USER nodejs

EXPOSE 3002

CMD ["node", "dist/index.js"]
