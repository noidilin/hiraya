#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import type { Readable } from 'node:stream';

interface CliOptions {
  catalogPath: string;
  root: string;
  filesFrom?: string;
  base: string;
  head: string;
  all: boolean;
  githubOutput?: string;
  changedFiles: string[];
}

interface ServiceCatalog {
  services: Service[];
}

interface Service {
  name: string;
  packageName: string;
  workspace: string;
  image: {
    repository: string;
  };
  build: {
    context: string;
    dockerfile: string;
  };
  manifest: {
    path: string;
  };
  pathOwnership?: string[];
  vintageStorefrontBaseline: {
    critical: boolean;
  };
}

interface MatrixEntry {
  service: string;
  package_name: string;
  workspace: string;
  repository: string;
  build_context: string;
  dockerfile: string;
  manifest: string;
  critical: boolean;
}

interface ServiceMatrix {
  include: MatrixEntry[];
}

function usage(): string {
  return `Usage: detect-changed-services.mjs [options] [changed-file...]

Options:
  --catalog <path>       Service catalog JSON path (default: .github/utils/services.json)
  --root <path>          Repository root (default: current directory)
  --files-from <path|->  Read changed file paths from a newline-delimited file or stdin
  --base <ref>           Base git ref for derived changes (default: origin/main)
  --head <ref>           Head git ref for derived changes (default: HEAD)
  --all                  Select every service in the catalog
  --github-output <path> Also write matrix, services, and has_changes outputs
`;
}

function parseArgs(argv: string[]): CliOptions {
  const args = [...argv];
  const changedFiles: string[] = [];
  const options: Omit<CliOptions, 'changedFiles'> = {
    catalogPath: '.github/utils/services.json',
    root: process.cwd(),
    filesFrom: undefined,
    base: 'origin/main',
    head: 'HEAD',
    all: false,
    githubOutput: process.env.GITHUB_OUTPUT,
  };

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === '--catalog') {
      options.catalogPath = requireValue(arg, args.shift());
    } else if (arg === '--root') {
      options.root = requireValue(arg, args.shift());
    } else if (arg === '--files-from') {
      options.filesFrom = requireValue(arg, args.shift());
    } else if (arg === '--base') {
      options.base = requireValue(arg, args.shift());
    } else if (arg === '--head') {
      options.head = requireValue(arg, args.shift());
    } else if (arg === '--github-output') {
      options.githubOutput = requireValue(arg, args.shift());
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg === '--') {
      continue;
    } else if (arg === '--help' || arg === '-h') {
      console.log(usage());
      process.exit(0);
    } else if (arg?.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}\n${usage()}`);
    } else if (arg) {
      changedFiles.push(arg);
    }
  }

  return {
    ...options,
    root: path.resolve(options.root),
    catalogPath: path.resolve(options.catalogPath),
    changedFiles,
  };
}

function requireValue(option: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${option} requires a value\n${usage()}`);
  }
  return value;
}

async function changedFilesFrom(options: CliOptions): Promise<string[] | undefined> {
  if (options.all) {
    return undefined;
  }

  const explicitFiles = [
    ...options.changedFiles,
    ...await readFilesFromOption(options.filesFrom),
  ];

  if (explicitFiles.length > 0 || options.filesFrom) {
    return normalizeChangedFiles(explicitFiles, options.root);
  }

  return deriveChangedFiles(options);
}

async function readFilesFromOption(filesFrom: string | undefined): Promise<string[]> {
  if (!filesFrom) {
    return [];
  }
  const content = filesFrom === '-'
    ? await readStream(process.stdin)
    : await readFile(filesFrom, 'utf8');
  return content.split(/\r?\n/);
}

async function readStream(stream: Readable): Promise<string> {
  let content = '';
  stream.setEncoding('utf8');
  for await (const chunk of stream) {
    content += String(chunk);
  }
  return content;
}

function deriveChangedFiles(options: CliOptions): string[] {
  const ranges = [
    `${options.base}...${options.head}`,
    `${options.base}..${options.head}`,
    'HEAD~1..HEAD',
  ];

  for (const range of ranges) {
    const result = spawnSync('git', ['diff', '--name-only', range], {
      cwd: options.root,
      encoding: 'utf8',
    });
    if (result.status === 0) {
      return normalizeChangedFiles(result.stdout.split(/\r?\n/), options.root);
    }
  }

  throw new Error(`Unable to derive changed files with git diff. Pass changed files or --files-from.\n${usage()}`);
}

