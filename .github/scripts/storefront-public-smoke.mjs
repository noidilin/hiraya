#!/usr/bin/env node
import process from 'node:process';

const DEFAULT_PUBLIC_URL = 'https://hiraya.noidilin.dev';
const publicUrl = normalizeBaseUrl(process.env.STOREFRONT_PUBLIC_URL ?? process.argv[2] ?? DEFAULT_PUBLIC_URL);
const attempts = Number.parseInt(process.env.STOREFRONT_SMOKE_ATTEMPTS ?? '30', 10);
const delayMs = Number.parseInt(process.env.STOREFRONT_SMOKE_DELAY_MS ?? '20000', 10);
const timeoutMs = Number.parseInt(process.env.STOREFRONT_SMOKE_TIMEOUT_MS ?? '15000', 10);

function normalizeBaseUrl(value) {
  if (!value || !value.trim()) {
    throw new Error('STOREFRONT_PUBLIC_URL must not be empty.');
  }
  return value.trim().replace(/\/+$/, '');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'text/html,application/xhtml+xml' },
      redirect: 'follow',
      signal: controller.signal,
    });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      redirect: 'follow',
      signal: controller.signal,
    });
    const text = await response.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch (error) {
      throw new Error(`${url} did not return JSON: ${text.slice(0, 160)}`);
    }
    return { response, json };
  } finally {
    clearTimeout(timeout);
  }
}

function assertStorefrontShell(response, html) {
  if (!response.ok) {
    throw new Error(`${publicUrl}/ returned HTTP ${response.status}.`);
  }
  if (!html.includes('<div id="root"></div>') && !html.includes('id="root"')) {
    throw new Error(`${publicUrl}/ did not look like the Storefront shell document.`);
  }
}

function productDataFromEnvelope(body) {
  if (body?.success !== true) {
    throw new Error(`/api/products response must be a success envelope; got ${JSON.stringify(body).slice(0, 240)}.`);
  }
  if (Array.isArray(body.data)) {
    return body.data;
  }
  if (Array.isArray(body.data?.products)) {
    return body.data.products;
  }
  throw new Error('/api/products success envelope must contain product data as an array.');
}

function assertProductsEnvelope(response, body) {
  if (!response.ok) {
    throw new Error(`${publicUrl}/api/products returned HTTP ${response.status}.`);
  }
  const products = productDataFromEnvelope(body);
  if (products.length === 0) {
    throw new Error('/api/products returned an empty product data array.');
  }
}

async function checkOnce() {
  const shell = await fetchText(`${publicUrl}/`);
  assertStorefrontShell(shell.response, shell.text);

  const products = await fetchJson(`${publicUrl}/api/products`);
  assertProductsEnvelope(products.response, products.json);
}

async function main() {
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new Error('STOREFRONT_SMOKE_ATTEMPTS must be a positive integer.');
  }
  if (!Number.isInteger(delayMs) || delayMs < 0) {
    throw new Error('STOREFRONT_SMOKE_DELAY_MS must be a non-negative integer.');
  }

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await checkOnce();
      console.log(`Public Storefront deploy smoke passed for ${publicUrl}.`);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (attempt === attempts) {
        throw new Error(`Public Storefront deploy smoke failed after ${attempts} attempt(s): ${message}`);
      }
      console.log(`Waiting for public Storefront smoke (${attempt}/${attempts}): ${message}`);
      await sleep(delayMs);
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
