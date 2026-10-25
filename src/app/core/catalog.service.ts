import { Injectable, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/catalog.data';
import { Category, Product, StoreSettings } from '../models/store.models';
import { STORE_CONFIG } from './store.config';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly productState = signal<Product[]>(PRODUCTS);
  readonly products = this.productState.asReadonly();
  readonly categories = signal<Category[]>(CATEGORIES).asReadonly();
  readonly settings = signal<StoreSettings>(STORE_CONFIG).asReadonly();

  constructor() { void this.refresh(); }

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
    return this.products().filter(item => item.id !== product.id && (item.categoryId === product.categoryId || item.audience === product.audience)).slice(0, limit);
  }
}
