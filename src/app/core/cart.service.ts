import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { CartItem, Product } from '../models/store.models';
import { CatalogService } from './catalog.service';
import { validateQuantity } from './store.utils';

const STORAGE_KEY = 'maison-mode-cart-v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly catalog = inject(CatalogService);
  private readonly state = signal<CartItem[]>(this.restore());
  readonly items = this.state.asReadonly();
  readonly count = computed(() => this.items().reduce((count, item) => count + item.quantity, 0));
  readonly total = computed(() => this.items().reduce((total, item) => total + Math.round((this.catalog.getById(item.productId)?.price ?? 0) * 100) * item.quantity, 0) / 100);
  readonly drawerOpen = signal(false);
  readonly feedback = signal('');

  constructor() {
    effect(() => {
      try { if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items())); } catch { /* The cart remains usable when browser storage is unavailable. */ }
    });
    effect(() => {
      if (!['demo', 'ready'].includes(this.catalog.status())) return;
      const valid = this.items().filter(item => {
        const product = this.catalog.getById(item.productId);
        return !!product && validateQuantity(product, item.colorId, item.size, item.quantity);
      });
      if (valid.length !== this.items().length) this.state.set(valid);
    });
  }

  private restore(): CartItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      if (!Array.isArray(raw)) return [];
      return raw.filter((item): item is CartItem => {
        if (!item || typeof item.productId !== 'string' || typeof item.colorId !== 'string' || typeof item.size !== 'string') return false;
        return Number.isInteger(item.quantity) && item.quantity > 0;
      });
    } catch { return []; }
  }

  add(product: Product, colorId: string, size: string, quantity: number): boolean {
    if (!validateQuantity(product, colorId, size, quantity)) return false;
    const existing = this.items().find(item => item.productId === product.id && item.colorId === colorId && item.size === size);
    const nextQuantity = (existing?.quantity ?? 0) + quantity;
    if (!validateQuantity(product, colorId, size, nextQuantity)) return false;
    this.state.update(items => existing
      ? items.map(item => item === existing ? { ...item, quantity: nextQuantity } : item)
      : [...items, { productId: product.id, colorId, size, quantity }]);
    this.feedback.set(`${product.name} se agregó al carrito.`);
    this.drawerOpen.set(true);
    return true;
  }

  update(item: CartItem, quantity: number): boolean {
    const product = this.catalog.getById(item.productId);
    if (!product || !validateQuantity(product, item.colorId, item.size, quantity)) return false;
    this.state.update(items => items.map(current => current.productId === item.productId && current.colorId === item.colorId && current.size === item.size ? { ...current, quantity } : current));
    return true;
  }

  remove(item: CartItem): void {
    this.state.update(items => items.filter(current => !(current.productId === item.productId && current.colorId === item.colorId && current.size === item.size)));
  }
}
