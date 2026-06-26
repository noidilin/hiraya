import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const requiredDocuments = [
  { fileName: 'PROJECT_BRIEF.md', category: 'project_brief' },
  { fileName: 'ARCHITECTURE.md', category: 'architecture' },
  { fileName: 'CICD.md', category: 'cicd' },
  { fileName: 'SECURITY_GATES.md', category: 'security_gates' },
  { fileName: 'TEAM_ROLES.md', category: 'team_roles' },
  { fileName: 'DECISIONS.md', category: 'decisions' },
] as const;

const allowedCategories = new Set(requiredDocuments.map((document) => document.category));

type Frontmatter = Record<string, string>;

function parseArgs(argv: string[]): { root: string } {
  let root = process.cwd();

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--root requires a value');
      }
      root = value;
      index += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      console.log('Usage: validate-portfolio-knowledge.mjs [--root <repo-root>]');
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { root: path.resolve(root) };
}

function parseFrontmatter(fileName: string, content: string, errors: string[]): { frontmatter?: Frontmatter; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    errors.push(`${fileName}: frontmatter block is required`);
    return { body: content };
  }

  const frontmatter: Frontmatter = {};
  const frontmatterBody = match[1] ?? '';
  for (const [lineIndex, line] of frontmatterBody.split(/\r?\n/).entries()) {
    if (line.trim() === '') {
      continue;
    }

    const keyValue = line.match(/^([A-Za-z0-9_-]+):\s*(.+)$/);
    if (!keyValue) {
      errors.push(`${fileName}: invalid frontmatter line ${lineIndex + 2}`);
      continue;
    }

    const [, key, value] = keyValue;
    if (key && value) {
      frontmatter[key] = value.trim().replace(/^['"]|['"]$/g, '');
    }
  }

  return { frontmatter, body: match[2] ?? '' };
}

function validateFrontmatter(fileName: string, expectedCategory: string, frontmatter: Frontmatter | undefined, errors: string[]): void {
  if (!frontmatter) {
    return;
  }

  for (const key of ['title', 'audience', 'category', 'last_reviewed']) {
    if (!frontmatter[key]) {
      errors.push(`${fileName}: ${key} is required`);
    }
  }

  if (frontmatter.audience && frontmatter.audience !== 'portfolio_visitor') {
    errors.push(`${fileName}: audience must be portfolio_visitor`);
  }

  if (frontmatter.category && !allowedCategories.has(frontmatter.category as typeof requiredDocuments[number]['category'])) {
    errors.push(`${fileName}: category must be one of ${Array.from(allowedCategories).join(', ')}`);
  }

  if (frontmatter.category && frontmatter.category !== expectedCategory) {
    errors.push(`${fileName}: category must be ${expectedCategory}`);
  }

  if (frontmatter.last_reviewed && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.last_reviewed)) {
    errors.push(`${fileName}: last_reviewed must use YYYY-MM-DD`);
  }
}

function validateMarkdown(fileName: string, body: string, content: string, errors: string[]): void {
  const meaningfulBody = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('<!--') && !line.startsWith('-->'));

  if (meaningfulBody.length === 0) {
    errors.push(`${fileName}: body must contain non-empty Markdown content`);
  }

  let previousHeadingLevel = 0;
  content.split(/\r?\n/).forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1;
    if (/[ \t]$/.test(line)) {
      errors.push(`${fileName}: line ${lineNumber} has trailing whitespace`);
    }

    const heading = line.match(/^(#{1,6})\s+\S/);
    if (heading) {
      const level = heading[1]?.length ?? 0;
      if (previousHeadingLevel > 0 && level > previousHeadingLevel + 1) {
        errors.push(`${fileName}: heading levels must increment by one`);
      }
      previousHeadingLevel = level;
    }
  });
}

async function validate(root: string): Promise<string[]> {
  const errors: string[] = [];
  const docsDir = path.join(root, 'docs/portfolio');

  for (const document of requiredDocuments) {
    const relativePath = `docs/portfolio/${document.fileName}`;
    const absolutePath = path.join(docsDir, document.fileName);

    if (!existsSync(absolutePath)) {
      errors.push(`${relativePath} is required`);
      continue;
    }

    const content = await readFile(absolutePath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(document.fileName, content, errors);
    validateFrontmatter(document.fileName, document.category, frontmatter, errors);
    validateMarkdown(document.fileName, body, content, errors);
  }

  return errors;
}

async function main(): Promise<void> {
  try {
    const { root } = parseArgs(process.argv.slice(2));
    const errors = await validate(root);

    if (errors.length > 0) {
      console.error(errors.join('\n'));
      process.exitCode = 1;
      return;
    }

    console.log(`Validated ${requiredDocuments.length} curated knowledge documents in docs/portfolio`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

await main();
