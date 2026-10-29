import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { Pool } from 'pg';
import { put } from '@vercel/blob';
import { validImageUrl } from './core.mjs';

// Run locally with Node's --env-file option. Preview first, then add --apply.
const apply = process.argv.includes('--apply');
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no configurada');
const connection = new URL(process.env.DATABASE_URL);
if (connection.searchParams.get('sslmode') === 'require') connection.searchParams.set('sslmode', 'verify-full');
const db = new Pool({ connectionString: connection.toString(), max: 2 });
const optimize = `import sys,io
from PIL import Image,ImageOps
image=ImageOps.exif_transpose(Image.open(io.BytesIO(sys.stdin.buffer.read())))
image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
if image.mode not in ('RGB','RGBA'): image=image.convert('RGBA' if 'transparency' in image.info else 'RGB')
image.save(sys.stdout.buffer,format='WEBP',quality=88,method=6)
`;
try {
  const products = (await db.query('SELECT id, data FROM catalog_products')).rows;
  const styleRow = (await db.query("SELECT value FROM catalog_meta WHERE key = 'style_section'")).rows[0];
  const section = styleRow ? JSON.parse(styleRow.value) : null;
  const urls = new Set(products.flatMap(row => row.data.images.map(image => image.url)));
  for (const card of section?.cards ?? []) urls.add(card.image);
  const replacements = new Map();
  const manifest = [];
  mkdirSync('.test-tmp/optimized-images', { recursive: true });
  for (const url of urls) {
    if (!validImageUrl(url) || !url.startsWith('https://') || url.endsWith('.webp')) continue;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo leer una imagen: ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const converted = spawnSync('python', ['-c', optimize], { input: bytes, maxBuffer: 20_000_000, windowsHide: true });
    if (converted.status !== 0) throw new Error(converted.stderr.toString());
    const optimized = converted.stdout;
    if (!optimized.length || optimized.length >= bytes.length) continue;
    const hash = createHash('sha256').update(optimized).digest('hex').slice(0, 32);
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20)}`;
    const pathname = `catalogo/${id}.webp`;
    writeFileSync(`.test-tmp/optimized-images/${id}.webp`, optimized);
    manifest.push({ oldUrl: url, pathname, before: bytes.length, after: optimized.length });
    if (apply) {
      const blob = await put(pathname, optimized, { access: 'public', contentType: 'image/webp', addRandomSuffix: false, allowOverwrite: true });
      const check = await fetch(blob.url, { method: 'HEAD' });
      if (!check.ok || Number(check.headers.get('content-length')) !== optimized.length) throw new Error('La copia optimizada no se pudo verificar');
      replacements.set(url, blob.url);
    }
  }
  writeFileSync('.test-tmp/image-optimization.json', JSON.stringify({ products, style: styleRow?.value, images: manifest }, null, 2));
  console.log(JSON.stringify({ images: manifest.length, beforeBytes: manifest.reduce((n, item) => n + item.before, 0), afterBytes: manifest.reduce((n, item) => n + item.after, 0), apply }));
  if (apply && replacements.size) {
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const row of products) {
        const data = { ...row.data, images: row.data.images.map(image => ({ ...image, url: replacements.get(image.url) ?? image.url })) };
        const result = await client.query('UPDATE catalog_products SET data = $1::jsonb, updated_at = now() WHERE id = $2 AND data = $3::jsonb', [JSON.stringify(data), row.id, JSON.stringify(row.data)]);
        if (!result.rowCount) throw new Error('Un producto cambió durante la optimización. Vuelve a ejecutar.');
      }
      if (section) {
        section.cards = section.cards.map(card => ({ ...card, image: replacements.get(card.image) ?? card.image }));
        const result = await client.query("UPDATE catalog_meta SET value = $1 WHERE key = 'style_section' AND value = $2", [JSON.stringify(section), styleRow.value]);
        if (!result.rowCount) throw new Error('La sección de estilos cambió durante la optimización.');
      }
      await client.query('COMMIT');
      console.log('Enlaces optimizados publicados en Neon. Originales conservados para recuperación.');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
} finally { await db.end(); }
