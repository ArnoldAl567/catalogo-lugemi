import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { SHOP_CATEGORIES } from '../../data/shop-navigation';
import { ProductCard } from '../../shared/product-card';


@Component({ selector: 'app-home', standalone: true, imports: [RouterLink, ProductCard], templateUrl: './home.html', styleUrl: './home.css' })
export class Home implements OnInit, OnDestroy {
  readonly catalog = inject(CatalogService);
  readonly settings = this.catalog.settings;

  readonly categories = SHOP_CATEGORIES;
  readonly featured = this.catalog.products;
  readonly activeSlide = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  private manualSelection = false;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.startRotation();
  }

  ngOnDestroy(): void { this.stopRotation(); }

  @HostListener('document:visibilitychange') onVisibilityChange(): void {
    if (document.hidden) this.stopRotation();
    else if (!this.manualSelection) this.resumeRotation();
  }

  private startRotation(): void {
    this.stopRotation();
    if (typeof document !== 'undefined' && document.hidden) return;
    this.timer = setInterval(() => this.activeSlide.update(slide => (slide + 1) % 2), 7000);
  }

  private stopRotation(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  pauseRotation(): void { this.stopRotation(); }
  resumeRotation(): void {
    this.manualSelection = false;
    if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.startRotation();
  }

  selectSlide(slide: number): void {
    this.manualSelection = true;
    this.stopRotation();
    this.activeSlide.set((slide + 2) % 2);
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
