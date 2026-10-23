import { Injectable, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/catalog.data';
import { Category, Product, StoreSettings } from '../models/store.models';
import { STORE_CONFIG } from './store.config';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly products = signal<Product[]>(PRODUCTS).asReadonly();
  readonly categories = signal<Category[]>(CATEGORIES).asReadonly();
  readonly settings = signal<StoreSettings>(STORE_CONFIG).asReadonly();

  getById(id: string): Product | undefined { return this.products().find(product => product.id === id); }
  related(product: Product, limit = 4): Product[] {
    return this.products().filter(item => item.id !== product.id && (item.categoryId === product.categoryId || item.audience === product.audience)).slice(0, limit);
  }
}
