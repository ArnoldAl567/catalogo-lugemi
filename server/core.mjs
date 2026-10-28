import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { Pool } from 'pg';
import seedProducts from './seed-products.json' with { type: 'json' };

let pool;
let initialized;
const cookieName = 'lugemi_admin';
const categoryIds = ['polos-nino', 'polos-nina', 'sudaderas-nino', 'pantalones-nino', 'casacas-nina', 'joggers-basicos', 'accesorios', 'ofertas', 'conjuntos', 'short-bermudas'];
const categoryIdSet = new Set(categoryIds);
const defaultCategoryLabels = {
  'polos-nino': 'Polos Niño', 'polos-nina': 'Polos Niña', 'sudaderas-nino': 'Sudaderas Niño',
  'pantalones-nino': 'Pantalones Niño', 'casacas-nina': 'Casacas Niña',
  'joggers-basicos': 'Joggers y Básicos', accesorios: 'Accesorios', ofertas: 'Ofertas',
  conjuntos: 'Conjuntos', 'short-bermudas': 'Short y Bermudas',
};
export function validCategoryLabels(labels) {
  return labels && typeof labels === 'object' && !Array.isArray(labels) &&
    Object.keys(labels).length === categoryIds.length &&
    categoryIds.every(id => typeof labels[id] === 'string' && labels[id].trim().length > 0 && labels[id].length <= 60);
}
async function categoryLabels() {
  const result = await database().query("SELECT value FROM catalog_meta WHERE key = 'category_labels'");
  if (!result.rowCount) return defaultCategoryLabels;
  try { const labels = JSON.parse(result.rows[0].value); return validCategoryLabels(labels) ? labels : defaultCategoryLabels; }
  catch { return defaultCategoryLabels; }
}
const styleCategoryIds = new Set([...categoryIds, 'oversize', 'raglan']);
const defaultStyleSection = {
  title: 'Explora por estilo', linkLabel: 'Ver todos los polos',
  cards: [
    { label: 'Polos oversize', category: 'oversize', image: '/images/productos/athletic-67-frente.jpeg', alt: 'Polo oversize Athletic 67 marfil, vista frontal' },
    { label: 'Polos raglán', category: 'raglan', image: '/images/productos/lion-frente.jpeg', alt: 'Polo raglán Lion con mangas terracota, vista frontal' },
  ],
};

export function validStyleSection(section) {
  return section && typeof section.title === 'string' && section.title.trim().length > 0 && section.title.length <= 80 &&
    typeof section.linkLabel === 'string' && section.linkLabel.trim().length > 0 && section.linkLabel.length <= 80 &&
    Array.isArray(section.cards) && section.cards.length >= 1 && section.cards.length <= 4 &&
    section.cards.every(card => card && typeof card.label === 'string' && card.label.trim().length > 0 && card.label.length <= 80 &&
      typeof card.alt === 'string' && card.alt.trim().length > 0 && card.alt.length <= 160 &&
      styleCategoryIds.has(card.category) && typeof card.image === 'string' &&
      (/^\/api\/images\/[0-9a-f-]{36}$/i.test(card.image) || /^\/images\/productos\/[a-z0-9-]+\.jpeg$/.test(card.image)));
}

async function styleSection() {
  const result = await database().query("SELECT value FROM catalog_meta WHERE key = 'style_section'");
  if (!result.rowCount) return defaultStyleSection;
  try { const section = JSON.parse(result.rows[0].value); return validStyleSection(section) ? section : defaultStyleSection; }
  catch { return defaultStyleSection; }
}

async function enabledCategories() {
  const result = await database().query("SELECT value FROM catalog_meta WHERE key = 'enabled_categories'");
  if (!result.rowCount) return categoryIds;
  try {
    const ids = JSON.parse(result.rows[0].value);
    return Array.isArray(ids) ? categoryIds.filter(id => ids.includes(id)) : categoryIds;
  } catch { return categoryIds; }
}

function database() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no configurada');
  const connection = new URL(process.env.DATABASE_URL);
  if (connection.searchParams.get('sslmode') === 'require') connection.searchParams.set('sslmode', 'verify-full');
  return pool ??= new Pool({ connectionString: connection.toString(), max: 3 });
}

