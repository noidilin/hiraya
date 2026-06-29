#!/usr/bin/env node
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const requiredDocuments = [
  'PROJECT_BRIEF.md',
  'ARCHITECTURE.md',
  'CICD.md',
  'SECURITY_GATES.md',
  'TEAM_ROLES.md',
  'DECISIONS.md',
];

const maxChunkBytes = 900;

function parseArgs(argv) {
  const options = { root: process.cwd(), output: undefined };
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
      console.log('Usage: stage-portfolio-knowledge.mjs [--root <repo-root>] --output <staging-dir>');
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${arg}`);
  }
  if (!options.output) throw new Error('--output is required');
  return { root: path.resolve(options.root), output: path.resolve(options.output) };
}

function stripFrontmatter(content) {
  return content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
}

function splitOversizedBlock(block) {
  const sentences = block.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [block];
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = current ? `${current} ${sentence.trim()}` : sentence.trim();
    if (Buffer.byteLength(candidate, 'utf8') <= maxChunkBytes) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    if (Buffer.byteLength(sentence, 'utf8') <= maxChunkBytes) {
      current = sentence.trim();
      continue;
    }
    for (let index = 0; index < sentence.length; index += maxChunkBytes) {
      chunks.push(sentence.slice(index, index + maxChunkBytes));
    }
    current = '';
  }

  if (current) chunks.push(current);
  return chunks;
}

export function chunkMarkdown(content) {
  const body = stripFrontmatter(content).trim();
  const blocks = body.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const chunks = [];
  let current = '';

  for (const block of blocks.flatMap((block) => (Buffer.byteLength(block, 'utf8') > maxChunkBytes ? splitOversizedBlock(block) : [block]))) {
    const candidate = current ? `${current}\n\n${block}` : block;
    if (Buffer.byteLength(candidate, 'utf8') <= maxChunkBytes) {
      current = candidate;
      continue;
    }
    if (current) chunks.push(current);
    current = block;
  }

  if (current) chunks.push(current);
  return chunks;
}

async function stageKnowledge(root, output) {
  const docsDir = path.join(root, 'docs/portfolio');
  const entries = await readdir(docsDir, { withFileTypes: true });
  const availableFiles = new Set(entries.filter((entry) => entry.isFile()).map((entry) => entry.name));

  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  for (const fileName of requiredDocuments) {
    if (!availableFiles.has(fileName)) throw new Error(`${fileName}: required curated document is missing`);

    const content = await readFile(path.join(docsDir, fileName), 'utf8');
    const chunks = chunkMarkdown(content);
    const documentName = path.basename(fileName, '.md');
    const documentDir = path.join(output, documentName);
    await mkdir(documentDir, { recursive: true });

    for (const [index, chunk] of chunks.entries()) {
      const chunkName = `${String(index + 1).padStart(3, '0')}.md`;
      await writeFile(path.join(documentDir, chunkName), `source: docs/portfolio/${fileName}\nchunk: ${index + 1}/${chunks.length}\n\n${chunk}\n`);
    }
  }
}

async function main() {
  const { root, output } = parseArgs(process.argv.slice(2));
  await stageKnowledge(root, output);
  console.log(`Staged chunked Portfolio knowledge in ${output}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
