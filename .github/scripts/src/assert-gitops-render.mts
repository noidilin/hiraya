#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

interface CliOptions {
  root: string;
  renderedPath?: string;
}

interface K8sDoc {
  raw: string;
  kind: string;
  name: string;
}

const EXPECTED_HOSTNAME = 'hiraya.noidilin.dev';
const EXPECTED_FRONTEND_ROUTE_PORT = 3000;
const EXPECTED_FRONTEND_CONTAINER_PORT = 80;

const EXPECTED_GATEWAY_ENV = new Map<string, string>([
  ['AUTH_SERVICE_URL', 'http://auth:3002'],
  ['PRODUCTS_SERVICE_URL', 'http://product-service:3003'],
  ['ORDERS_SERVICE_URL', 'http://orders:3005'],
  ['USERS_SERVICE_URL', 'http://user-service:3006'],
]);

function usage(): string {
  return 'Usage: assert-gitops-render.mjs [--root repo-root] [--rendered rendered.yaml]';
}

function parseArgs(argv: string[]): CliOptions {
  const args = [...argv];
  let root = process.cwd();
  let renderedPath: string | undefined;

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === '--root') {
      const value = args.shift();
      if (!value) {
        throw new Error(`--root requires a value\n${usage()}`);
      }
      root = value;
      continue;
    }
    if (arg === '--rendered') {
      const value = args.shift();
      if (!value) {
        throw new Error(`--rendered requires a value\n${usage()}`);
      }
      renderedPath = value;
      continue;
    }
    throw new Error(`Unknown option: ${arg}\n${usage()}`);
  }

  return {
    root: path.resolve(root),
    renderedPath: renderedPath ? path.resolve(renderedPath) : undefined,
  };
}

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function extractField(raw: string, field: string): string | undefined {
  const match = raw.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return match ? stripQuotes(match[1]) : undefined;
}

function splitRenderedDocs(rendered: string): K8sDoc[] {
  return rendered
    .split(/^---\s*$/m)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const kind = extractField(raw, 'kind');
      const name = raw.match(/^metadata:\n(?:^[ \t].*\n)*?^[ \t]{2}name:\s*([^\n]+)$/m)?.[1];
      if (!kind || !name) {
        throw new Error(`Rendered manifest document is missing kind or metadata.name:\n${raw.slice(0, 240)}`);
      }
      return { raw, kind, name: stripQuotes(name) };
    });
}

function findDoc(docs: K8sDoc[], kind: string, name: string): K8sDoc {
  const doc = docs.find((candidate) => candidate.kind === kind && candidate.name === name);
  if (!doc) {
    throw new Error(`Expected rendered ${kind}/${name} to exist.`);
  }
  return doc;
}

function extractNumericList(raw: string, field: string): number[] {
  return [...raw.matchAll(new RegExp(`^[ \\t-]*${field}:\\s*([0-9]+)\\s*$`, 'gm'))].map((match) => Number(match[1]));
}

function extractServicePorts(raw: string): Array<{ port: number; targetPort: number }> {
  const lines = raw.split('\n');
  const ports: Array<{ port?: number; targetPort?: number }> = [];
  let current: { port?: number; targetPort?: number } | undefined;

  for (const line of lines) {
    const listItem = line.match(/^\s*-\s+(?:(name|port):\s+(.+))?$/);
    if (listItem && line.includes('- ')) {
      if (current && (current.port !== undefined || current.targetPort !== undefined)) {
        ports.push(current);
      }
      current = {};
      if (listItem[1] === 'port') {
        current.port = Number(listItem[2]);
      }
    }

    const port = line.match(/^\s+port:\s*([0-9]+)\s*$/);
    if (port) {
      current ??= {};
      current.port = Number(port[1]);
    }

    const targetPort = line.match(/^\s+targetPort:\s*([0-9]+)\s*$/);
    if (targetPort) {
      current ??= {};
      current.targetPort = Number(targetPort[1]);
    }
  }

  if (current && (current.port !== undefined || current.targetPort !== undefined)) {
    ports.push(current);
  }

  return ports.map((entry) => {
    if (entry.port === undefined || entry.targetPort === undefined) {
      throw new Error('Every rendered Service port must declare numeric port and targetPort.');
    }
    return { port: entry.port, targetPort: entry.targetPort };
  });
}

