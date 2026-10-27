import { Component, computed, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { ProductCard } from '../../shared/product-card';


@Component({ selector: 'app-home', standalone: true, imports: [RouterLink, ProductCard], templateUrl: './home.html', styleUrl: './home.css' })
export class Home implements OnInit, OnDestroy {
  readonly catalog = inject(CatalogService);
  readonly settings = this.catalog.settings;

  readonly categories = computed(() => this.catalog.styleSection().cards.filter(card =>
    this.catalog.isCategoryEnabled(['oversize', 'raglan'].includes(card.category) ? 'polos-nino' : card.category)));
  readonly styleSection = this.catalog.styleSection;
  readonly topCategories = this.catalog.menuCategories;
  readonly featured = this.catalog.products;
  readonly activeSlide = signal(0);
  private timer?: ReturnType<typeof setInterval>;
  private resumeTimer?: ReturnType<typeof setTimeout>;
  private manualSelection = false;
  private swipeStart: { x: number; y: number } | null = null;

  ngOnInit(): void {
    if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.startRotation();
  }

  ngOnDestroy(): void { this.stopRotation(); if (this.resumeTimer) clearTimeout(this.resumeTimer); }

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
    if (this.resumeTimer) clearTimeout(this.resumeTimer);
    this.resumeTimer = undefined;
    this.manualSelection = false;
    if (typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) this.startRotation();
  }

  selectSlide(slide: number): void {
    this.manualSelection = true;
    this.stopRotation();
    this.activeSlide.set((slide + 2) % 2);
    if (this.resumeTimer) clearTimeout(this.resumeTimer);
    this.resumeTimer = setTimeout(() => this.resumeRotation(), 12000);
  }
  onTouchStart(event: TouchEvent): void {
    if ((event.target as Element).closest('a, button')) { this.swipeStart = null; return; }
    const touch = event.changedTouches[0];
    this.swipeStart = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  onTouchEnd(event: TouchEvent): void {
    if (!this.swipeStart) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.swipeStart.x;
    const dy = touch.clientY - this.swipeStart.y;
    this.swipeStart = null;
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.3) this.selectSlide(this.activeSlide() + (dx < 0 ? 1 : -1));
  }
  onTouchCancel(): void { this.swipeStart = null; }
  imageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    if (!image.src.endsWith('image-fallback.svg')) {
      image.removeAttribute('srcset');
      image.closest('picture')?.querySelectorAll('source').forEach(source => source.removeAttribute('srcset'));
      image.src = '/image-fallback.svg';
    }
  }
}
