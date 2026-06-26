import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const gitopsDumpPath = path.join(repoRoot, 'gitops/apps/vintage/k8s/database/vintage_full.sql');
const localDumpPath = path.join(repoRoot, 'app/microservices/database/vintage_full.sql');
const restoreJobPath = path.join(repoRoot, 'gitops/apps/vintage/k8s/database/restore-job.yml');

const expectedProducts = [
  'Prairie Midi Dress',
  'Washed Linen Work Jacket',
  'Indigo Straight Denim',
  'Cotton Lace Night Blouse',
  'Sumi Silk Scarf',
  'Wool Twill Evening Coat',
  'Patchwork Market Tote',
  'Linen Tab Collar Shirt',
];

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function databaseSection(sql, databaseName) {
  const start = sql.indexOf(`-- Database "${databaseName}" dump`);
  assert.notEqual(start, -1, `expected ${databaseName} section`);
  const next = sql.indexOf('\n-- Database "', start + 1);
  return sql.slice(start, next === -1 ? undefined : next);
}

for (const dumpPath of [gitopsDumpPath, localDumpPath]) {
  test(`${path.relative(repoRoot, dumpPath)} contains the Hiraya Furugi products restore data`, () => {
    const sql = readFileSync(dumpPath, 'utf8');
    const productsDb = databaseSection(sql, 'products_db');

    assert.match(productsDb, /COPY public\.products /, 'products_db must restore product rows');
    assert.match(productsDb, /COPY public\.product_images /, 'products_db must restore image rows');
    assert.equal((productsDb.match(/\tHiraya Furugi\t/g) ?? []).length, expectedProducts.length);

    for (const product of expectedProducts) {
      assert.match(productsDb, new RegExp(product.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    }

    assert.match(productsDb, /\/product-images\/prairie-midi-dress\.jpg/);
    assert.match(productsDb, /\/product-images\/placeholder\.jpg|COPY public\.product_images /);
  });

  test(`${path.relative(repoRoot, dumpPath)} keeps legacy vintage_db foreign-key seed rows valid`, () => {
    const sql = readFileSync(dumpPath, 'utf8');
    const vintageDb = databaseSection(sql, 'vintage_db');

    assert.match(vintageDb, /COPY public\.orders /, 'vintage_db order_items need a seeded order parent');
    assert.match(vintageDb, /COPY public\.products /, 'vintage_db order_items need seeded product parents');
    assert.match(vintageDb, /8d46347c-43db-4f01-b6c7-d5d3288f0ecb\tf8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6/);
    assert.match(vintageDb, /67be2d5e-ecfb-4bf9-b751-8474f9d7bcac\tPrairie Midi Dress/);
  });
}

test('GitOps restore job seeds active auth and orders databases after dump restore', () => {
  const restoreJob = read('gitops/apps/vintage/k8s/database/restore-job.yml');

  assert.match(restoreJob, /demo@hirayavintage\.test/);
  assert.match(restoreJob, /INSERT INTO orders \(id, user_id, total_amount/);
  assert.match(restoreJob, /INSERT INTO order_items \(id, order_id, product_id/);
  assert.match(restoreJob, /vintage-postgres/);
});
