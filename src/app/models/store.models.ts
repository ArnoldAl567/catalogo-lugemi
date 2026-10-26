export type Audience = 'bebes' | 'ninas' | 'ninos' | 'infantil';
export type ProductBadge = 'Nuevo' | 'Oferta' | 'Más vendido';

export interface ProductImage { url: string; alt: string; colorId: string; view: 'full' | 'detail' | 'extra'; }
export interface ProductSpecification { label: string; value: string; }
export interface ProductVariant { colorId: string; colorName: string; hex: string; size: string; stock: number; }
export interface Category { id: string; name: string; }
export interface Product {
  id: string; name: string; categoryId: string; categoryIds?: string[]; audience: Audience; price: number;
  previousPrice?: number; badge?: ProductBadge; description: string; material: string;
  details: string[]; images: ProductImage[]; variants: ProductVariant[];
  specifications?: ProductSpecification[];
  recommendedAge?: string; garmentLength?: string; chestMeasurement?: string;
  safetyStandard?: string; contents?: string;
  featured?: boolean; createdAt: number;
  collections?: string[]; stockUnconfirmed?: boolean;
}
export interface StoreSettings {
  name: string; whatsappNumber: string; email: string; location: string; instagramUrl: string; tiktokUrl?: string; facebookUrl: string; currency: 'PEN';
  heroEyebrowLines: string[]; heroTitleLines: string[]; heroAccent: string; heroDescription: string;
  heroImageUrl: string; heroImageAlt: string;
}
export interface CartItem { productId: string; colorId: string; size: string; quantity: number; }
export interface Customer { fullName: string; phone: string; fulfillment: 'delivery' | 'pickup'; address: string; reference: string; notes: string; }
export interface Order { items: CartItem[]; customer: Customer; total: number; }
