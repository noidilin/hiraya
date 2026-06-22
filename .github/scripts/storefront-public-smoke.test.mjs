import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'storefront-public-smoke.mjs');

function listen(handler) {
  const server = http.createServer(handler);
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

function runSmoke(baseUrl) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath], {
      env: {
        ...process.env,
        STOREFRONT_PUBLIC_URL: baseUrl,
        STOREFRONT_SMOKE_ATTEMPTS: '1',
        STOREFRONT_SMOKE_DELAY_MS: '0',
        STOREFRONT_SMOKE_TIMEOUT_MS: '1000',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.setEncoding('utf8').on('data', (chunk) => {
      stdout += chunk;
    });
    child.stderr.setEncoding('utf8').on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

test('public smoke passes for Storefront shell and product envelope', async () => {
  const server = await listen((request, response) => {
    if (request.url === '/') {
      response.setHeader('content-type', 'text/html');
      response.end('<!doctype html><title>Hiraya Vintage</title><div id="root"></div>');
      return;
    }
    if (request.url === '/api/products') {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ success: true, data: [{ id: 1, name: 'Vintage Bag' }] }));
      return;
    }
    response.writeHead(404).end();
  });

  try {
    const result = await runSmoke(server.baseUrl);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Public Storefront deploy smoke passed/);
  } finally {
    await server.close();
  }
});

test('public smoke fails for non-enveloped products response', async () => {
  const server = await listen((request, response) => {
    if (request.url === '/') {
      response.setHeader('content-type', 'text/html');
      response.end('<div id="root"></div>');
      return;
    }
    if (request.url === '/api/products') {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify([{ id: 1, name: 'Vintage Bag' }]));
      return;
    }
    response.writeHead(404).end();
  });

  try {
    const result = await runSmoke(server.baseUrl);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /success envelope/);
  } finally {
    await server.close();
  }
});
