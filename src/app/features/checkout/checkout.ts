import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/cart.service';
import { CatalogService } from '../../core/catalog.service';
import { buildOrderMessage, money, validateCustomer, validateQuantity, whatsappUrl } from '../../core/store.utils';
import { CartItem, Customer } from '../../models/store.models';

@Component({ selector: 'app-checkout', standalone: true, imports: [FormsModule, RouterLink], templateUrl: './checkout.html', styleUrl: './checkout.css' })
export class Checkout {
  readonly cart = inject(CartService); readonly catalog = inject(CatalogService); readonly money = money;
  readonly errors = signal<Record<string,string>>({}); readonly submitError = signal('');
  customer: Customer = { fullName: '', phone: '', fulfillment: 'delivery', address: '', reference: '', notes: '' };
  productFor(item: CartItem) { return this.catalog.getById(item.productId); }
  colorFor(item: CartItem): string { return this.productFor(item)?.variants.find(variant => variant.colorId === item.colorId)?.colorName ?? item.colorId; }
  submit(): void {
    this.errors.set(validateCustomer(this.customer)); this.submitError.set('');
    if (Object.keys(this.errors()).length) return;
    if (!this.cart.items().length) { this.submitError.set('Añade al menos una prenda antes de continuar.'); return; }
    const invalid = this.cart.items().some(item => { const product = this.productFor(item); return !product || !validateQuantity(product, item.colorId, item.size, item.quantity); });
    if (invalid) { this.submitError.set('Algunas prendas ya no están disponibles en la cantidad elegida. Revisa el carrito.'); return; }
    if (!/^\d{10,15}$/.test(this.catalog.settings().whatsappNumber)) { this.submitError.set('La tienda aún no ha configurado su número de WhatsApp. Comunícate por otro medio.'); return; }
    try {
      const message = buildOrderMessage({ items: this.cart.items(), customer: this.customer, total: this.cart.total() }, this.catalog.products(), this.catalog.settings().name);
      window.location.assign(whatsappUrl(message, this.catalog.settings().whatsappNumber));
    } catch { this.submitError.set('No pudimos preparar el pedido. Revisa las variantes del carrito.'); }
  }
}
