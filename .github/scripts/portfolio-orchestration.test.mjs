import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { spawn, spawnSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const workflowPath = path.resolve(scriptsDir, '../workflows/portfolio-deploy.yml');
const manifestScriptPath = path.join(scriptsDir, 'generate-portfolio-citation-manifest.mjs');
const smokeScriptPath = path.join(scriptsDir, 'portfolio-public-smoke.mjs');

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
    const child = spawn(process.execPath, [smokeScriptPath], {
      env: {
        ...process.env,
        PORTFOLIO_PUBLIC_URL: baseUrl,
        PORTFOLIO_SMOKE_ATTEMPTS: '1',
        PORTFOLIO_SMOKE_TIMEOUT_MS: '1000',
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

test('Portfolio orchestration workflow coordinates app deploy, knowledge sync, and final smoke', async () => {
  const workflow = await readFile(workflowPath, 'utf8');

  assert.match(workflow, /^on:\n\s+push:\n\s+branches:\s+\[main\]/m, 'workflow should run from main branch pushes');
  assert.match(workflow, /concurrency:[\s\S]*group: hiraya-portfolio-deploy-dev/, 'workflow should prevent overlapping Portfolio deploys');
  assert.match(workflow, /detect-changes:/, 'workflow should classify changed paths');
  assert.match(workflow, /knowledge-sync:[\s\S]*aws s3 sync docs\/portfolio\/ "s3:\/\/\$\{KNOWLEDGE_BUCKET\}\/\$\{KNOWLEDGE_PREFIX\}" --delete/, 'knowledge sync should mirror curated docs with delete');
  assert.match(workflow, /generate-portfolio-citation-manifest\.mjs/, 'workflow should generate citation manifest from Markdown frontmatter');
  assert.match(workflow, /aws bedrock-agent start-ingestion-job/, 'workflow should start Bedrock ingestion');
  assert.match(workflow, /aws bedrock-agent get-ingestion-job/, 'workflow should poll Bedrock ingestion');
  assert.match(workflow, /KNOWLEDGE_VERSION/, 'workflow should bump Lambda knowledge-version environment');
  assert.match(workflow, /app-deploy:[\s\S]*needs:\s+\[detect-changes, knowledge-sync\]/, 'app deploy should wait for knowledge sync when both changed');
  assert.match(workflow, /zip -qr "\$\{RUNNER_TEMP\}\/guide-api\.zip"/, 'Lambda zip should be built in workflow temp');
  assert.match(workflow, /aws s3 sync app\/portfolio\/frontend\/dist\/ "s3:\/\/\$\{SITE_BUCKET\}\/" --delete/, 'frontend assets should be uploaded to S3');
  assert.match(workflow, /cache-control "public,max-age=31536000,immutable"/, 'hashed/static assets should get immutable cache headers');
  assert.match(workflow, /cache-control "no-cache"/, 'SPA shell should get no-cache headers');
  assert.match(workflow, /--paths "\/" "\/index\.html"/, 'CloudFront invalidation should be scoped to SPA shell paths');
  assert.match(workflow, /smoke:[\s\S]*needs:\s+\[detect-changes, knowledge-sync, app-deploy\]/, 'smoke should wait for app and knowledge jobs');
  assert.match(workflow, /portfolio-public-smoke\.mjs/, 'workflow should run deployed Portfolio smoke checks');
});

test('citation manifest generator maps curated Markdown to safe source labels outside the knowledge prefix', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'hiraya-citation-manifest-'));
  const docsDir = path.join(root, 'docs/portfolio');
  await mkdir(docsDir, { recursive: true });
  await writeFile(path.join(docsDir, 'CICD.md'), '---\ntitle: CI/CD Workflow\naudience: portfolio_visitor\ncategory: cicd\nlast_reviewed: 2026-06-27\n---\n\n# CI/CD\n');
  await writeFile(path.join(docsDir, 'README.md'), '# not ingested\n');
  const output = path.join(root, 'manifests/citations.json');

  const result = spawnSync(process.execPath, [manifestScriptPath, '--root', root, '--output', output], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(await readFile(output, 'utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.deepEqual(manifest.documents, [{
    key: 'knowledge/CICD.md',
    source: 'docs/portfolio/CICD.md',
    title: 'CI/CD Workflow',
    category: 'cicd',
    lastReviewed: '2026-06-27',
  }]);
});

test('Portfolio public smoke checks shell, health, answered citations, and refusal', async () => {
  const requests = [];
  const server = await listen(async (request, response) => {
    requests.push(`${request.method} ${request.url}`);
    if (request.method === 'GET' && request.url === '/') {
      response.setHeader('content-type', 'text/html');
      response.end('<!doctype html><div id="root"></div>');
      return;
    }
    if (request.method === 'GET' && request.url === '/api/health') {
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ ok: true, service: 'hiraya-guide-api' }));
      return;
    }
    if (request.method === 'POST' && request.url === '/api/guide/chat') {
      let body = '';
      for await (const chunk of request) body += chunk;
      const parsed = JSON.parse(body);
      response.setHeader('content-type', 'application/json');
      if (parsed.message.includes('payroll')) {
        response.end(JSON.stringify({ status: 'refused', answer: 'I can only answer from curated project knowledge.', citations: [] }));
      } else {
        response.end(JSON.stringify({ status: 'answered', answer: 'Portfolio deploys are coordinated.', citations: [{ title: 'CI/CD Workflow', source: 'docs/portfolio/CICD.md' }] }));
      }
      return;
    }
    response.writeHead(404).end();
  });

  try {
    const result = await runSmoke(server.baseUrl);

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Portfolio deploy smoke passed/);
    assert.deepEqual(requests, [
      'GET /',
      'GET /api/health',
      'POST /api/guide/chat',
      'POST /api/guide/chat',
    ]);
  } finally {
    await server.close();
  }
});
