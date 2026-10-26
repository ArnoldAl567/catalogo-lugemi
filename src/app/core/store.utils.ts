import { CartItem, Customer, Order, Product, ProductImage, ProductSpecification, ProductVariant } from '../models/store.models';
import { STORE_CONFIG } from './store.config';

export const money = (value: number): string => `S/ ${value.toFixed(2)}`;
export function productCategoryIds(product: Product): string[] {
  if (product.categoryIds?.length) return product.categoryIds;
  return ['oversize', 'raglan'].includes(product.categoryId) ? ['polos-nino'] : [product.categoryId];
}
export function getVariant(product: Product, colorId: string, size: string): ProductVariant | undefined {
  return product.variants.find(variant => variant.colorId === colorId && variant.size === size);
}
export function imagesForColor(product: Product, colorId: string): ProductImage[] {
  return product.images.filter(image => image.colorId === colorId);
}
export function mainImageForColor(product: Product, colorId: string): ProductImage | undefined {
  return imagesForColor(product, colorId).find(image => image.view === 'full');
}
export function productSpecifications(product: Product, categoryName: string): ProductSpecification[] {
  if (product.specifications) return product.specifications;
  return [
    { label: 'Edad recomendada', value: product.recommendedAge },
    { label: 'Tallas disponibles', value: [...new Set(product.variants.map(variant => variant.size))].join(' · ') },
    { label: 'Material', value: product.material },
    { label: 'Contenido', value: product.contents },
    { label: 'Estilo', value: categoryName },
    { label: 'Pecho', value: product.chestMeasurement },
    { label: 'Largo / medida', value: product.garmentLength },
    { label: 'Seguridad / norma', value: product.safetyStandard },
  ].filter((row): row is ProductSpecification => !!row.value?.trim()).slice(0, 7);
}
export function validateQuantity(product: Product, colorId: string, size: string, quantity: number): boolean {
  const variant = getVariant(product, colorId, size);
  return !!variant && Number.isInteger(quantity) && quantity >= 1 && quantity <= variant.stock;
}
export function filterProducts(products: Product[], filters: { query?: string; category?: string; audience?: string; collection?: string; size?: string; color?: string; minPrice?: number; maxPrice?: number; sort?: string }): Product[] {
  const query = (filters.query ?? '').trim().toLocaleLowerCase('es');
  const found = products.filter(product => {
    const categoryIds = productCategoryIds(product);
    if (query && !`${product.name} ${categoryIds.join(' ')} ${product.description}`.toLocaleLowerCase('es').includes(query)) return false;
    if (filters.category === 'ofertas') {
      if (!categoryIds.includes('ofertas') && product.badge !== 'Oferta' && !(product.previousPrice && product.previousPrice > product.price)) return false;
    } else if (filters.category && !categoryIds.includes(filters.category) && product.categoryId !== filters.category) return false;
    if (filters.audience && product.audience !== filters.audience) return false;
    if (filters.collection && !(product.collections?.includes(filters.collection) || (filters.collection === 'nueva' && product.badge === 'Nuevo'))) return false;
    if ((filters.size || filters.color) && !product.variants.some(variant => (!filters.size || variant.size === filters.size) && (!filters.color || variant.colorId === filters.color) && variant.stock > 0)) return false;
    if (filters.minPrice !== undefined && product.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    return true;
  });
  switch (filters.sort) {
    case 'price-asc': return found.sort((a, b) => a.price - b.price);
    case 'price-desc': return found.sort((a, b) => b.price - a.price);
    case 'name': return found.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    default: return found.sort((a, b) => b.createdAt - a.createdAt);
  }
}
export function validateCustomer(customer: Customer): Record<string, string> {
  const errors: Record<string, string> = {};
  if (customer.fullName.trim().length < 3) errors['fullName'] = 'Ingresa tu nombre completo.';
  if (customer.fulfillment === 'delivery' && customer.address.trim().length < 5) errors['address'] = 'Ingresa la dirección de entrega.';
  return errors;
}
export function buildOrderMessage(order: Order, products: Product[], storeName = STORE_CONFIG.name): string {
  const lines = [`Hola, ${storeName}. Deseo realizar el siguiente pedido:`, ''];
  if (!order.items.length) throw new Error('El pedido está vacío.');
  lines.push('Por favor, confirma la disponibilidad de las tallas y el costo de envío.', '');
  let totalCents = 0;
  order.items.forEach((item: CartItem, index) => {
    const product = products.find(candidate => candidate.id === item.productId);
    if (!product || !validateQuantity(product, item.colorId, item.size, item.quantity)) throw new Error('Hay una variante o cantidad no disponible.');
    const variant = getVariant(product, item.colorId, item.size)!;
    totalCents += Math.round(product.price * 100) * item.quantity;
    lines.push(`${index + 1}. Producto: ${product.name}`, `   Talla: ${item.size}`, `   Color: ${variant.colorName}`, `   Cantidad: ${item.quantity}`, `   Precio unitario: ${money(product.price)}`, `   Subtotal: ${money(product.price * item.quantity)}`, '');
  });
  lines.push(`TOTAL: ${money(totalCents / 100)}`, '', 'DATOS DEL CLIENTE', `Nombre: ${order.customer.fullName.trim()}`);
  if (order.customer.phone.trim()) lines.push(`Teléfono: ${order.customer.phone.trim()}`);
  lines.push(`Modalidad: ${order.customer.fulfillment === 'delivery' ? 'Delivery' : 'Recojo en tienda'}`);
  if (order.customer.fulfillment === 'delivery') lines.push(`Dirección: ${order.customer.address.trim()}`);
  if (order.customer.reference.trim()) lines.push(`Referencia: ${order.customer.reference.trim()}`);
  if (order.customer.notes.trim()) lines.push(`Observaciones: ${order.customer.notes.trim()}`);
  lines.push('', 'Quisiera consultar la disponibilidad, el costo de envío y coordinar la entrega. ¡Gracias!');
  return lines.join('\n');
}
export function whatsappUrl(message: string, number = STORE_CONFIG.whatsappNumber): string {
  const normalized = number.replace(/[+\s()-]/g, '');
  if (!/^\d{10,15}$/.test(normalized)) throw new Error('Número de WhatsApp inválido.');
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}