function normalizeChangedFiles(files: string[], root: string): string[] {
  return [...new Set(files
    .map((file) => file.trim())
    .filter(Boolean)
    .map((file) => normalizePath(path.isAbsolute(file) ? path.relative(root, file) : file))
    .filter((file) => file !== '' && !file.startsWith('..')),
  )];
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/').replace(/^\.\//, '');
}

function isGlobalChange(file: string, catalogPath: string, root: string): boolean {
  const catalogRelativePath = normalizePath(path.relative(root, catalogPath));
  return file === catalogRelativePath
    || file === '.github/utils/services.json'
    || file.startsWith('.github/scripts/')
    || file.startsWith('.github/workflows/');
}

function serviceToMatrixEntry(service: Service): MatrixEntry {
  return {
    service: service.name,
    package_name: service.packageName,
    workspace: service.workspace,
    repository: service.image.repository,
    build_context: service.build.context,
    dockerfile: service.build.dockerfile,
    manifest: service.manifest.path,
    critical: service.vintageStorefrontBaseline.critical,
  };
}

function globMatches(pattern: string, file: string): boolean {
  const normalizedPattern = normalizePath(pattern);
  const normalizedFile = normalizePath(file);

  assertSupportedGlobSyntax(normalizedPattern);

  if (normalizedPattern.endsWith('/**')) {
    const base = normalizedPattern.slice(0, -3);
    return normalizedFile === base || normalizedFile.startsWith(`${base}/`);
  }

  if (!/[\*\?]/.test(normalizedPattern)) {
    return normalizedFile === normalizedPattern;
  }

  const regex = new RegExp(`^${globToRegexSource(normalizedPattern)}$`);
  return regex.test(normalizedFile);
}

function assertSupportedGlobSyntax(pattern: string): void {
  if (pattern.includes('[')) {
    throw new Error(`Unsupported character class glob syntax in pathOwnership pattern: ${pattern}`);
  }
  if (pattern.includes('{')) {
    throw new Error(`Unsupported brace glob syntax in pathOwnership pattern: ${pattern}`);
  }
}

function globToRegexSource(pattern: string): string {
  let source = '';
  for (let index = 0; index < pattern.length; index += 1) {
    const char = pattern[index];
    const nextChar = pattern[index + 1];
    if (char === '*' && nextChar === '*') {
      source += '.*';
      index += 1;
    } else if (char === '*') {
      source += '[^/]*';
    } else if (char === '?') {
      source += '[^/]';
    } else {
      source += char.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
    }
  }
  return source;
}

function selectServices(catalog: ServiceCatalog, changedFiles: string[] | undefined, options: CliOptions): Service[] {
  if (options.all || changedFiles === undefined) {
    return catalog.services;
  }

  if (changedFiles.some((file) => isGlobalChange(file, options.catalogPath, options.root))) {
    return catalog.services;
  }

  const selected = new Set<string>();
  for (const file of changedFiles) {
    for (const service of catalog.services) {
      if (service.pathOwnership?.some((pattern) => globMatches(pattern, file))) {
        selected.add(service.name);
      }
    }
  }

  return catalog.services.filter((service) => selected.has(service.name));
}

async function writeGithubOutput(outputPath: string | undefined, matrix: ServiceMatrix, services: string[]): Promise<void> {
  if (!outputPath) {
    return;
  }

  const lines = [
    `matrix=${JSON.stringify(matrix)}`,
    `services=${JSON.stringify(services)}`,
    `has_changes=${services.length > 0 ? 'true' : 'false'}`,
  ];
  await writeFile(outputPath, `${lines.join('\n')}\n`, { flag: 'a' });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(await readFile(options.catalogPath, 'utf8')) as ServiceCatalog;
  const changedFiles = await changedFilesFrom(options);
  const services = selectServices(catalog, changedFiles, options);
  const matrix = { include: services.map(serviceToMatrixEntry) };

  await writeGithubOutput(options.githubOutput, matrix, services.map((service) => service.name));
  console.log(JSON.stringify(matrix));
}

main().catch((error: unknown) => {
  console.error(error instanceof SyntaxError ? `Invalid JSON: ${error.message}` : error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
