# Build React static assets
FROM node:24-alpine AS build

WORKDIR /workspace

# Install from the workspace lockfile so Docker builds use the same pnpm policy as CI.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/frontend/package.json app/microservices/frontend/package.json
RUN corepack enable && corepack pnpm@11.8.0 install --frozen-lockfile --filter frontend

COPY app/microservices/frontend app/microservices/frontend

# Browser requests should go back through nginx, which proxies /api to the gateway.
ARG REACT_APP_API_URL=/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN corepack pnpm@11.8.0 --filter frontend build

# Serve the built app with nginx
FROM nginx:alpine

COPY app/microservices/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/app/microservices/frontend/build /usr/share/nginx/html

EXPOSE 80
