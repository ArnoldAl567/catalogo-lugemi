import {createReadStream, readFileSync} from 'node:fs'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join, resolve} from 'node:path'
import {spawnSync} from 'node:child_process'
import {getCliClient} from 'sanity/cli'
import ts from 'typescript'

type DemoImage = {url: string; alt: string; colorId: string; quadrant?: string; view: string}
type DemoVariant = {colorId: string; colorName: string; hex: string; size: string; stock: number}
type DemoProduct = {
  id: string; name: string; categoryId: string; audience: string; price: number; previousPrice?: number;
  badge?: string; description: string; material: string; details: string[]; featured?: boolean;
  variants: DemoVariant[]; images: DemoImage[]; collections?: string[]; demo?: boolean
}
type DemoCategory = {id: string; name: string; description: string}

const root = resolve(process.cwd(), '..')
const apiVersion = '2026-03-01'

async function loadDemo(): Promise<{CATEGORIES: DemoCategory[]; PRODUCTS: DemoProduct[]}> {
  const source = readFileSync(join(root, 'src/app/data/catalog.data.ts'), 'utf8')
  const javascript = ts.transpileModule(source, {
    compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(javascript).toString('base64')}`)
}

function cropPhoto(input: string, output: string, quadrant: string): void {
  const x = quadrant.endsWith('right') ? 'iw/2' : '0'
  const y = quadrant.startsWith('bottom') ? 'ih/2' : '0'
  const result = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', input, '-vf', `crop=iw/2:ih/2:${x}:${y}`, '-frames:v', '1', output], {encoding: 'utf8'})
  if (result.status !== 0) throw new Error(`No se pudo preparar ${input}: ${result.stderr || result.error?.message}`)
}

async function main(): Promise<void> {
  const {CATEGORIES, PRODUCTS} = await loadDemo()
  const dryRun = process.argv.includes('--dry-run')
  if (dryRun) {
    console.log(`Listos para importar: ${CATEGORIES.length} categorías, ${PRODUCTS.length} productos y ${PRODUCTS.reduce((sum, product) => sum + new Set(product.variants.map(variant => variant.colorId)).size, 0)} fotos por color.`)
    return
  }

  const client = getCliClient({apiVersion}).withConfig({useCdn: false})
  const tempDirectory = await mkdtemp(join(tmpdir(), 'maison-sanity-'))
  try {
    for (const category of CATEGORIES) {
      await client.createIfNotExists({
        _id: `category-${category.id}`, _type: 'category', name: category.name,
        slug: {_type: 'slug', current: category.id}, description: category.description,
        sortOrder: CATEGORIES.indexOf(category),
      })
    }
    console.log(`${CATEGORIES.length} categorías listas.`)

    for (const product of PRODUCTS) {
      const colors = []
      for (const colorId of [...new Set(product.variants.map(variant => variant.colorId))]) {
        const variants = product.variants.filter(variant => variant.colorId === colorId)
        const photo = product.images.find(image => image.colorId === colorId && image.view === 'full')
        if (!photo) throw new Error(`Falta fotografía de ${product.id} en ${colorId}`)
        const filename = `${product.id}-${colorId}.webp`
        const sourcePath = join(root, 'public', photo.url.replace(/^\//, ''))
        const croppedPath = photo.quadrant ? join(tempDirectory, filename) : sourcePath
        if (photo.quadrant) cropPhoto(sourcePath, croppedPath, photo.quadrant)
        const asset = await client.assets.upload('image', createReadStream(croppedPath), {filename})
        colors.push({
          _key: colorId, _type: 'colorVariant', code: colorId,
          name: variants[0].colorName, hex: variants[0].hex,
          photos: [{_key: 'main', _type: 'image', alt: photo.alt, asset: {_type: 'reference', _ref: asset._id}}],
          sizes: variants.map(variant => ({_key: 'size-' + variants.indexOf(variant), _type: 'sizeStock', size: variant.size, stock: variant.stock})),
        })
      }
      await client.createIfNotExists({
        _id: `product-${product.id}`, _type: 'product', name: product.name,
        slug: {_type: 'slug', current: product.id}, category: {_type: 'reference', _ref: `category-${product.categoryId}`},
        audience: product.audience, price: product.price, previousPrice: product.previousPrice,
        badge: product.badge, description: product.description, material: product.material,
        collections: product.collections, demo: product.demo, details: product.details, featured: !!product.featured, active: true, colors,
      })
      console.log(`Producto listo: ${product.name}`)
    }
    await client.createIfNotExists({
      _id: 'storeSettings', _type: 'storeSettings', name: 'MAISON MODE',
      whatsappNumber: '51902586908', email: '', instagramUrl: '', location: 'Lima, Perú',
      announcement: 'Pequeños detalles, momentos inolvidables · Atención por WhatsApp',
      heroEyebrow: 'El encanto de crecer', heroTitle: 'Pequeños estilos,', heroAccent: 'grandes momentos',
      heroDescription: 'Descubre prendas únicas diseñadas para acompañar cada aventura de su infancia',
    })
    console.log('Datos de la tienda listos. La portada y las categorías pueden recibir fotos propias desde el panel.')
  } finally {
    await rm(tempDirectory, {recursive: true, force: true})
  }
}

main().catch(error => {console.error(error); process.exitCode = 1})
