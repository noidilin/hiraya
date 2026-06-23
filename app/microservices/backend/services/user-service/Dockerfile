# User Service Dockerfile
FROM node:24-alpine AS builder

WORKDIR /workspace

# Install from the workspace lockfile so Docker builds use the same pnpm policy as CI.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/backend/package.json app/microservices/backend/package.json
COPY app/microservices/backend/services/user-service/package.json app/microservices/backend/services/user-service/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter user-service

# Copy source code and build TypeScript
COPY app/microservices/backend/services/user-service app/microservices/backend/services/user-service
RUN corepack pnpm@11.8.0 --filter user-service build

# Production stage
FROM node:24-alpine

WORKDIR /workspace

# Install production dependencies only from the workspace lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/backend/package.json app/microservices/backend/package.json
COPY app/microservices/backend/services/user-service/package.json app/microservices/backend/services/user-service/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --prod --filter user-service

# Copy built application
COPY --from=builder /workspace/app/microservices/backend/services/user-service/dist app/microservices/backend/services/user-service/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /workspace/app/microservices/backend/services/user-service
USER nodejs

EXPOSE 3006

CMD ["node", "dist/index.js"]
