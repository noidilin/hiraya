#!/usr/bin/env node
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
  const options = {
    root: process.cwd(),
    output: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      options.root = argv[++index];
      continue;
    }
    if (arg === '--output') {
      options.output = argv[++index];
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      console.log('Usage: generate-portfolio-citation-manifest.mjs [--root <repo-root>] --output <path>');
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.output) {
    throw new Error('--output is required');
  }

  return {
    root: path.resolve(options.root),
    output: path.resolve(options.output),
  };
}

function parseFrontmatter(fileName, content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    throw new Error(`${fileName}: frontmatter block is required`);
  }

  const frontmatter = {};
  for (const line of (match[1] ?? '').split(/\r?\n/)) {
    if (line.trim() === '') {
      continue;
    }
    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (!keyValue) {
      continue;
    }
    const [, key, value] = keyValue;
    frontmatter[key] = value.trim().replace(/^['"]|['"]$/g, '');
  }

  if (!frontmatter.title) {
    throw new Error(`${fileName}: title is required for citation manifest`);
  }

  return frontmatter;
}

async function buildManifest(root) {
  const docsDir = path.join(root, 'docs/portfolio');
  const entries = await readdir(docsDir, { withFileTypes: true });
  const documents = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md') || entry.name === 'README.md') {
      continue;
    }

    const relativePath = `docs/portfolio/${entry.name}`;
    const content = await readFile(path.join(docsDir, entry.name), 'utf8');
    const frontmatter = parseFrontmatter(entry.name, content);
    documents.push({
      key: `knowledge/${entry.name}`,
      source: relativePath,
      title: frontmatter.title,
      category: frontmatter.category ?? null,
      lastReviewed: frontmatter.last_reviewed ?? null,
    });
  }

  documents.sort((left, right) => left.source.localeCompare(right.source));
  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    documents,
  };
}

async function main() {
  const { root, output } = parseArgs(process.argv.slice(2));
  const manifest = await buildManifest(root);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Wrote ${manifest.documents.length} Portfolio citation manifest entries to ${output}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
