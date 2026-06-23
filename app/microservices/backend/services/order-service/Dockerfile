# Order Service Dockerfile (JavaScript service)
FROM node:24-alpine

WORKDIR /workspace

# Install production dependencies from the workspace lockfile so Docker builds
# use the same pnpm policy as CI.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/backend/package.json app/microservices/backend/package.json
COPY app/microservices/backend/services/order-service/package.json app/microservices/backend/services/order-service/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --prod --filter order-service

# Copy source code
COPY app/microservices/backend/services/order-service app/microservices/backend/services/order-service

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /workspace/app/microservices/backend/services/order-service
USER nodejs

EXPOSE 3004

CMD ["node", "src/server.js"]
