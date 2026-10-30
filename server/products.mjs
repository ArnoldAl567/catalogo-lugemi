export const MAX_PRODUCTS = 200;

export async function saveProduct(db, product) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    // Serialize catalogue writes so simultaneous saves cannot exceed the limit.
    await client.query('LOCK TABLE catalog_products IN SHARE ROW EXCLUSIVE MODE');
    const result = await client.query('SELECT count(*)::int AS total, coalesce(bool_or(id = $1), false) AS existing FROM catalog_products', [product.id]);
    if (!result.rows[0].existing && result.rows[0].total >= MAX_PRODUCTS) {
      const error = new Error(`El catálogo admite hasta ${MAX_PRODUCTS} productos. Quita uno antes de agregar otro.`);
      error.status = 409;
      throw error;
    }
    await client.query('INSERT INTO catalog_products (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()', [product.id, product]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK'); throw error; }
  finally { client.release(); }
}
