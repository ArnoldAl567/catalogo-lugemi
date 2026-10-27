import { computed, Injectable, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/catalog.data';
import { Category, Product, StoreSettings } from '../models/store.models';
import { STORE_CONFIG } from './store.config';
import { DEFAULT_STYLE_SECTION, MENU_CATEGORIES, StyleSection } from '../data/shop-navigation';
import { productCategoryIds } from './store.utils';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly productState = signal<Product[]>(PRODUCTS);
  readonly products = this.productState.asReadonly();
  readonly categories = signal<Category[]>(CATEGORIES).asReadonly();
  private readonly enabledCategoryState = signal<string[]>(MENU_CATEGORIES.map(item => item.id));
  readonly enabledCategoryIds = this.enabledCategoryState.asReadonly();
  readonly menuCategories = computed(() => MENU_CATEGORIES.filter(item => this.enabledCategoryState().includes(item.id)));
  readonly settings = signal<StoreSettings>(STORE_CONFIG).asReadonly();
  private readonly styleSectionState = signal<StyleSection>(DEFAULT_STYLE_SECTION);
  readonly styleSection = this.styleSectionState.asReadonly();

  constructor() { void this.refresh(); void this.refreshCategories(); void this.refreshStyleSection(); }

  async refreshStyleSection(): Promise<void> {
    try {
      const response = await fetch('/api/style-section');
      if (!response.ok) return;
      const result = await response.json() as { section?: StyleSection };
      if (result.section && Array.isArray(result.section.cards)) this.styleSectionState.set(result.section);
    } catch { /* Keep the supplied style cards visible while the API is unavailable. */ }
  }

  setStyleSection(section: StyleSection): void { this.styleSectionState.set(section); }

  async refreshCategories(): Promise<void> {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) return;
      const result = await response.json() as { enabledIds?: string[] };
      if (Array.isArray(result.enabledIds) && result.enabledIds.every(id => typeof id === 'string')) this.enabledCategoryState.set(result.enabledIds);
    } catch { /* Keep all categories visible if the API is unavailable. */ }
  }

  setEnabledCategoryIds(ids: string[]): void { this.enabledCategoryState.set(ids); }
  isCategoryEnabled(id: string): boolean { return this.enabledCategoryState().includes(id); }

  async refresh(): Promise<void> {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) return;
      const result = await response.json() as { products?: Product[] };
      if (Array.isArray(result.products)) this.productState.set(result.products);
    } catch { /* Keep the supplied catalog visible while the API is unavailable. */ }
  }

  getById(id: string): Product | undefined { return this.products().find(product => product.id === id); }
  related(product: Product, limit = 4): Product[] {
    return this.products().filter(item => item.id !== product.id && (productCategoryIds(item).some(id => productCategoryIds(product).includes(id)) || item.audience === product.audience)).slice(0, limit);
  }
}
