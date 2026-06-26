import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const dockerfile = await readFile(new URL('../Dockerfile', import.meta.url), 'utf8');
const nginxConfig = await readFile(new URL('../nginx.conf', import.meta.url), 'utf8');
const compose = await readFile(new URL('../../docker-compose.yml', import.meta.url), 'utf8');
const viteConfig = await readFile(new URL('../vite.config.ts', import.meta.url), 'utf8');

function serviceBlock(name) {
  const startMarker = `  ${name}:\n`;
  const start = compose.indexOf(startMarker);
  assert.notEqual(start, -1, `${name} service should exist`);

  const rest = compose.slice(start + startMarker.length);
  const nextService = rest.search(/\n  [a-zA-Z0-9-]+:\n/);
  return nextService === -1 ? rest : rest.slice(0, nextService);
}

test('production frontend image builds the Vite app from the root workspace and serves dist with nginx', () => {
  assert.match(dockerfile, /FROM\s+node:24-alpine\s+AS\s+build/i);
  assert.match(dockerfile, /WORKDIR\s+\/workspace/);
  assert.match(dockerfile, /pnpm\s+--filter\s+frontend\s+build/);
  assert.match(dockerfile, /ARG\s+VITE_API_URL=\/api/);
  assert.match(dockerfile, /ENV\s+VITE_API_URL=\$\{VITE_API_URL\}/);
  assert.match(dockerfile, /COPY\s+--from=build\s+\/workspace\/app\/microservices\/frontend\/dist\s+\/usr\/share\/nginx\/html/);
  assert.match(dockerfile, /COPY\s+app\/microservices\/frontend\/nginx\.conf\s+\/etc\/nginx\/conf\.d\/default\.conf/);
});

test('production nginx runtime preserves SPA fallback and same-origin API proxy', () => {
  assert.match(nginxConfig, /listen\s+80;/);
  assert.match(nginxConfig, /root\s+\/usr\/share\/nginx\/html;/);
  assert.match(nginxConfig, /try_files\s+\$uri\s+\$uri\/\s+\/index\.html;/);
  assert.match(nginxConfig, /location\s+\/api\//);
  assert.match(nginxConfig, /proxy_pass\s+http:\/\/gateway:3001\/api\//);
});

test('Compose exposes production-like and hot-reload frontend modes on the established port', () => {
  const frontend = serviceBlock('frontend');
  const frontendDev = serviceBlock('frontend-dev');

  assert.match(frontend, /VITE_API_URL:\s+\/api/);
  assert.doesNotMatch(compose, /REACT_APP_API_URL/);
  assert.match(frontend, /"3000:80"/);

  assert.match(frontendDev, /profiles:\n\s+-\s+dev/);
  assert.match(frontendDev, /"3000:3000"/);
  assert.match(frontendDev, /VITE_DEV_PROXY_TARGET=http:\/\/gateway:3001/);
  assert.doesNotMatch(compose, /platform:\s+linux\/amd64/);
});

test('frontend-dev service-specific startup includes the gateway upstream backend stack', () => {
  const gateway = serviceBlock('gateway');
  const frontendDev = serviceBlock('frontend-dev');

  assert.match(gateway, /depends_on:/);
  for (const service of ['postgres', 'auth', 'product-service', 'order-service', 'orders', 'user-service']) {
    assert.match(gateway, new RegExp(`${service}:\\n\\s+condition:\\s+service_`), `gateway should depend on ${service}`);
  }
  assert.match(frontendDev, /gateway:\n\s+condition:\s+service_started/);
});

test('Vite dev proxy can target the Compose gateway service', () => {
  assert.match(viteConfig, /process\.env\.VITE_DEV_PROXY_TARGET\s+\?\?\s+'http:\/\/localhost:3001'/);
  assert.match(viteConfig, /target:\s+apiProxyTarget/);
});
