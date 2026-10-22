import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { filterProducts } from '../../core/store.utils';
import { ProductCard } from '../../shared/product-card';
import { AUDIENCES, COLLECTIONS } from '../../data/catalog.data';

@Component({ selector: 'app-catalog', standalone: true, imports: [FormsModule, ProductCard], templateUrl: './catalog.html', styleUrl: './catalog.css' })
export class Catalog {
  readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  readonly query = signal(''); readonly audience = signal(''); readonly category = signal('');
  readonly audiences = AUDIENCES; readonly collections = COLLECTIONS; readonly collection = signal('');
  readonly size = signal(''); readonly color = signal(''); readonly minPrice = signal<number | undefined>(undefined);
  readonly maxPrice = signal<number | undefined>(undefined); readonly sort = signal('newest');
  readonly offersOnly = signal(false); readonly filtersOpen = signal(false);
  readonly sizes = computed(() => [...new Set(this.catalog.products().flatMap(product => product.variants.map(variant => variant.size)))]);
  readonly colors = computed(() => [...new Map(this.catalog.products().flatMap(product => product.variants.map(variant => [variant.colorId, {id: variant.colorId, name: variant.colorName, hex: variant.hex}] as const))).values()]);
  readonly categories = this.catalog.categories;
  readonly results = computed(() => {
    const base = this.offersOnly() ? this.catalog.products().filter(product => product.badge === 'Oferta') : this.catalog.products();
    return filterProducts(base, { query: this.query(), audience: this.audience(), category: this.category(), collection: this.collection(), size: this.size(), color: this.color(), minPrice: this.minPrice(), maxPrice: this.maxPrice(), sort: this.sort() });
  });

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.query.set(params.get('buscar') ?? ''); this.audience.set(params.get('genero') ?? '');
      this.category.set(params.get('categoria') ?? ''); this.offersOnly.set(params.get('ofertas') === 'si');
      this.collection.set(params.get('coleccion') ?? ''); this.size.set(''); this.color.set(''); this.minPrice.set(undefined); this.maxPrice.set(undefined);
      if (params.get('orden') === 'novedades') this.sort.set('newest');
    });
  }
  @HostListener('window:keydown.escape') onEscape(): void { this.filtersOpen.set(false); }
  reset(): void { this.query.set(''); this.audience.set(''); this.category.set(''); this.collection.set(''); this.size.set(''); this.color.set(''); this.minPrice.set(undefined); this.maxPrice.set(undefined); this.offersOnly.set(false); }
}
