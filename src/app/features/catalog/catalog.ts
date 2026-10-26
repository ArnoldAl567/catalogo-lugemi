import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { filterProducts } from '../../core/store.utils';
import { ProductCard } from '../../shared/product-card';
import { MENU_CATEGORIES } from '../../data/shop-navigation';

@Component({ selector: 'app-catalog', standalone: true, imports: [FormsModule, ProductCard], templateUrl: './catalog.html', styleUrl: './catalog.css' })
export class Catalog {
  readonly catalog = inject(CatalogService);
  private readonly route = inject(ActivatedRoute);
  readonly query = signal(''); readonly category = signal('');
  readonly size = signal(''); readonly color = signal(''); readonly minPrice = signal<number | undefined>(undefined);
  readonly maxPrice = signal<number | undefined>(undefined); readonly sort = signal('newest');
  readonly filtersOpen = signal(false);
  readonly sizes = computed(() => [...new Set(this.catalog.products().flatMap(product => product.variants.map(variant => variant.size)))]);
  readonly colors = computed(() => [...new Map(this.catalog.products().flatMap(product => product.variants.map(variant => [variant.colorId, {id: variant.colorId, name: variant.colorName, hex: variant.hex}] as const))).values()]);
  readonly categories = this.catalog.menuCategories;
  readonly categoryTitle = computed(() => MENU_CATEGORIES.find(item => item.id === this.category())?.label ?? (this.category() === 'oversize' ? 'Polos oversize' : this.category() === 'raglan' ? 'Polos raglán' : 'Toda la colección'));
  readonly categoryUnavailable = computed(() => !!this.category() && (MENU_CATEGORIES.some(item => item.id === this.category()) && !this.catalog.isCategoryEnabled(this.category()) || ['oversize', 'raglan'].includes(this.category()) && !this.catalog.isCategoryEnabled('polos-nino')));
  readonly results = computed(() => {
    if (this.categoryUnavailable()) return [];
    return filterProducts(this.catalog.products(), { query: this.query(), category: this.category(), size: this.size(), color: this.color(), minPrice: this.minPrice(), maxPrice: this.maxPrice(), sort: this.sort() });
  });

  constructor() {
    this.route.queryParamMap.subscribe(params => {
      this.query.set(params.get('buscar') ?? '');
      this.category.set(params.get('categoria') ?? ''); this.size.set(''); this.color.set(''); this.minPrice.set(undefined); this.maxPrice.set(undefined);
      if (params.get('orden') === 'novedades') this.sort.set('newest');
    });
  }
  @HostListener('window:keydown.escape') onEscape(): void { this.filtersOpen.set(false); }
  reset(): void { this.query.set(''); this.category.set(''); this.size.set(''); this.color.set(''); this.minPrice.set(undefined); this.maxPrice.set(undefined); }
}
