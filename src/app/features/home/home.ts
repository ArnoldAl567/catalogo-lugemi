import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { ProductCard } from '../../shared/product-card';


@Component({ selector: 'app-home', standalone: true, imports: [RouterLink, ProductCard], templateUrl: './home.html', styleUrl: './home.css' })
export class Home {
  readonly catalog = inject(CatalogService);
  readonly settings = this.catalog.settings;

  readonly featured = computed(() => {
    const products = this.catalog.products();
    const selected = products.filter(product => product.featured);
    return (selected.length ? selected : products).slice(0, 8);
  });
  readonly newArrivals = computed(() => [...this.catalog.products()].sort((a,b) => b.createdAt - a.createdAt).filter(product => product.badge === 'Nuevo').slice(0, 4));
  slide(element: HTMLElement, direction: number): void {
    element.scrollBy({ left: direction * (element.clientWidth + 24), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  imageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith('image-fallback.svg')) {
      image.removeAttribute('srcset');
      image.closest('picture')?.querySelectorAll('source').forEach(source => source.removeAttribute('srcset'));
      image.src = '/image-fallback.svg';
    }
  }
}