async function ready() {
  if (!initialized) initialized = (async () => {
    const db = database();
    await db.query('CREATE TABLE IF NOT EXISTS catalog_products (id text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())');
    await db.query('CREATE TABLE IF NOT EXISTS catalog_images (id uuid PRIMARY KEY, mime_type text NOT NULL, content bytea NOT NULL, created_at timestamptz NOT NULL DEFAULT now())');
    await db.query('CREATE TABLE IF NOT EXISTS catalog_meta (key text PRIMARY KEY, value text NOT NULL)');
    await db.query('CREATE TABLE IF NOT EXISTS admin_login_attempts (client_key text PRIMARY KEY, attempts integer NOT NULL, first_attempt timestamptz NOT NULL)');
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      const marker = await client.query("SELECT value FROM catalog_meta WHERE key = 'seeded' FOR UPDATE");
      if (!marker.rowCount) {
        for (const product of seedProducts) await client.query('INSERT INTO catalog_products (id, data) VALUES ($1, $2) ON CONFLICT DO NOTHING', [product.id, product]);
        await client.query("INSERT INTO catalog_meta (key, value) VALUES ('seeded', '1') ON CONFLICT DO NOTHING");
      }
      await client.query('COMMIT');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  })().catch(error => { initialized = undefined; throw error; });
  await initialized;
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(data));
}

async function body(req, limit = 3_000_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) { const error = new Error('El archivo es demasiado grande'); error.status = 413; throw error; }
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { const error = new Error('Datos no válidos'); error.status = 400; throw error; }
}

function sign(value) { return createHmac('sha256', process.env.SESSION_SECRET ?? '').update(value).digest('hex'); }
async function passwordHash() {
  const result = await database().query("SELECT value FROM catalog_meta WHERE key = 'admin_password_hash'");
  return result.rows[0]?.value ?? process.env.ADMIN_PASSWORD_HASH ?? '';
}
async function admin(req) {
  if (!process.env.SESSION_SECRET) return false;
  const token = req.headers.cookie?.split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!token) return false;
  const [expiry, signature] = token.split('.');
  if (!expiry || !signature || !/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return false;
  const expected = Buffer.from(sign(`${expiry}:${await passwordHash()}`), 'hex');
  const actual = Buffer.from(signature, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}
function passwordMatches(password, storedHash) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash || typeof password !== 'string' || !password) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
function usernameMatches(username) {
  return typeof username === 'string' && username.trim().toLowerCase() === (process.env.ADMIN_USERNAME?.trim() || 'admin').toLowerCase();
}
async function loginAllowed(req) {
  const key = sign(String(req.headers['x-forwarded-for'] ?? req.socket?.remoteAddress ?? 'unknown').split(',')[0]);
  const result = await database().query('SELECT attempts, first_attempt FROM admin_login_attempts WHERE client_key = $1', [key]);
  if (result.rowCount && result.rows[0].attempts >= 5 && Date.now() - new Date(result.rows[0].first_attempt).getTime() < 15 * 60_000) return { key, allowed: false };
  return { key, allowed: true };
}
async function failedLogin(key) {
  await database().query(`INSERT INTO admin_login_attempts (client_key, attempts, first_attempt) VALUES ($1, 1, now())
    ON CONFLICT (client_key) DO UPDATE SET attempts = CASE WHEN admin_login_attempts.first_attempt < now() - interval '15 minutes' THEN 1 ELSE admin_login_attempts.attempts + 1 END,
    first_attempt = CASE WHEN admin_login_attempts.first_attempt < now() - interval '15 minutes' THEN now() ELSE admin_login_attempts.first_attempt END`, [key]);
}
export function validProduct(p) {
  return p && typeof p.id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id) && p.id.length <= 100 &&
    typeof p.name === 'string' && p.name.trim().length > 0 && p.name.length <= 120 &&
    typeof p.categoryId === 'string' && p.categoryId.length <= 60 &&
    (p.categoryIds === undefined || (Array.isArray(p.categoryIds) && p.categoryIds.length > 0 && p.categoryIds.length <= categoryIds.length && new Set(p.categoryIds).size === p.categoryIds.length && p.categoryIds.every(id => categoryIdSet.has(id)))) &&
    Number.isFinite(p.price) && p.price >= 0 &&
    typeof p.description === 'string' && typeof p.material === 'string' &&
    Array.isArray(p.details) && p.details.every(x => typeof x === 'string') &&
    (p.specifications === undefined || (Array.isArray(p.specifications) && p.specifications.length <= 7 && p.specifications.every(x => x && typeof x.label === 'string' && x.label.trim().length > 0 && x.label.length <= 60 && typeof x.value === 'string' && x.value.trim().length > 0 && x.value.length <= 200))) &&
    Array.isArray(p.images) && p.images.length >= 1 && p.images.length <= 3 && p.images.every(x => x && typeof x.url === 'string' && (/^\/api\/images\/[0-9a-f-]{36}$/i.test(x.url) || /^\/images\/productos\/[a-z0-9-]+\.jpeg$/.test(x.url)) && typeof x.colorId === 'string' && ['full', 'detail', 'extra'].includes(x.view)) &&
    new Set(p.images.map(x => `${x.colorId}:${x.view}`)).size === p.images.length &&
    Array.isArray(p.variants) && p.variants.length > 0 && p.variants.every(x => x && typeof x.colorId === 'string' && typeof x.colorName === 'string' && typeof x.hex === 'string' && typeof x.size === 'string' && Number.isInteger(x.stock) && x.stock >= 0);
}

