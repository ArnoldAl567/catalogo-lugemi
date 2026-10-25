import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SHOP_CATEGORIES } from '../../data/shop-navigation';
import { ProductCard } from '../../shared/product-card';


@Component({ selector: 'app-home', standalone: true, imports: [RouterLink, ProductCard], templateUrl: './home.html', styleUrl: './home.css' })
export class Home {
  readonly catalog = inject(CatalogService);
  readonly settings = this.catalog.settings;

  readonly categories = SHOP_CATEGORIES;
  readonly featured = this.catalog.products;
  imageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith('image-fallback.svg')) {
      image.removeAttribute('srcset');
      image.closest('picture')?.querySelectorAll('source').forEach(source => source.removeAttribute('srcset'));
      image.src = '/image-fallback.svg';
    }
  }
}
