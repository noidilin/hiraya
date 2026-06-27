import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFile, mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { describe, it } from 'node:test'
const packageDir = process.cwd()
const artifactPath = path.join(packageDir, 'build/guide-api/handler.js')
const zipPath = path.join(packageDir, 'build/guide-api.zip')

describe('Guide API Lambda package artifact', () => {
  it('packages a Lambda-ready CommonJS handler zip without runtime metadata dependencies', async () => {
    const result = spawnSync('pnpm', ['--filter', '@hiraya/portfolio-guide-api', 'package'], {
      cwd: path.resolve(packageDir, '../../..'),
      encoding: 'utf8',
    })

    assert.equal(result.status, 0, result.stderr)

    const bundle = await readFile(artifactPath, 'utf8')
    assert.match(bundle, /node_modules.*@aws-sdk/, 'AWS SDK v3 dependencies should be bundled into the artifact')
    assert.doesNotMatch(bundle, /require\(["']\.\/package\.json/, 'artifact should not require package metadata')

    const lambdaRoot = await mkdtemp(path.join(tmpdir(), 'hiraya-guide-lambda-'))
    const lambdaHandler = path.join(lambdaRoot, 'handler.js')
    await copyFile(artifactPath, lambdaHandler)
    const lambdaRequire = createRequire(path.join(lambdaRoot, 'runtime.cjs'))
    const loaded = lambdaRequire(lambdaHandler) as { handler?: unknown }
    assert.equal(typeof loaded.handler, 'function')

    const zipList = spawnSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' })
    assert.equal(zipList.status, 0, zipList.stderr)
    assert.deepEqual(zipList.stdout.trim().split(/\r?\n/), ['handler.js'])
  })
})