export async function handle(req, res) {
  try {
    const path = new URL(req.url, 'http://localhost').pathname;
    const method = req.method;
    if (method === 'GET' && path.startsWith('/api/images/')) {
      await ready();
      const id = path.slice('/api/images/'.length);
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json(res, 404, { error: 'Imagen no encontrada' });
      const result = await database().query('SELECT mime_type, content FROM catalog_images WHERE id = $1', [id]);
      if (!result.rowCount) return json(res, 404, { error: 'Imagen no encontrada' });
      res.setHeader('Content-Type', result.rows[0].mime_type);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.end(result.rows[0].content);
      return;
    }
    if (method === 'GET' && path === '/api/products') {
      await ready();
      const result = await database().query('SELECT data FROM catalog_products ORDER BY (data->>\'createdAt\')::bigint DESC, id');
      return json(res, 200, { products: result.rows.map(row => row.data) });
    }
    if (method === 'GET' && path === '/api/categories') {
      await ready();
      return json(res, 200, { enabledIds: await enabledCategories(), labels: await categoryLabels(), styleSection: await styleSection() });
    }
    if (method === 'POST' && path === '/api/admin/login') {
      if (!sameOrigin(req)) return json(res, 403, { error: 'Origen no permitido' });
      await ready();
      const attempt = await loginAllowed(req);
      if (!attempt.allowed) return json(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
      const input = await body(req, 1000);
      const currentHash = await passwordHash();
      const validPassword = passwordMatches(input.password, currentHash);
      if (!usernameMatches(input.username) || !validPassword || !process.env.SESSION_SECRET) { await failedLogin(attempt.key); return json(res, 401, { error: 'Usuario o contraseña incorrectos' }); }
      await database().query('DELETE FROM admin_login_attempts WHERE client_key = $1', [attempt.key]);
      const expiry = String(Date.now() + 12 * 60 * 60 * 1000);
      res.setHeader('Set-Cookie', `${cookieName}=${expiry}.${sign(`${expiry}:${currentHash}`)}; HttpOnly; SameSite=Strict; Path=/api; Max-Age=43200${req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`);
      return json(res, 200, { ok: true });
    }
    if (method === 'GET' && path === '/api/admin/session') {
      const configured = !!process.env.DATABASE_URL && !!process.env.ADMIN_PASSWORD_HASH && !!process.env.SESSION_SECRET;
      if (configured) await ready();
      return json(res, 200, { authenticated: configured && await admin(req), configured });
    }
    if (method === 'POST' && path === '/api/admin/logout') {
      if (!sameOrigin(req)) return json(res, 403, { error: 'Origen no permitido' });
      res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0`);
      return json(res, 200, { ok: true });
    }
    if (path.startsWith('/api/admin/')) {
      await ready();
      if (!await admin(req)) return json(res, 401, { error: 'Inicia sesión para administrar el catálogo' });
      if (!sameOrigin(req)) return json(res, 403, { error: 'Origen no permitido' });
      if (method === 'POST' && path === '/api/admin/change-password') {
        const attempt = await loginAllowed(req);
        if (!attempt.allowed) return json(res, 429, { error: 'Demasiados intentos. Espera 15 minutos.' });
        const input = await body(req, 1000);
        const currentHash = await passwordHash();
        if (!passwordMatches(input.currentPassword, currentHash)) {
          await failedLogin(attempt.key);
          return json(res, 401, { error: 'La contraseña actual no es correcta' });
        }
        if (typeof input.newPassword !== 'string' || input.newPassword.length < 12 || input.newPassword.length > 128)
          return json(res, 400, { error: 'La nueva contraseña debe tener entre 12 y 128 caracteres' });
        if (passwordMatches(input.newPassword, currentHash))
          return json(res, 400, { error: 'Elige una contraseña distinta de la actual' });
        const salt = randomBytes(32).toString('hex');
        const newHash = `${salt}:${scryptSync(input.newPassword, salt, 64).toString('hex')}`;
        const result = await database().query("INSERT INTO catalog_meta (key, value) VALUES ('admin_password_hash', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value WHERE catalog_meta.value = $2", [newHash, currentHash]);
        if (!result.rowCount) return json(res, 409, { error: 'La contraseña cambió. Vuelve a iniciar sesión.' });
        await database().query('DELETE FROM admin_login_attempts WHERE client_key = $1', [attempt.key]);
        res.setHeader('Set-Cookie', `${cookieName}=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0${req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`);
        return json(res, 200, { ok: true });
      }
      if (method === 'POST' && path === '/api/admin/images') {
        const input = await body(req);
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(input.mimeType) || typeof input.base64 !== 'string' || input.base64.length > 2_800_000) return json(res, 400, { error: 'Usa una imagen JPG, PNG o WebP de hasta 2 MB' });
        const bytes = Buffer.from(input.base64, 'base64');
        if (!bytes.length || bytes.length > 2_100_000) return json(res, 400, { error: 'Imagen no válida' });
        const magic = input.mimeType === 'image/jpeg' ? bytes[0] === 0xff && bytes[1] === 0xd8 : input.mimeType === 'image/png' ? bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
        if (!magic) return json(res, 400, { error: 'El archivo no coincide con el formato de imagen' });
        const id = randomUUID();
        await database().query('INSERT INTO catalog_images (id, mime_type, content) VALUES ($1, $2, $3)', [id, input.mimeType, bytes]);
        return json(res, 201, { url: `/api/images/${id}` });
      }
      if (method === 'PUT' && path === '/api/admin/products') {
        const product = await body(req, 50_000);
        if (!validProduct(product)) return json(res, 400, { error: 'Revisa los datos del producto, colores y tallas' });
        await database().query('INSERT INTO catalog_products (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()', [product.id, product]);
        return json(res, 200, { product });
      }
      if (method === 'PUT' && path === '/api/admin/categories') {
        const input = await body(req, 4000);
        if (input.styleSection !== undefined) {
          const section = input.styleSection;
          if (!validStyleSection(section)) return json(res, 400, { error: 'Revisa el título, las imágenes y los enlaces de la sección' });
          await database().query("INSERT INTO catalog_meta (key, value) VALUES ('style_section', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [JSON.stringify(section)]);
          return json(res, 200, { section });
        }
        if (input.categoryLabels !== undefined) {
          if (!validCategoryLabels(input.categoryLabels)) return json(res, 400, { error: 'Completa los diez nombres de categoría (máximo 60 caracteres cada uno)' });
          const labels = Object.fromEntries(categoryIds.map(id => [id, input.categoryLabels[id].trim()]));
          await database().query("INSERT INTO catalog_meta (key, value) VALUES ('category_labels', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [JSON.stringify(labels)]);
          return json(res, 200, { labels });
        }
        const ids = input.enabledIds;
        if (!Array.isArray(ids) || ids.length > categoryIds.length || new Set(ids).size !== ids.length || !ids.every(id => categoryIdSet.has(id))) return json(res, 400, { error: 'Lista de categorías no válida' });
        const enabledIds = categoryIds.filter(id => ids.includes(id));
        await database().query("INSERT INTO catalog_meta (key, value) VALUES ('enabled_categories', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [JSON.stringify(enabledIds)]);
        return json(res, 200, { enabledIds });
      }
      if (method === 'DELETE' && path.startsWith('/api/admin/products/')) {
        const id = decodeURIComponent(path.slice('/api/admin/products/'.length));
        await database().query('DELETE FROM catalog_products WHERE id = $1', [id]);
        return json(res, 200, { ok: true });
      }
    }
    return json(res, 404, { error: 'Ruta no encontrada' });
  } catch (error) {
    console.error('API Lugemi:', error);
    return json(res, error.status ?? 500, { error: error.status ? error.message : 'No se pudo completar la operación' });
  }
}
