import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const origin = 'http://127.0.0.1:4302';
const localSettings = readFileSync('.env.local', 'utf8').split(/\r?\n/);
const configuredUrl = localSettings.find(line => line.startsWith('DATABASE_URL='))?.slice('DATABASE_URL='.length).replace(/^"|"$/g, '');
const username = localSettings.find(line => line.startsWith('ADMIN_USERNAME='))?.slice('ADMIN_USERNAME='.length).replace(/^"|"$/g, '') || 'admin';
if (!configuredUrl || !['127.0.0.1', 'localhost'].includes(new URL(configuredUrl).hostname)) throw new Error('La prueba requiere una base PostgreSQL local aislada.');
const password = readFileSync('.admin-credentials', 'utf8').trim();
const request = (path, options = {}) => fetch(origin + path, options);
const catalog = await (await request('/api/products')).json();
assert.equal(catalog.products.length, 8);
const badLogin = await request('/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: 'wrong' }) });
assert.equal(badLogin.status, 401);
const badUser = await request('/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ username: `${username}-wrong`, password }) });
assert.equal(badUser.status, 401);
const login = await request('/api/admin/login', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
assert.equal(login.status, 200);
const cookie = login.headers.get('set-cookie').split(';')[0];
const authHeaders = { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' };
const image = await request('/api/admin/images', { method: 'POST', headers: authHeaders, body: JSON.stringify({ mimeType: 'image/png', base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/uXcAAAAASUVORK5CYII=' }) });
assert.equal(image.status, 201);
const { url } = await image.json();
assert.equal((await request(url)).status, 200);
const id = 'prueba-integracion-admin';
const product = { ...catalog.products[0], id, name: 'Prueba de administración', images: [{ url, alt: 'Prueba', colorId: 'marfil', view: 'full' }] };
try {
  const save = await request('/api/admin/products', { method: 'PUT', headers: authHeaders, body: JSON.stringify(product) });
  assert.equal(save.status, 200);
  const updated = await (await request('/api/products')).json();
  assert.ok(updated.products.some(item => item.id === id));
} finally {
  const remove = await request('/api/admin/products/' + id, { method: 'DELETE', headers: authHeaders });
  assert.equal(remove.status, 200);
}
const final = await (await request('/api/products')).json();
assert.equal(final.products.length, 8);
console.log('API PostgreSQL: lectura, acceso, imagen, publicación y eliminación correctos.');
