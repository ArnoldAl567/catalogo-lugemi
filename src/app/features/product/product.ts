import { Component, computed, effect, HostListener, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CatalogService } from '../../core/catalog.service';
import { CartService } from '../../core/cart.service';
import { getVariant, imagesForColor, money, productSpecifications, whatsappUrl } from '../../core/store.utils';
import { ProductCard } from '../../shared/product-card';
import { ProductPhoto } from '../../shared/product-photo';
import { FocusTrap } from '../../shared/focus-trap';

@Component({ selector: 'app-product', standalone: true, imports: [RouterLink, ProductCard, ProductPhoto, FocusTrap], templateUrl: './product.html', styleUrl: './product.css' })
export class ProductPage {
  readonly catalog = inject(CatalogService);
  readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly productId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly product = computed(() => this.catalog.getById(this.productId()));
  readonly categoryName = computed(() => this.catalog.categories().find(category => category.id === this.product()?.categoryId)?.name ?? 'Polos');
  readonly selectedColor = signal(''); readonly selectedSize = signal(''); readonly activeImage = signal(0);
  readonly quantity = signal(1); readonly error = signal(''); readonly sizeGuideOpen = signal(false); readonly zoomOpen = signal(false);
  readonly money = money;
  readonly colors = computed(() => this.product()?.variants.filter((variant, index, variants) => variants.findIndex(item => item.colorId === variant.colorId) === index) ?? []);
  readonly selectedColorName = computed(() => this.colors().find(color => color.colorId === this.selectedColor())?.colorName ?? '');
  readonly sizes = computed(() => [...new Set(this.product()?.variants.map(variant => variant.size) ?? [])]);
  readonly images = computed(() => this.product() ? imagesForColor(this.product()!, this.selectedColor()) : []);
  readonly variant = computed(() => { const product = this.product(); return product ? getVariant(product, this.selectedColor(), this.selectedSize()) : undefined; });
  readonly related = computed(() => this.product() ? this.catalog.related(this.product()!) : []);
  readonly sizeGuideUrl = computed(() => whatsappUrl(`Hola, Lugemi Kids. ¿Podrían compartirme las medidas del ${this.product()?.name ?? 'polo'}${this.selectedSize() ? ` en talla ${this.selectedSize()}` : ''}?`));
  readonly detailRows = computed(() => this.product() ? productSpecifications(this.product()!, this.categoryName()) : []);
  readonly hasMeasurements = computed(() => this.detailRows().some(row => /pecho|largo|medida/i.test(row.label)));
  private initializedProductId = '';

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.productId.set(params.get('id') ?? '');
    });
    effect(() => {
      const product = this.product();
      if (!product) return;
      if (this.initializedProductId === product.id) {
        if (!product.variants.some(variant => variant.colorId === this.selectedColor())) {
          this.selectedColor.set(product.variants[0]?.colorId ?? '');
          this.activeImage.set(0);
        }
        if (this.selectedSize() && !getVariant(product, this.selectedColor(), this.selectedSize())) this.selectedSize.set('');
        if (this.activeImage() >= this.images().length) this.activeImage.set(0);
        return;
      }
      this.initializedProductId = product.id;
      const requestedColor = this.route.snapshot.queryParamMap.get('color');
      this.selectedColor.set(product.variants.some(variant => variant.colorId === requestedColor) ? requestedColor! : (product.variants[0]?.colorId ?? ''));
      this.selectedSize.set(''); this.activeImage.set(0); this.quantity.set(1); this.error.set('');
      window.scrollTo(0, 0);
    });
    effect(() => {
      const product = this.product();
      if (product) document.title = `${product.name} | ${this.catalog.settings().name}`;
    });
    this.route.queryParamMap.subscribe(params => {
      const colorId = params.get('color');
      if (colorId && this.product()?.variants.some(variant => variant.colorId === colorId) && colorId !== this.selectedColor()) this.selectColor(colorId, false);
    });
  }
  @HostListener('window:keydown.escape') onEscape(): void { this.sizeGuideOpen.set(false); this.zoomOpen.set(false); }
  selectColor(colorId: string, updateUrl = true): void {
    if (!this.product()?.variants.some(variant => variant.colorId === colorId)) return;
    this.selectedColor.set(colorId); this.selectedSize.set(''); this.quantity.set(1); this.activeImage.set(0); this.error.set('');
    if (updateUrl) this.router.navigate([], { relativeTo: this.route, queryParams: { color: colorId }, queryParamsHandling: 'merge', replaceUrl: true });
  }
  selectSize(size: string): void { this.selectedSize.set(size); this.quantity.set(1); this.error.set(''); }
  stockFor(size: string): number { return this.product()?.variants.find(variant => variant.colorId === this.selectedColor() && variant.size === size)?.stock ?? 0; }
  changeQuantity(delta: number): void { this.quantity.set(Math.max(1, Math.min(this.variant()?.stock ?? 1, this.quantity() + delta))); }
  changeImage(delta: number): void { const count = this.images().length; if (count) this.activeImage.set((this.activeImage() + delta + count) % count); }
  private touchStart = 0;
  onTouchStart(event: TouchEvent): void { this.touchStart = event.changedTouches[0].screenX; }
  onTouchEnd(event: TouchEvent): void { const distance = event.changedTouches[0].screenX - this.touchStart; if (Math.abs(distance) > 40) this.changeImage(distance < 0 ? 1 : -1); }
  add(goToCheckout = false): void {
    const product = this.product();
    if (!product) return;
    if (!this.selectedSize()) { this.error.set('Selecciona una talla para continuar.'); return; }
    if (!this.variant()?.stock) { this.error.set('Esta combinación no está disponible.'); return; }
    if (!this.cart.add(product, this.selectedColor(), this.selectedSize(), this.quantity())) { this.error.set('La cantidad supera la disponibilidad de esta variante.'); return; }
    this.error.set('');
    if (goToCheckout) { this.cart.drawerOpen.set(false); this.router.navigate(['/checkout']); }
  }
}
