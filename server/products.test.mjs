import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import { Pool } from 'pg';
import { MAX_PRODUCTS, saveProduct } from './products.mjs';

test('límite de 200: guardados simultáneos, edición y plaza liberada', { skip: !process.env.TEST_DATABASE_URL }, async () => {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!['127.0.0.1', 'localhost'].includes(new URL(connectionString).hostname)) throw new Error('Usa una base local aislada para esta prueba');
  const schema = `limit_test_${randomUUID().replaceAll('-', '')}`;
  const setup = new Pool({ connectionString });
  const db = new Pool({ connectionString, options: `-c search_path=${schema}`, max: 3 });
  try {
    await setup.query(`CREATE SCHEMA ${schema}`);
    await db.query('CREATE TABLE catalog_products (id text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())');
    await db.query("INSERT INTO catalog_products (id, data) SELECT 'test-' || n, '{}'::jsonb FROM generate_series(1, $1) AS n", [MAX_PRODUCTS - 1]);
    const results = await Promise.allSettled([saveProduct(db, { id: 'first' }), saveProduct(db, { id: 'second' })]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.find(result => result.status === 'rejected').reason.status, 409);
    assert.equal((await db.query('SELECT count(*)::int AS total FROM catalog_products')).rows[0].total, 200);
    await saveProduct(db, { id: 'test-1', name: 'Editado al alcanzar el límite' });
    assert.equal((await db.query("SELECT data->>'name' AS name FROM catalog_products WHERE id = 'test-1'")).rows[0].name, 'Editado al alcanzar el límite');
    await db.query("DELETE FROM catalog_products WHERE id = 'test-2'");
    await saveProduct(db, { id: 'replacement' });
    assert.equal((await db.query('SELECT count(*)::int AS total FROM catalog_products')).rows[0].total, 200);
  } finally {
    await db.end();
    await setup.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await setup.end();
  }
});
