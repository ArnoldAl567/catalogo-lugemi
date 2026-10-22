import { Injectable, OnDestroy, signal } from '@angular/core';
import { CATEGORIES, PRODUCTS } from '../data/catalog.data';
import project from '../../../sanity.project.json';
import { Category, Product, StoreSettings } from '../models/store.models';
import { STORE_CONFIG } from './store.config';

@Injectable({ providedIn: 'root' })
export class CatalogService implements OnDestroy {
  private readonly productState = signal<Product[]>(project.projectId ? [] : PRODUCTS);
  private readonly categoryState = signal<Category[]>(project.projectId ? [] : CATEGORIES);
  private readonly settingsState = signal<StoreSettings>(STORE_CONFIG);
  readonly products = this.productState.asReadonly();
  readonly categories = this.categoryState.asReadonly();
  readonly settings = this.settingsState.asReadonly();
  readonly status = signal<'demo' | 'loading' | 'ready' | 'error'>(project.projectId ? 'loading' : 'demo');
  private syncTags: string[] = [];
  private lastReturnRefreshAt = 0;
  private requestId = 0;
  private stopLiveUpdates?: () => void;
  private readonly refreshOnReturn = () => {
    if (this.status() === 'loading' || Date.now() - this.lastReturnRefreshAt < 1_000) return;
    this.lastReturnRefreshAt = Date.now();
    void this.refresh({fresh: true});
  };
  private readonly refreshOnVisibility = () => {
    if (document.visibilityState === 'visible') this.refreshOnReturn();
  };

  constructor() {
    if (!project.projectId) return;
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.refreshOnVisibility);
      window.addEventListener('focus', this.refreshOnReturn);
    }
    void this.refresh().then(async () => {
      try {
        const {observeSanityCatalog} = await import('./sanity.repository');
        this.stopLiveUpdates = observeSanityCatalog(
          () => this.syncTags,
          lastLiveEventId => void this.refresh({lastLiveEventId, fresh: !lastLiveEventId}),
          error => console.warn('No se pudo mantener la actualización en vivo de Sanity.', error),
        );
      } catch (error) {
        console.warn('No se pudo iniciar la actualización en vivo de Sanity.', error);
      }
    });
  }

  async refresh(options: {fresh?: boolean; lastLiveEventId?: string} = {}): Promise<void> {
    if (!project.projectId) return;
    const currentRequestId = ++this.requestId;
    if (!this.products().length) this.status.set('loading');
    try {
      const {fetchSanityCatalog} = await import('./sanity.repository');
      const data = await fetchSanityCatalog(options);
      if (currentRequestId !== this.requestId) return;
      const hasChildren = data.products.length > 0;
      this.productState.set(hasChildren ? data.products : PRODUCTS);
      this.categoryState.set(hasChildren ? data.categories.filter(category => data.products.some(product => product.categoryId === category.id)) : CATEGORIES);
      const settings = Object.fromEntries(Object.entries(data.settings).filter(([, value]) => value != null));
      // Preserve real contact details. Legacy adult editorial content is not reused.
      const contact = Object.fromEntries(['name', 'whatsappNumber', 'email', 'location', 'instagramUrl'].filter(key => key in settings).map(key => [key, settings[key]]));
      this.settingsState.set({...STORE_CONFIG, ...(data.settings.useChildrenEditorial ? settings : contact)});
      this.syncTags = data.syncTags;
      this.status.set(hasChildren ? 'ready' : 'demo');
    } catch (error) {
      console.error('No se pudo cargar el catálogo de Sanity.', error);
      if (currentRequestId === this.requestId && !this.products().length) this.status.set('error');
    }
  }

  ngOnDestroy(): void {
    this.stopLiveUpdates?.();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.refreshOnVisibility);
      window.removeEventListener('focus', this.refreshOnReturn);
    }
  }

  getById(id: string): Product | undefined { return this.products().find(product => product.id === id); }
  related(product: Product, limit = 4): Product[] {
    return this.products().filter(item => item.id !== product.id && (item.categoryId === product.categoryId || item.audience === product.audience)).slice(0, limit);
  }
}
