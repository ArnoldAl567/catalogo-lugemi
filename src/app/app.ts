import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from './core/cart.service';
import { CatalogService } from './core/catalog.service';
import { mainImageForColor, money } from './core/store.utils';
import { CartItem } from './models/store.models';
import { ProductPhoto } from './shared/product-photo';
import { FocusTrap } from './shared/focus-trap';
import { StoreMascot } from './shared/store-mascot';

@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule, ProductPhoto, FocusTrap, StoreMascot], templateUrl: './app.html', styleUrl: './app.css' })
export class App {
  readonly cart = inject(CartService);
  readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);
  readonly config = this.catalog.settings;
  readonly scrolled = signal(false);
  readonly mobileOpen = signal(false);
  readonly searchOpen = signal(false);
  searchTerm = '';
  readonly money = money;
  @HostListener('window:scroll') onScroll(): void { this.scrolled.set(window.scrollY > 20); }
  @HostListener('window:keydown.escape') onEscape(): void { this.cart.drawerOpen.set(false); this.mobileOpen.set(false); this.searchOpen.set(false); }
  closeNavigation(): void { this.mobileOpen.set(false); this.searchOpen.set(false); }
  submitSearch(): void { this.router.navigate(['/catalogo'], { queryParams: { buscar: this.searchTerm.trim() || null } }); this.closeNavigation(); }
  productFor(item: CartItem) { return this.catalog.getById(item.productId); }
  imageFor(item: CartItem) { const product = this.productFor(item); return product ? mainImageForColor(product, item.colorId) : undefined; }
  colorFor(item: CartItem): string { return this.productFor(item)?.variants.find(variant => variant.colorId === item.colorId)?.colorName ?? item.colorId; }
  changeQuantity(item: CartItem, delta: number): void { if (item.quantity + delta < 1) this.cart.remove(item); else this.cart.update(item, item.quantity + delta); }
}
