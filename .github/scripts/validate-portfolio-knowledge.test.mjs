import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'dist/validate-portfolio-knowledge.mjs',
);

const requiredFiles = [
  ['PROJECT_BRIEF.md', 'project_brief'],
  ['ARCHITECTURE.md', 'architecture'],
  ['CICD.md', 'cicd'],
  ['SECURITY_GATES.md', 'security_gates'],
  ['TEAM_ROLES.md', 'team_roles'],
  ['DECISIONS.md', 'decisions'],
];

async function createKnowledgeFixture(overrides = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'hiraya-portfolio-knowledge-'));
  const docsDir = path.join(root, 'docs/portfolio');
  await mkdir(docsDir, { recursive: true });

  for (const [fileName, category] of requiredFiles) {
    const override = overrides[fileName];
    if (override === null) {
      continue;
    }

    const content = override ?? `---\ntitle: ${fileName.replace('.md', '').replaceAll('_', ' ')}\naudience: portfolio_visitor\ncategory: ${category}\nlast_reviewed: 2026-06-27\n---\n\n# ${fileName.replace('.md', '').replaceAll('_', ' ')}\n\nVisitor-facing content.\n`;
    await writeFile(path.join(docsDir, fileName), content);
  }

  return root;
}

function validate(root) {
  return spawnSync(process.execPath, [scriptPath, '--root', root], {
    encoding: 'utf8',
  });
}

test('validates the complete Curated Project Knowledge starter pack', async () => {
  const root = await createKnowledgeFixture();

  const result = validate(root);

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Validated 6 curated knowledge documents/);
});

test('fails when a required starter document is missing', async () => {
  const root = await createKnowledgeFixture({ 'TEAM_ROLES.md': null });

  const result = validate(root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /docs\/portfolio\/TEAM_ROLES\.md is required/);
});

test('fails when frontmatter or Markdown body content is invalid', async () => {
  const root = await createKnowledgeFixture({
    'SECURITY_GATES.md': '---\ntitle: Security Gates\naudience: operator\ncategory: security_gates\nlast_reviewed: 2026-06-27\n---\n\n',
  });

  const result = validate(root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SECURITY_GATES\.md: audience must be portfolio_visitor/);
  assert.match(result.stderr, /SECURITY_GATES\.md: body must contain non-empty Markdown content/);
});

test('fails when Markdown body only contains HTML comments', async () => {
  const root = await createKnowledgeFixture({
    'DECISIONS.md': '---\ntitle: Decisions\naudience: portfolio_visitor\ncategory: decisions\nlast_reviewed: 2026-06-27\n---\n\n<!--\nComment-only draft is not meaningful portfolio knowledge.\n-->\n',
  });

  const result = validate(root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /DECISIONS\.md: body must contain non-empty Markdown content/);
});

test('fails Markdown lint for skipped heading levels and trailing whitespace', async () => {
  const root = await createKnowledgeFixture({
    'CICD.md': '---\ntitle: CI/CD Workflow\naudience: portfolio_visitor\ncategory: cicd\nlast_reviewed: 2026-06-27\n---\n\n# CI/CD Workflow  \n\n### Deploys\n\nContent.\n',
  });

  const result = validate(root);

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /CICD\.md: line 8 has trailing whitespace/);
  assert.match(result.stderr, /CICD\.md: heading levels must increment by one/);
});
