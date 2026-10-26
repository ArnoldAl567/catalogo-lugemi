import { PRODUCTS } from '../data/catalog.data';
import { buildOrderMessage, filterProducts, imagesForColor, mainImageForColor, validateCustomer, validateQuantity, whatsappUrl } from './store.utils';
import { Product } from '../models/store.models';
import { STORE_CONFIG } from './store.config';

describe('catálogo Lugemi Kids', () => {
  it('contiene únicamente los ocho modelos de la ficha y seis tallas por modelo', () => {
    expect(PRODUCTS).toHaveLength(8);
    expect(new Set(PRODUCTS.map(product => product.id)).size).toBe(8);
    expect(PRODUCTS.filter(product => product.categoryId === 'oversize')).toHaveLength(4);
    expect(PRODUCTS.filter(product => product.categoryId === 'raglan')).toHaveLength(4);
    for (const product of PRODUCTS) {
      expect(product.price).toBe(35);
      expect(product.variants.map(variant => variant.size)).toEqual(['6', '8', '10', '12', '14', '16']);
      expect(product.stockUnconfirmed).toBe(true);
    }
  });
  it('filtra por estilo, talla, nombre y precio', () => {
    const found = filterProducts(PRODUCTS, { category: 'raglan', size: '10', sort: 'name' });
    expect(found).toHaveLength(4);
    expect(found.every(product => product.categoryId === 'raglan')).toBe(true);
    expect(found.map(product => product.name)).toEqual([...found.map(product => product.name)].sort((a,b) => a.localeCompare(b, 'es')));
    expect(filterProducts(PRODUCTS, {query:'  LION  '})).toHaveLength(1);
    expect(filterProducts(PRODUCTS, {minPrice:35,maxPrice:35})).toHaveLength(8);
    expect(filterProducts(PRODUCTS, {minPrice:36})).toHaveLength(0);
  });
  it('agrupa los polos actuales y respeta las nuevas categorías y ofertas', () => {
    expect(filterProducts(PRODUCTS, { category: 'polos-nino' })).toHaveLength(8);
    expect(filterProducts(PRODUCTS, { category: 'casacas-nina' })).toHaveLength(0);
    const newProduct: Product = { ...PRODUCTS[0], id: 'sudadera-prueba', categoryId: 'sudaderas-nino' };
    const saleProduct: Product = { ...PRODUCTS[1], id: 'oferta-prueba', badge: 'Oferta' };
    expect(filterProducts([...PRODUCTS, newProduct], { category: 'sudaderas-nino' }).map(product => product.id)).toEqual(['sudadera-prueba']);
    expect(filterProducts([...PRODUCTS, saleProduct], { category: 'ofertas' }).map(product => product.id)).toEqual(['oferta-prueba']);
  });
  it('muestra una prenda en cada categoría asignada', () => {
    const product: Product = { ...PRODUCTS[0], categoryIds: ['polos-nino', 'ofertas'] };
    expect(filterProducts([product], { category: 'polos-nino' })).toHaveLength(1);
    expect(filterProducts([product], { category: 'ofertas' })).toHaveLength(1);
    expect(filterProducts([product], { category: 'accesorios' })).toHaveLength(0);
  });
  it('solo acepta talla y color disponibles en la misma variante', () => {
    const product: Product = {...PRODUCTS[0], variants: [
      { colorId: 'rojo', colorName: 'Rojo', hex: '#BA3B32', size: '8', stock: 2 },
      { colorId: 'marfil', colorName: 'Marfil', hex: '#FAF8F5', size: '10', stock: 3 },
    ]};
    expect(filterProducts([product], {size:'10',color:'rojo'})).toHaveLength(0);
    expect(filterProducts([product], {size:'10',color:'marfil'})).toHaveLength(1);
  });
  it('rechaza variantes inexistentes, agotadas y cantidades inválidas', () => {
    const product = PRODUCTS[0], variant = product.variants[0];
    for (const quantity of [0,-1,.5,999,NaN]) expect(validateQuantity(product,variant.colorId,variant.size,quantity)).toBe(false);
    expect(validateQuantity(product, variant.colorId, variant.size, 1)).toBe(true);
    expect(validateQuantity(product, 'inexistente', variant.size, 1)).toBe(false);
    const unavailable: Product = {...product, variants: [{...variant, stock:0}]};
    expect(validateQuantity(unavailable,variant.colorId,variant.size,1)).toBe(false);
  });
  it('muestra fotos reales de frente y espalda para cada modelo', () => {
    const urls = new Set<string>();
    for (const product of PRODUCTS) {
      const colorId = product.variants[0].colorId;
      const photos = imagesForColor(product,colorId);
      expect(photos.map(photo => photo.view)).toEqual(['full','detail']);
      expect(mainImageForColor(product,colorId)?.url).toBe(photos[0].url);
      expect(photos.every(photo => photo.url.startsWith('/images/productos/') && photo.colorId === colorId)).toBe(true);
      photos.forEach(photo => urls.add(photo.url));
    }
    expect(urls.size).toBe(16);
  });
});

describe('pedido por WhatsApp', () => {
  const customer = { fullName: 'Ana Pérez', phone: '', fulfillment: 'delivery' as const, address: 'Dirección de prueba 123', reference: '', notes: 'Color & talla: confirmar' };
  it('valida nombre y dirección solo cuando corresponde', () => {
    expect(validateCustomer({ ...customer, fullName: '', address: '' })).toHaveProperty('fullName');
    expect(validateCustomer({ ...customer, fulfillment: 'pickup', address: '' })).toEqual({});
  });
  it('incluye modelos, tallas, precios y consulta de disponibilidad', () => {
    const first=PRODUCTS[0], second=PRODUCTS[2];
    const items=[{productId:first.id,colorId:first.variants[0].colorId,size:'6',quantity:2},{productId:second.id,colorId:second.variants[0].colorId,size:'10',quantity:1}];
    const message=buildOrderMessage({items,customer,total:0},PRODUCTS);
    expect(message).toContain('Producto: Polo Oversize Athletic 67');
    expect(message).toContain('Producto: Polo Oversize Space');
    expect(message).toContain('Talla: 6');
    expect(message).toContain('Color: Marfil');
    expect(message).toContain('Precio unitario: S/ 35.00');
    expect(message).toContain('Subtotal: S/ 70.00');
    expect(message).toContain('TOTAL: S/ 105.00');
    expect(message).toContain('confirma la disponibilidad');
    const url=new URL(whatsappUrl(message));
    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toBe(`/${STORE_CONFIG.whatsappNumber}`);
    expect(url.searchParams.get('text')).toBe(message);
  });
  it('no genera un pedido vacío ni con variantes inválidas', () => {
    expect(()=>buildOrderMessage({items:[],customer,total:0},PRODUCTS)).toThrow();
    expect(()=>buildOrderMessage({items:[{productId:PRODUCTS[0].id,colorId:'invalid',size:'invalid',quantity:1}],customer,total:0},PRODUCTS)).toThrow();
  });
  it('normaliza números internacionales y rechaza destinos inválidos', () => {
    expect(whatsappUrl('Hola & gracias', '+51 902 586 908')).toBe('https://wa.me/51902586908?text=Hola%20%26%20gracias');
    expect(()=>whatsappUrl('Hola','abc')).toThrow();
  });
});
