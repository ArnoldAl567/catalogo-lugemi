export type Audience = 'bebes' | 'ninas' | 'ninos';
export type ProductBadge = 'Nuevo' | 'Oferta' | 'Más vendido';

export type AtlasQuadrant = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export interface ProductImage { url: string; alt: string; colorId: string; quadrant?: AtlasQuadrant; atlasShape?: 'tall' | 'portrait' | 'wide'; view: 'full' | 'detail'; }
export interface ProductVariant { colorId: string; colorName: string; hex: string; size: string; stock: number; }
export interface Category { id: string; name: string; image: string; description: string; }
export interface Product {
  id: string; name: string; categoryId: string; audience: Audience; price: number;
  previousPrice?: number; badge?: ProductBadge; description: string; material: string;
  details: string[]; images: ProductImage[]; variants: ProductVariant[];
  featured?: boolean; createdAt: number;
  collections?: string[]; demo?: boolean;
}
export interface StoreSettings {
  name: string; whatsappNumber: string; email: string; location: string; instagramUrl: string; currency: 'PEN';
  announcement: string; heroEyebrow: string; heroTitle: string; heroAccent: string; heroDescription: string;
  heroImageUrl: string; heroImageAlt: string;
  useChildrenEditorial?: boolean;
}
export interface CartItem { productId: string; colorId: string; size: string; quantity: number; }
export interface Customer { fullName: string; phone: string; fulfillment: 'delivery' | 'pickup'; address: string; reference: string; notes: string; }
export interface Order { items: CartItem[]; customer: Customer; total: number; }
