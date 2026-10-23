import {createClient} from '@sanity/client';
import {createImageUrlBuilder, type SanityImageObject} from '@sanity/image-url';
import project from '../../../sanity.project.json';
import {Category, Product, ProductBadge, ProductImage, ProductVariant, StoreSettings} from '../models/store.models';

interface ImageDocument extends SanityImageObject { alt?: string }
interface SanityColor {
  code?: string; name?: string; hex?: string; photos?: ImageDocument[];
  sizes?: {size?: string; stock?: number}[];
}
interface SanityProduct {
  id?: string; name?: string; categoryId?: string; audience?: Product['audience']; price?: number;
  previousPrice?: number; badge?: ProductBadge; description?: string; material?: string;
  details?: string[]; recommendedAge?: string; garmentLength?: string; chestMeasurement?: string;
  safetyStandard?: string; contents?: string;
  featured?: boolean; createdAt?: string; colors?: SanityColor[]; collections?: string[]; demo?: boolean;
}
interface SanityCategory {id?: string; name?: string; description?: string; image?: ImageDocument}
interface SanitySettings extends Partial<Omit<StoreSettings, 'currency' | 'heroImageUrl' | 'heroImageAlt'>> {heroImage?: ImageDocument}
interface CatalogResponse {categories: SanityCategory[]; products: SanityProduct[]; settings?: SanitySettings}

const CATALOG_QUERY = `{
  "categories": *[_type == "category" && defined(slug.current)] | order(sortOrder asc, name asc) {
    "id": slug.current, name, description, image
  },
  "products": *[_type == "product" && active != false && defined(slug.current)] | order(_createdAt desc) {
    "id": slug.current, name, "categoryId": category->slug.current, audience,
    price, previousPrice, badge, description, material, details,
    recommendedAge, garmentLength, chestMeasurement, safetyStandard, contents,
    featured, collections, demo,
    "createdAt": _createdAt,
    colors[]{code, name, hex, photos[], sizes[]{size, stock}}
  },
  "settings": *[_type == "storeSettings" && _id == "storeSettings"][0]{
    name, whatsappNumber, email, instagramUrl, location, announcement,
    heroEyebrow, heroTitle, heroAccent, heroDescription, heroImage, useChildrenEditorial
  }
}`;

const client = project.projectId ? createClient({
  projectId: project.projectId,
  dataset: project.dataset,
  apiVersion: project.apiVersion,
  perspective: 'published',
  useCdn: true,
}) : null;

export async function fetchSanityCatalog(options: {fresh?: boolean; lastLiveEventId?: string} = {}): Promise<{
  categories: Category[]; products: Product[]; settings: Partial<StoreSettings>; syncTags: string[];
}> {
  if (!client) throw new Error('Sanity Project ID no configurado.');
  const imageBuilder = createImageUrlBuilder(client);
  const imageUrl = (source?: ImageDocument, width = 1200): string => source?.asset ? imageBuilder.image(source).width(width).fit('max').auto('format').url() : '';
  const {result: response, syncTags = []} = await client.fetch<CatalogResponse>(CATALOG_QUERY, {}, {
    filterResponse: false,
    returnQuery: false,
    ...(options.fresh ? {useCdn: false} : {cacheMode: 'noStale' as const}),
    ...(options.lastLiveEventId ? {lastLiveEventId: options.lastLiveEventId} : {}),
  });
  const categories = (response.categories ?? []).filter((item): item is SanityCategory & {id: string; name: string} => !!item.id && !!item.name).map(item => ({
    id: item.id, name: item.name, description: item.description ?? '', image: imageUrl(item.image, 900) || '/image-fallback.svg',
  }));
  const products = (response.products ?? []).flatMap((item): Product[] => {
    if (!item.id || !item.name || !item.categoryId || !['bebes', 'ninas', 'ninos'].includes(item.audience ?? '') || typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0) return [];
    const variants: ProductVariant[] = [];
    const images: ProductImage[] = [];
    for (const color of item.colors ?? []) {
      if (!color.code || !color.name || !color.hex) continue;
      for (const size of color.sizes ?? []) {
        if (!size.size || typeof size.stock !== 'number') continue;
        variants.push({colorId: color.code, colorName: color.name, hex: color.hex, size: size.size, stock: Math.max(0, size.stock)});
      }
      for (const [index, photo] of (color.photos ?? []).entries()) {
        const url = imageUrl(photo);
        if (url) images.push({url, alt: photo.alt || `${item.name} en color ${color.name}`, colorId: color.code, view: index === 0 ? 'full' : 'detail'});
      }
    }
    if (!variants.length || !images.length) return [];
    return [{
      id: item.id, name: item.name, categoryId: item.categoryId, audience: item.audience!, price: item.price,
      previousPrice: item.previousPrice, badge: item.badge, description: item.description ?? '', material: item.material ?? '',
      details: item.details ?? [], recommendedAge: item.recommendedAge, garmentLength: item.garmentLength,
      chestMeasurement: item.chestMeasurement, safetyStandard: item.safetyStandard, contents: item.contents,
      collections: item.collections ?? [], demo: !!item.demo, featured: !!item.featured,
      createdAt: Date.parse(item.createdAt ?? '') || Date.now(), variants, images,
    }];
  });
  const rawSettings = response.settings ?? {};
  const {heroImage: _heroImage, ...settings} = rawSettings;
  const heroImageUrl = imageUrl(rawSettings.heroImage, 2000);
  return {categories, products, syncTags, settings: {...settings, ...(heroImageUrl ? {heroImageUrl, heroImageAlt: rawSettings.heroImage?.alt ?? settings.name ?? 'Portada de la tienda'} : {})}};
}

export function observeSanityCatalog(
  getSyncTags: () => readonly string[],
  onUpdate: (lastLiveEventId?: string) => void,
  onError: (error: unknown) => void,
): () => void {
  if (!client) return () => {};
  const subscription = client.live.events().subscribe({
    next: event => {
      if (event.type === 'message' && event.tags.some(tag => getSyncTags().includes(tag))) onUpdate(event.id);
      if (event.type === 'restart' || event.type === 'reconnect') onUpdate();
      if (event.type === 'goaway') onError(new Error(`Sanity cerró la conexión en vivo: ${event.reason}`));
    },
    error: onError,
  });
  return () => subscription.unsubscribe();
}
