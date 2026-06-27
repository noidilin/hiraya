#!/usr/bin/env node
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const packageDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const buildDir = path.join(packageDir, 'build');
const artifactDir = path.join(buildDir, 'guide-api');
const zipPath = path.join(buildDir, 'guide-api.zip');

await rm(buildDir, { recursive: true, force: true });
await mkdir(artifactDir, { recursive: true });

await build({
  entryPoints: [path.join(packageDir, 'src/handler.ts')],
  bundle: true,
  platform: 'node',
  target: 'node24',
  format: 'cjs',
  outfile: path.join(artifactDir, 'handler.js'),
  sourcemap: false,
  minify: false,
  packages: 'bundle',
  logLevel: 'info',
});
await writeFile(path.join(artifactDir, 'package.json'), '{"type":"commonjs"}\n');

await zipHandler(artifactDir, zipPath);
console.log(`Wrote ${zipPath}`);

function zipHandler(cwd, output) {
  return new Promise((resolve, reject) => {
    const child = spawn('zip', ['-q', '-r', output, 'handler.js'], { cwd, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.setEncoding('utf8').on('data', (chunk) => {
      stderr += chunk;
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`zip failed with exit code ${code}: ${stderr}`));
      }
    });
  });
}
