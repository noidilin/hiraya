#!/usr/bin/env node
import { appendFile, readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

interface CliOptions {
  catalogPath: string;
  root: string;
  base: string;
  head: string;
  author: string;
  headRef: string;
  githubOutput?: string;
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

type PrKind = 'manifest_promotion_only' | 'microservice_related' | 'non_app';

interface Classification {
  prKind: PrKind;
  botManifestPromotionOnly: boolean;
  microserviceRelated: boolean;
  runAppBaseline: boolean;
  runManifestBaseline: boolean;
  selectedServices: Service[];
  changedFiles: string[];
  effectiveChangedFiles: string[];
  reason: string;
}

const appBaselineGlobalImpactPatterns = [
  '.github/actions/setup-node-pnpm/**',
  '.github/workflows/app-pr-baseline.yml',
  '.github/workflows/image-ci.yml',
  '.github/scripts/src/classify-app-pr.mts',
  '.github/scripts/dist/classify-app-pr.mjs',
  '.github/scripts/src/detect-changed-services.mts',
  '.github/scripts/dist/detect-changed-services.mjs',
  '.github/scripts/src/assert-gitops-render.mts',
  '.github/scripts/dist/assert-gitops-render.mjs',
  'gitops/k8s/backend/**',
  'gitops/k8s/frontend/**',
  'gitops/kustomization.yml',
  'gitops/namespace.yml',
  'gitops/secrets.yml',
];

const imageFanoutImpactPatterns = [
  '.github/workflows/app-pr-baseline.yml',
  '.github/workflows/image-ci.yml',
  '.github/scripts/src/classify-app-pr.mts',
  '.github/scripts/dist/classify-app-pr.mjs',
  '.github/scripts/src/detect-changed-services.mts',
  '.github/scripts/dist/detect-changed-services.mjs',
  '.github/scripts/src/assert-gitops-render.mts',
  '.github/scripts/dist/assert-gitops-render.mjs',
];

function usage(): string {
  return `Usage: classify-app-pr.mjs --base <sha> --head <sha> [options]

Options:
  --catalog <path>       Service catalog JSON path (default: .github/utils/services.json)
  --root <path>          Repository root (default: current directory)
  --base <ref>           Pull request base SHA/ref
  --head <ref>           Pull request head SHA/ref
  --author <login>       Pull request author login
  --head-ref <ref>       Pull request head branch name
  --github-output <path> Write GitHub Actions outputs (default: GITHUB_OUTPUT)
`;
}

function parseArgs(argv: string[]): CliOptions {
  const args = [...argv];
  const options: CliOptions = {
    catalogPath: '.github/utils/services.json',
    root: process.cwd(),
    base: process.env.PR_BASE_SHA ?? '',
    head: process.env.PR_HEAD_SHA ?? '',
    author: process.env.PR_AUTHOR ?? '',
    headRef: process.env.PR_HEAD_REF ?? '',
    githubOutput: process.env.GITHUB_OUTPUT,
  };

  while (args.length > 0) {
    const arg = args.shift();
    if (arg === '--catalog') {
      options.catalogPath = requireValue(arg, args.shift());
    } else if (arg === '--root') {
      options.root = requireValue(arg, args.shift());
    } else if (arg === '--base') {
      options.base = requireValue(arg, args.shift());
    } else if (arg === '--head') {
      options.head = requireValue(arg, args.shift());
    } else if (arg === '--author') {
      options.author = requireValue(arg, args.shift());
    } else if (arg === '--head-ref') {
      options.headRef = requireValue(arg, args.shift());
    } else if (arg === '--github-output') {
      options.githubOutput = requireValue(arg, args.shift());
    } else if (arg === '--help' || arg === '-h') {
      console.log(usage());
      process.exit(0);
    } else if (arg?.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}\n${usage()}`);
    } else if (arg) {
      throw new Error(`Unexpected positional argument: ${arg}\n${usage()}`);
    }
  }

  if (!options.base || !options.head) {
    throw new Error(`--base and --head are required\n${usage()}`);
  }

  return {
    ...options,
    root: path.resolve(options.root),
    catalogPath: path.resolve(options.root, options.catalogPath),
  };
}

function requireValue(option: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${option} requires a value\n${usage()}`);
  }
  return value;
}

function gitOutput(root: string, args: string[]): string {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

function changedFiles(options: CliOptions): string[] {
  return normalizeChangedFiles(
    gitOutput(options.root, ['diff', '--name-only', `${options.base}...${options.head}`]).split(/\r?\n/),
    options.root,
  );
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
    throw new Error(`Unsupported character class glob syntax in app baseline impact pattern: ${pattern}`);
  }
  if (pattern.includes('{')) {
    throw new Error(`Unsupported brace glob syntax in app baseline impact pattern: ${pattern}`);
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

function catalogRelativePath(options: CliOptions): string {
  return normalizePath(path.relative(options.root, options.catalogPath));
}

function isCatalogPath(file: string, options: CliOptions): boolean {
  return file === catalogRelativePath(options) || file === '.github/utils/services.json';
}

function appBaselineImpactPatterns(catalog: ServiceCatalog, options: CliOptions): string[] {
  return [
    catalogRelativePath(options),
    ...appBaselineGlobalImpactPatterns,
    ...catalog.services.flatMap((service) => [
      ...(service.pathOwnership ?? []),
      service.build.dockerfile,
      service.manifest.path,
    ]),
  ];
}

function isBotManifestPromotionOnly(files: string[], options: CliOptions): boolean {
  if (options.author !== 'app/hiraya-bot' || options.headRef !== 'ci/update-manifests-dev') {
    return false;
  }
  if (files.length === 0 || files.some((file) => !file.startsWith('gitops/'))) {
    return false;
  }

  const diff = gitOutput(options.root, ['diff', '--unified=0', `${options.base}...${options.head}`, '--', 'gitops']);
  const allowedPrefixes = ['diff --git ', 'index ', '--- ', '+++ ', '@@', '\\ No newline at end of file'];
  for (const line of diff.split(/\r?\n/)) {
    if (!line || allowedPrefixes.some((prefix) => line.startsWith(prefix))) {
      continue;
    }
    if ((line.startsWith('+') || line.startsWith('-')) && line.slice(1).trimStart().startsWith('image: ')) {
      continue;
    }
    return false;
  }
  return true;
}

function findAppBaselineImpactReason(files: string[], catalog: ServiceCatalog, options: CliOptions): string | undefined {
  const patterns = appBaselineImpactPatterns(catalog, options);
  for (const file of files) {
    const matchedPattern = patterns.find((pattern) => globMatches(pattern, file));
    if (matchedPattern) {
      return `${file} matched ${matchedPattern}`;
    }
  }
  return undefined;
}

function selectChangedImageServices(files: string[], catalog: ServiceCatalog, options: CliOptions): Service[] {
  if (files.some((file) => isCatalogPath(file, options) || imageFanoutImpactPatterns.some((pattern) => globMatches(pattern, file)))) {
    return catalog.services;
  }

  const selected = new Set<string>();
  for (const file of files) {
    for (const service of catalog.services) {
      if (service.pathOwnership?.some((pattern) => globMatches(pattern, file))) {
        selected.add(service.name);
      }
    }
  }

  return catalog.services.filter((service) => selected.has(service.name));
}

async function classify(options: CliOptions, catalog: ServiceCatalog): Promise<Classification> {
  const files = changedFiles(options);
  const effectiveFiles = files;
  const botManifestPromotionOnly = isBotManifestPromotionOnly(files, options);

  if (botManifestPromotionOnly) {
    return {
      prKind: 'manifest_promotion_only',
      botManifestPromotionOnly: true,
      microserviceRelated: false,
      runAppBaseline: false,
      runManifestBaseline: true,
      selectedServices: [],
      changedFiles: files,
      effectiveChangedFiles: effectiveFiles,
      reason: 'Hiraya bot manifest promotion branch changed only GitOps image tags',
    };
  }

  const impactReason = findAppBaselineImpactReason(effectiveFiles, catalog, options);
  const microserviceRelated = impactReason !== undefined;
  const selectedServices = microserviceRelated ? selectChangedImageServices(effectiveFiles, catalog, options) : [];

  return {
    prKind: microserviceRelated ? 'microservice_related' : 'non_app',
    botManifestPromotionOnly: false,
    microserviceRelated,
    runAppBaseline: microserviceRelated,
    runManifestBaseline: false,
    selectedServices,
    changedFiles: files,
    effectiveChangedFiles: effectiveFiles,
    reason: impactReason ?? 'No changed file matched app baseline impact paths',
  };
}

async function writeGithubOutput(outputPath: string | undefined, classification: Classification, matrix: ServiceMatrix): Promise<void> {
  if (!outputPath) {
    return;
  }

  const services = classification.selectedServices.map((service) => service.name);
  const lines = [
    `pr_kind=${classification.prKind}`,
    `bot_manifest_promotion_only=${classification.botManifestPromotionOnly ? 'true' : 'false'}`,
    `microservice_related=${classification.microserviceRelated ? 'true' : 'false'}`,
    `run_app_baseline=${classification.runAppBaseline ? 'true' : 'false'}`,
    `run_manifest_baseline=${classification.runManifestBaseline ? 'true' : 'false'}`,
    `matrix=${JSON.stringify(matrix)}`,
    `services=${JSON.stringify(services)}`,
    `has_changes=${services.length > 0 ? 'true' : 'false'}`,
    `has_changed_service_images=${services.length > 0 ? 'true' : 'false'}`,
    `reason=${classification.reason}`,
  ];
  await writeFile(outputPath, `${lines.join('\n')}\n`, { flag: 'a' });
}

async function writeStepSummary(classification: Classification, matrix: ServiceMatrix): Promise<void> {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) {
    return;
  }

  await appendFile(summaryPath, [
    '### PR classification',
    '',
    `PR kind: \`${classification.prKind}\``,
    `Reason: ${classification.reason}`,
    `Bot manifest promotion only: \`${classification.botManifestPromotionOnly}\``,
    `Microservice related: \`${classification.microserviceRelated}\``,
    `Changed service image inputs: \`${classification.selectedServices.map((service) => service.name).join(', ') || 'none'}\``,
    '',
    'Changed files:',
    '',
    '```text',
    ...classification.changedFiles,
    '```',
    '',
    'Effective changed files after ignored app-baseline exceptions:',
    '',
    '```text',
    ...(classification.effectiveChangedFiles.length > 0 ? classification.effectiveChangedFiles : ['<none>']),
    '```',
    '',
    'Changed service image matrix:',
    '',
    '```json',
    JSON.stringify(matrix, null, 2),
    '```',
    '',
  ].join('\n'));
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(await readFile(options.catalogPath, 'utf8')) as ServiceCatalog;
  const classification = await classify(options, catalog);
  const matrix = { include: classification.selectedServices.map(serviceToMatrixEntry) };

  await writeGithubOutput(options.githubOutput, classification, matrix);
  await writeStepSummary(classification, matrix);
  console.log(JSON.stringify({
    pr_kind: classification.prKind,
    bot_manifest_promotion_only: classification.botManifestPromotionOnly,
    microservice_related: classification.microserviceRelated,
    run_app_baseline: classification.runAppBaseline,
    run_manifest_baseline: classification.runManifestBaseline,
    has_changed_service_images: classification.selectedServices.length > 0,
    reason: classification.reason,
    matrix,
  }));
}

main().catch((error: unknown) => {
  console.error(error instanceof SyntaxError ? `Invalid JSON: ${error.message}` : error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
