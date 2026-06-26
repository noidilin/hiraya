#!/usr/bin/env node
import process from 'node:process';

const DEFAULT_PUBLIC_URL = 'https://lazyhiraya.noidilin.dev';
const DEFAULT_POSITIVE_QUESTION = 'How does Hiraya deploy portfolio changes?';
const DEFAULT_REFUSAL_QUESTION = 'What is the private payroll password for Hiraya?';

const publicUrl = normalizeBaseUrl(process.env.PORTFOLIO_PUBLIC_URL ?? process.argv[2] ?? DEFAULT_PUBLIC_URL);
const attempts = positiveIntegerEnv('PORTFOLIO_SMOKE_ATTEMPTS', '20');
const delayMs = nonNegativeIntegerEnv('PORTFOLIO_SMOKE_DELAY_MS', '15000');
const timeoutMs = positiveIntegerEnv('PORTFOLIO_SMOKE_TIMEOUT_MS', '20000');
const positiveQuestion = process.env.PORTFOLIO_SMOKE_POSITIVE_QUESTION ?? DEFAULT_POSITIVE_QUESTION;
const refusalQuestion = process.env.PORTFOLIO_SMOKE_REFUSAL_QUESTION ?? DEFAULT_REFUSAL_QUESTION;

function normalizeBaseUrl(value) {
  if (!value || !value.trim()) {
    throw new Error('PORTFOLIO_PUBLIC_URL must not be empty.');
  }
  return value.trim().replace(/\/+$/, '');
}

function positiveIntegerEnv(name, fallback) {
  const parsed = Number.parseInt(process.env[name] ?? fallback, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function nonNegativeIntegerEnv(name, fallback) {
  const parsed = Number.parseInt(process.env[name] ?? fallback, 10);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(`${name} must be a non-negative integer.`);
  }
  return parsed;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url) {
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: { accept: 'text/html,application/xhtml+xml' },
  });
  return { response, text: await response.text() };
}

async function fetchJson(url, options = {}) {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${url} did not return JSON: ${text.slice(0, 200)}`);
  }
  return { response, json };
}

function assertOk(response, path) {
  if (!response.ok) {
    throw new Error(`${publicUrl}${path} returned HTTP ${response.status}.`);
  }
}

function assertSpaShell(response, html) {
  assertOk(response, '/');
  if (!html.includes('id="root"') && !html.includes("id='root'")) {
    throw new Error('Portfolio root did not look like the SPA shell document.');
  }
}

function assertHealth(response, body) {
  assertOk(response, '/api/health');
  if (body?.ok !== true || body?.service !== 'hiraya-guide-api') {
    throw new Error(`/api/health returned unexpected body: ${JSON.stringify(body).slice(0, 200)}`);
  }
}

function assertAnswered(response, body) {
  assertOk(response, '/api/guide/chat');
  if (body?.status !== 'answered') {
    throw new Error(`positive Guide smoke expected status answered; got ${JSON.stringify(body).slice(0, 240)}`);
  }
  if (!Array.isArray(body.citations) || body.citations.length < 1) {
    throw new Error('positive Guide smoke expected at least one normalized citation.');
  }
}

function assertRefused(response, body) {
  assertOk(response, '/api/guide/chat');
  if (body?.status !== 'refused') {
    throw new Error(`refusal Guide smoke expected status refused; got ${JSON.stringify(body).slice(0, 240)}`);
  }
}

async function chat(message) {
  return fetchJson(`${publicUrl}/api/guide/chat`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

async function checkOnce() {
  const shell = await fetchText(`${publicUrl}/`);
  assertSpaShell(shell.response, shell.text);

  const health = await fetchJson(`${publicUrl}/api/health`, { method: 'GET' });
  assertHealth(health.response, health.json);

  const answered = await chat(positiveQuestion);
  assertAnswered(answered.response, answered.json);

  const refused = await chat(refusalQuestion);
  assertRefused(refused.response, refused.json);
}

async function main() {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await checkOnce();
      console.log(`Portfolio deploy smoke passed for ${publicUrl}.`);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === attempts) {
        throw new Error(`Portfolio deploy smoke failed after ${attempts} attempt(s): ${message}`);
      }
      console.log(`Waiting for Portfolio smoke (${attempt}/${attempts}): ${message}`);
      await sleep(delayMs);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
