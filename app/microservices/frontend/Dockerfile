FROM node:24-alpine AS build

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY app/microservices/frontend/package.json app/microservices/frontend/package.json

RUN pnpm install --frozen-lockfile --filter frontend...

COPY app/microservices/frontend app/microservices/frontend

ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}

RUN pnpm --filter frontend build

FROM nginx:1.29-alpine AS runtime

COPY app/microservices/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/app/microservices/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
