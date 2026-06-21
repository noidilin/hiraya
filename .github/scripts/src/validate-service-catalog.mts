#!/usr/bin/env node
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_STRING_FIELDS = [
  'name',
  'packageName',
  'workspace',
  'image.repository',
  'build.context',
  'build.dockerfile',
  'manifest.path',
] as const;

const REQUIRED_BOOLEAN_FIELDS = [
  'vintageStorefrontBaseline.active',
  'vintageStorefrontBaseline.critical',
] as const;

const PATH_FIELDS = [
  'workspace',
  'build.context',
  'build.dockerfile',
  'manifest.path',
] as const;

interface CliOptions {
  catalogPath: string;
  root: string;
}

interface ServiceCatalog {
  services: unknown[];
}

function usage(): string {
  return 'Usage: validate-service-catalog.mjs [catalog-path] [--root repo-root]';
}

function parseArgs(argv: string[]): CliOptions {
  const args = [...argv];
  let catalogPath: string | undefined;
  let root = process.cwd();

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
    if (arg?.startsWith('--')) {
      throw new Error(`Unknown option: ${arg}\n${usage()}`);
    }
    if (catalogPath) {
      throw new Error(`Unexpected argument: ${arg}\n${usage()}`);
    }
    catalogPath = arg;
  }

  return {
    catalogPath: path.resolve(catalogPath ?? '.github/utils/services.json'),
    root: path.resolve(root),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readField(object: unknown, dottedPath: string): unknown {
  return dottedPath.split('.').reduce<unknown>((value, part) => {
    if (!isRecord(value)) {
      return undefined;
    }
    return value[part];
  }, object);
}

function validateShape(catalog: unknown): string[] {
  const errors: string[] = [];

  if (!isRecord(catalog)) {
    return ['catalog must be a JSON object'];
  }

  if (!Array.isArray(catalog.services)) {
    return ['services must be an array'];
  }

  const names = new Set<string>();
  const repositories = new Set<string>();
  for (const [index, service] of catalog.services.entries()) {
    const prefix = `services[${index}]`;
    if (!isRecord(service)) {
      errors.push(`${prefix} must be an object`);
      continue;
    }

    for (const field of REQUIRED_STRING_FIELDS) {
      const value = readField(service, field);
      if (typeof value !== 'string' || value.trim() === '') {
        errors.push(`${prefix}.${field} is required`);
      }
    }

    for (const field of REQUIRED_BOOLEAN_FIELDS) {
      if (typeof readField(service, field) !== 'boolean') {
        errors.push(`${prefix}.${field} is required`);
      }
    }

    if (!Array.isArray(service.pathOwnership) || service.pathOwnership.length === 0) {
      errors.push(`${prefix}.pathOwnership must include at least one owned path glob`);
    } else {
      service.pathOwnership.forEach((ownedPath, ownedPathIndex) => {
        if (typeof ownedPath !== 'string' || ownedPath.trim() === '') {
          errors.push(`${prefix}.pathOwnership[${ownedPathIndex}] must be a non-empty string`);
        }
      });
    }

    if (typeof service.name === 'string' && service.name.trim() !== '') {
      if (names.has(service.name)) {
        errors.push(`${prefix}.name must be unique (${service.name})`);
      }
      names.add(service.name);
    }

    const repository = readField(service, 'image.repository');
    if (typeof repository === 'string' && repository.trim() !== '') {
      if (repositories.has(repository)) {
        errors.push(`${prefix}.image.repository must be unique (${repository})`);
      }
      repositories.add(repository);
    }
  }

  return errors;
}

async function pathExists(root: string, relativePath: string): Promise<boolean> {
  if (path.isAbsolute(relativePath)) {
    return false;
  }

  const rootPath = path.resolve(root);
  const resolvedPath = path.resolve(rootPath, relativePath);
  const relativeFromRoot = path.relative(rootPath, resolvedPath);
  if (relativeFromRoot === '..' || relativeFromRoot.startsWith(`..${path.sep}`) || path.isAbsolute(relativeFromRoot)) {
    return false;
  }

  try {
    await access(resolvedPath);
    return true;
  } catch {
    return false;
  }
}

function globBase(pattern: string): string {
  const firstGlobIndex = pattern.search(/[\*\?\[\{]/);
  const rawBase = firstGlobIndex === -1 ? pattern : pattern.slice(0, firstGlobIndex);
  const trimmedBase = rawBase.replace(/[/\\]+$/, '');
  return trimmedBase === '' ? '.' : trimmedBase;
}

async function validatePaths(catalog: ServiceCatalog, root: string): Promise<string[]> {
  const errors: string[] = [];

  for (const [index, service] of catalog.services.entries()) {
    for (const field of PATH_FIELDS) {
      const value = readField(service, field);
      if (typeof value !== 'string' || value.trim() === '') {
        continue;
      }
      if (!(await pathExists(root, value))) {
        errors.push(`services[${index}].${field} path does not exist: ${value}`);
      }
    }

    const pathOwnership = readField(service, 'pathOwnership');
    if (Array.isArray(pathOwnership)) {
      for (const [ownedPathIndex, ownedPath] of pathOwnership.entries()) {
        if (typeof ownedPath !== 'string' || ownedPath.trim() === '') {
          continue;
        }
        const base = globBase(ownedPath);
        if (!(await pathExists(root, base))) {
          errors.push(`services[${index}].pathOwnership[${ownedPathIndex}] base path does not exist: ${base}`);
        }
      }
    }
  }

  return errors;
}

function isCatalog(value: unknown): value is ServiceCatalog {
  return isRecord(value) && Array.isArray(value.services);
}

async function main(): Promise<void> {
  const { catalogPath, root } = parseArgs(process.argv.slice(2));
  const catalog = JSON.parse(await readFile(catalogPath, 'utf8')) as unknown;
  const shapeErrors = validateShape(catalog);
  const errors = [
    ...shapeErrors,
    ...isCatalog(catalog) ? await validatePaths(catalog, root) : [],
  ];

  if (errors.length > 0) {
    console.error(`Service catalog validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  if (!isCatalog(catalog)) {
    throw new Error('services must be an array');
  }

  console.log(`Validated ${catalog.services.length} service${catalog.services.length === 1 ? '' : 's'} in ${path.relative(root, catalogPath) || catalogPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof SyntaxError ? `Invalid JSON: ${error.message}` : error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