function extractGatewayEnv(raw: string): Map<string, string> {
  const env = new Map<string, string>();
  const matches = raw.matchAll(/^\s*-\s+name:\s*([^\n]+)\n\s+value:\s*([^\n]+)$/gm);
  for (const match of matches) {
    env.set(stripQuotes(match[1]), stripQuotes(match[2]));
  }
  return env;
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadRendered(options: CliOptions): Promise<string> {
  if (options.renderedPath) {
    return readFile(options.renderedPath, 'utf8');
  }

  const result = spawnSync('kubectl', ['kustomize', 'gitops/apps/vintage'], {
    cwd: options.root,
    encoding: 'utf8',
  });

  if (result.error) {
    throw new Error(`Failed to run kubectl kustomize gitops: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`kubectl kustomize gitops/apps/vintage failed:\n${result.stderr}`);
  }
  return result.stdout;
}

function assertFrontendRoute(docs: K8sDoc[]): void {
  const route = findDoc(docs, 'HTTPRoute', 'frontend');
  assert(route.raw.includes(`- ${EXPECTED_HOSTNAME}`), `HTTPRoute/frontend must keep hostname ${EXPECTED_HOSTNAME}.`);
  const frontendBackendRef = new RegExp(`backendRefs:[\\s\\S]*- name: frontend[\\s\\S]*port: ${EXPECTED_FRONTEND_ROUTE_PORT}(?:\\s|$)`).test(route.raw);
  assert(frontendBackendRef, `HTTPRoute/frontend must target the frontend Service on port ${EXPECTED_FRONTEND_ROUTE_PORT}.`);
}

function assertFrontendService(docs: K8sDoc[]): void {
  const service = findDoc(docs, 'Service', 'frontend');
  assert(service.raw.includes('type: ClusterIP'), 'Service/frontend must remain ClusterIP.');
  const ports = extractServicePorts(service.raw);
  assert(ports.some((entry) => entry.port === EXPECTED_FRONTEND_ROUTE_PORT && entry.targetPort === EXPECTED_FRONTEND_CONTAINER_PORT), `Service/frontend must expose ${EXPECTED_FRONTEND_ROUTE_PORT} and target container port ${EXPECTED_FRONTEND_CONTAINER_PORT}.`);
}

function assertGatewayEnv(docs: K8sDoc[]): void {
  const gateway = findDoc(docs, 'Deployment', 'gateway');
  const env = extractGatewayEnv(gateway.raw);
  for (const [name, expected] of EXPECTED_GATEWAY_ENV) {
    assert(env.get(name) === expected, `Deployment/gateway ${name} must be ${expected}; got ${env.get(name) ?? '<missing>'}.`);
  }
}

function assertDeploymentServicePortPairs(docs: K8sDoc[]): void {
  const deployments = docs.filter((doc) => doc.kind === 'Deployment');
  for (const deployment of deployments) {
    const service = docs.find((doc) => doc.kind === 'Service' && doc.name === deployment.name);
    if (!service) {
      continue;
    }
    const containerPorts = new Set(extractNumericList(deployment.raw, 'containerPort'));
    assert(containerPorts.size > 0, `Deployment/${deployment.name} must declare at least one containerPort.`);
    for (const servicePort of extractServicePorts(service.raw)) {
      assert(containerPorts.has(servicePort.targetPort), `Service/${service.name} targetPort ${servicePort.targetPort} must match a Deployment/${deployment.name} containerPort (${[...containerPorts].join(', ')}).`);
    }
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const rendered = await loadRendered(options);
  const docs = splitRenderedDocs(rendered);

  assertFrontendRoute(docs);
  assertFrontendService(docs);
  assertGatewayEnv(docs);
  assertDeploymentServicePortPairs(docs);

  console.log(`GitOps render assertions passed for ${docs.length} rendered manifest documents.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
