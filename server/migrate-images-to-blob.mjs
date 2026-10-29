import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { put } from '@vercel/blob';

const envPath = process.argv.find(argument => argument.startsWith('--env-file='))?.slice('--env-file='.length) ?? '.env.local';
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      const value = match[2].trim();
      process.env[match[1]] = value.startsWith('"') && value.endsWith('"') ? value.slice(1, -1) : value;
    }
  }
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no configurada');
const apply = process.argv.includes('--apply');
if (apply && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN no configurado');
const connection = new URL(process.env.DATABASE_URL);
if (connection.searchParams.get('sslmode') === 'require') connection.searchParams.set('sslmode', 'verify-full');
const db = new Pool({ connectionString: connection.toString(), max: 2 });
const legacyImage = /^\/api\/images\/([0-9a-f-]{36})$/i;
const staticImage = /^\/images\/productos\/([a-z0-9-]+\.jpeg)$/;

function blobPath(source, mimeType) {
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 32);
  const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
  return `catalogo/${id}.${mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg'}`;
}

try {
  const products = (await db.query('SELECT id, data FROM catalog_products')).rows;
  const style = (await db.query("SELECT value FROM catalog_meta WHERE key = 'style_section'")).rows[0];
  const section = style ? JSON.parse(style.value) : null;
  const sources = new Set(products.flatMap(row => row.data.images.map(image => image.url)));
  for (const card of section?.cards ?? []) sources.add(card.image);
  const pending = [...sources].filter(url => legacyImage.test(url) || staticImage.test(url));
  console.log(`${products.length} productos; ${pending.length} archivos pendientes de mover a Vercel Blob.`);
  if (!apply || !pending.length) {
    if (!apply && pending.length) console.log('Vista previa solamente. Ejecuta con --apply para subir y actualizar las URL en Neon.');
  } else {
    const replacements = new Map();
    for (const source of pending) {
      let bytes;
      let mimeType;
      const legacy = source.match(legacyImage);
      if (legacy) {
        const result = await db.query('SELECT mime_type, content FROM catalog_images WHERE id = $1', [legacy[1]]);
        if (!result.rowCount) throw new Error(`Falta la imagen ${source}; no se modificó Neon`);
        ({ mime_type: mimeType, content: bytes } = result.rows[0]);
      } else {
        const filename = source.match(staticImage)[1];
        bytes = readFileSync(resolve('public/images/productos', filename));
        mimeType = 'image/jpeg';
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) throw new Error(`Formato no admitido: ${source}`);
      const uploaded = await put(blobPath(source, mimeType), bytes, {
        access: 'public', contentType: mimeType, addRandomSuffix: false, allowOverwrite: true,
      });
      replacements.set(source, uploaded.url);
      console.log(`Subida ${replacements.size}/${pending.length}: ${source}`);
    }
    const client = await db.connect();
    try {
      await client.query('BEGIN');
      for (const row of products) {
        const data = { ...row.data, images: row.data.images.map(image => ({ ...image, url: replacements.get(image.url) ?? image.url })) };
        await client.query('UPDATE catalog_products SET data = $1::jsonb, updated_at = now() WHERE id = $2', [JSON.stringify(data), row.id]);
      }
      if (section) {
        section.cards = section.cards.map(card => ({ ...card, image: replacements.get(card.image) ?? card.image }));
        await client.query("UPDATE catalog_meta SET value = $1 WHERE key = 'style_section'", [JSON.stringify(section)]);
      }
      await client.query('COMMIT');
      console.log('URL de imágenes actualizadas en Neon. Se conservaron los archivos anteriores para recuperación.');
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
} finally { await db.end(); }
