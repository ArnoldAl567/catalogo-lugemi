import { PRODUCTS } from '../data/catalog.data';
import { buildOrderMessage, filterProducts, imagesForColor, mainImageForColor, validateCustomer, validateQuantity, whatsappUrl } from './store.utils';
import { Product } from '../models/store.models';
import { STORE_CONFIG } from './store.config';

describe('catálogo infantil y variantes', () => {
  it('combina colección infantil, categoría, talla y orden de precio', () => {
    const found = filterProducts(PRODUCTS, { audience: 'ninas', category: 'vestidos', size: '4 años', sort: 'price-asc' });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every(product => product.categoryId === 'vestidos' && product.audience === 'ninas')).toBe(true);
    const sorted = filterProducts(PRODUCTS, { sort: 'price-desc' });
    expect(sorted.map(product => product.price)).toEqual([...sorted.map(product => product.price)].sort((a,b) => b-a));
  });
  it('solo acepta talla y color disponibles en la misma variante', () => {
    const product: Product = {...PRODUCTS[0], variants: [
      { colorId: 'rosa', colorName: 'Rosa', hex: '#E8CFCB', size: '2 años', stock: 2 },
      { colorId: 'marfil', colorName: 'Marfil', hex: '#FAF8F5', size: '4 años', stock: 3 },
    ]};
    expect(filterProducts([product], {size:'4 años',color:'rosa'})).toHaveLength(0);
    expect(filterProducts([product], {size:'4 años',color:'marfil'})).toHaveLength(1);
  });
  it('filtra rangos de precios, búsquedas y colecciones de temporada', () => {
    const found = filterProducts(PRODUCTS, { minPrice: 90, maxPrice: 120, collection: 'verano' });
    expect(found.length).toBeGreaterThan(0);
    expect(found.every(product => product.price >= 90 && product.price <= 120 && product.collections?.includes('verano'))).toBe(true);
    expect(filterProducts(PRODUCTS, {query:'  FLORA  '})).toHaveLength(1);
    expect(filterProducts(PRODUCTS, {minPrice: 999})).toHaveLength(0);
  });
  it('rechaza variantes inexistentes, agotadas y cantidades inválidas', () => {
    const product = PRODUCTS[0], variant = product.variants[0];
    for (const quantity of [0,-1,.5,999,NaN]) expect(validateQuantity(product,variant.colorId,variant.size,quantity)).toBe(false);
    expect(validateQuantity(product, variant.colorId, variant.size, 1)).toBe(true);
    expect(validateQuantity(product, 'inexistente', variant.size, 1)).toBe(false);
    const empty = product.variants.find(item => item.stock === 0)!;
    expect(validateQuantity(product,empty.colorId,empty.size,1)).toBe(false);
  });
  it('cada color tiene su fotografía infantil propia y las muestras están identificadas', () => {
    for (const product of PRODUCTS) {
      expect(['bebes','ninas','ninos']).toContain(product.audience);
      expect(product.demo).toBe(true);
      const colorIds = [...new Set(product.variants.map(variant => variant.colorId))];
      const urls = colorIds.map(colorId => {
        const photos = imagesForColor(product,colorId);
        expect(photos.length).toBeGreaterThan(0);
        expect(photos.every(photo => photo.url.startsWith('/images/') && photo.colorId === colorId)).toBe(true);
        return mainImageForColor(product,colorId)?.url;
      });
      expect(new Set(urls).size).toBe(colorIds.length);
    }
  });
});

describe('pedido por WhatsApp', () => {
  const customer = { fullName: 'Ana Pérez', phone: '', fulfillment: 'delivery' as const, address: 'Dirección de prueba 123', reference: '', notes: 'Color & talla: confirmar' };
  it('valida nombre y dirección solo cuando corresponde', () => {
    expect(validateCustomer({ ...customer, fullName: '', address: '' })).toHaveProperty('fullName');
    expect(validateCustomer({ ...customer, fulfillment: 'pickup', address: '' })).toEqual({});
  });
  it('genera todas las líneas y calcula el total desde precios actuales, ignorando un total desactualizado', () => {
    const first=PRODUCTS[0], second=PRODUCTS[2];
    const items=[{productId:first.id,colorId:first.variants[0].colorId,size:first.variants[0].size,quantity:2},{productId:second.id,colorId:second.variants[0].colorId,size:second.variants[0].size,quantity:1}];
    const message=buildOrderMessage({items,customer,total:0},PRODUCTS);
    expect(message).toContain('Producto: Conjunto Nube');
    expect(message).toContain('Producto: Vestido Flora');
    expect(message).toContain('Talla: 0–3 m');
    expect(message).toContain('Color: Marfil');
    expect(message).toContain('Precio unitario: S/ 89.90');
    expect(message).toContain('Subtotal: S/ 179.80');
    expect(message).toContain('TOTAL: S/ 289.70');
    expect(message).toContain('DEMOSTRACIÓN');
    expect(message).toContain('costo de envío');
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

