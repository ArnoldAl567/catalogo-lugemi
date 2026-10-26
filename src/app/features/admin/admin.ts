import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { Product, ProductImage, ProductVariant } from '../../models/store.models';
import { MENU_CATEGORIES } from '../../data/shop-navigation';

interface ColorDraft { id: string; name: string; hex: string; sizes: string; stock: number; front: string; back: string; }
interface ProductDraft { id: string; name: string; categoryId: string; price: number; description: string; material: string; details: string; colors: ColorDraft[]; featured: boolean; stockUnconfirmed: boolean; }

function draftFrom(product: Product): ProductDraft {
  const colors = [...new Set(product.variants.map(variant => variant.colorId))].map(id => {
    const variants = product.variants.filter(variant => variant.colorId === id);
    const image = (view: 'full' | 'detail') => product.images.find(item => item.colorId === id && item.view === view)?.url ?? '';
    return { id, name: variants[0].colorName, hex: variants[0].hex, sizes: variants.map(variant => variant.size).join(', '), stock: variants[0].stock, front: image('full'), back: image('detail') };
  });
  return { id: product.id, name: product.name, categoryId: product.categoryId, price: product.price, description: product.description, material: product.material, details: product.details.join('\n'), colors, featured: !!product.featured, stockUnconfirmed: !!product.stockUnconfirmed };
}
function blank(): ProductDraft {
  return { id: '', name: '', categoryId: 'polos-nino', price: 35, description: '', material: '', details: '', colors: [{ id: 'marfil', name: 'Marfil', hex: '#F2EDE1', sizes: '6, 8, 10, 12, 14, 16', stock: 99, front: '', back: '' }], featured: true, stockUnconfirmed: true };
}

@Component({ selector: 'app-admin', standalone: true, imports: [FormsModule], templateUrl: './admin.html', styleUrl: './admin.css' })
export class Admin {
  readonly menuCategories = MENU_CATEGORIES;
  categoryLabel(id: string): string { return MENU_CATEGORIES.find(item => item.id === id)?.label ?? (id === 'raglan' ? 'Polo raglán' : id === 'oversize' ? 'Polo oversize' : id); }
  readonly catalog = inject(CatalogService);
  readonly authenticated = signal(false);
  readonly configured = signal(true);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly editing = signal<ProductDraft | null>(null);
  password = '';
  private original: Product | undefined;

  constructor() { void this.checkSession(); }

  private async checkSession(): Promise<void> {
    try {
      const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
      const data = await response.json() as { authenticated: boolean; configured: boolean };
      this.authenticated.set(data.authenticated);
      this.configured.set(data.configured);
    } catch { this.configured.set(false); }
  }

  async login(): Promise<void> {
    this.busy.set(true); this.message.set('');
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: this.password }) });
      if (!response.ok) throw new Error((await response.json()).error ?? 'No se pudo ingresar');
      this.password = '';
      this.authenticated.set(true);
      await this.catalog.refresh();
    } catch (error) { this.message.set((error as Error).message); }
    finally { this.busy.set(false); }
  }

  async logout(): Promise<void> {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    this.authenticated.set(false); this.editing.set(null);
  }

  edit(product: Product): void { this.original = product; this.editing.set(draftFrom(product)); this.message.set(''); }
  create(): void { this.original = undefined; this.editing.set(blank()); this.message.set(''); }
  cancel(): void { this.editing.set(null); this.message.set(''); }
  addColor(): void { this.editing()?.colors.push({ id: '', name: '', hex: '#182D4D', sizes: '6, 8, 10, 12, 14, 16', stock: 99, front: '', back: '' }); }
  removeColor(index: number): void { this.editing()?.colors.splice(index, 1); }

  async upload(event: Event, color: ColorDraft, view: 'front' | 'back'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2_000_000) { this.message.set('Usa una imagen JPG, PNG o WebP de hasta 2 MB.'); return; }
    this.busy.set(true); this.message.set('');
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.onerror = reject; reader.readAsDataURL(file);
      });
      const response = await fetch('/api/admin/images', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mimeType: file.type, base64 }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'No se pudo subir la imagen');
      color[view] = result.url;
      this.message.set('Imagen cargada. Guarda el producto para publicarla.');
    } catch (error) { this.message.set((error as Error).message); }
    finally { this.busy.set(false); input.value = ''; }
  }

  async save(): Promise<void> {
    const draft = this.editing(); if (!draft) return;
    this.message.set('');
    const id = this.original?.id ?? draft.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!id || !draft.name.trim() || !draft.description.trim() || draft.colors.length === 0) { this.message.set('Completa nombre, descripción y al menos un color.'); return; }
    if (draft.colors.some(color => !color.id.trim() || !color.name.trim() || !color.sizes.trim() || !color.front)) { this.message.set('Cada color necesita nombre, tallas e imagen frontal.'); return; }
    const images: ProductImage[] = draft.colors.flatMap(color => [
      { url: color.front, alt: `${draft.name}, vista frontal en ${color.name}`, colorId: color.id, view: 'full' as const },
      ...(color.back ? [{ url: color.back, alt: `${draft.name}, vista posterior en ${color.name}`, colorId: color.id, view: 'detail' as const }] : []),
    ]);
    const variants: ProductVariant[] = draft.colors.flatMap(color => [...new Set(color.sizes.split(',').map(size => size.trim()).filter(Boolean))].map(size => ({ colorId: color.id, colorName: color.name, hex: color.hex, size, stock: Number(color.stock) || 0 })));
    const product: Product = { ...(this.original ?? {}), id, name: draft.name.trim(), categoryId: draft.categoryId, audience: 'infantil', price: Number(draft.price), description: draft.description.trim(), material: draft.material.trim(), details: draft.details.split('\n').map(line => line.trim()).filter(Boolean), images, variants, featured: draft.featured, stockUnconfirmed: draft.stockUnconfirmed, contents: '1 polo', createdAt: this.original?.createdAt ?? Date.now() };
    this.busy.set(true);
    try {
      const response = await fetch('/api/admin/products', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(product) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'No se pudo guardar');
      await this.catalog.refresh(); this.original = product; this.editing.set(null); this.message.set('Producto publicado en la tienda.');
    } catch (error) { this.message.set((error as Error).message); }
    finally { this.busy.set(false); }
  }

  async remove(product: Product): Promise<void> {
    if (!confirm(`¿Quitar ${product.name} de la tienda?`)) return;
    this.busy.set(true);
    try {
      const response = await fetch(`/api/admin/products/${encodeURIComponent(product.id)}`, { method: 'DELETE', credentials: 'same-origin' });
      if (!response.ok) throw new Error('No se pudo quitar el producto');
      await this.catalog.refresh(); this.editing.set(null); this.message.set('Producto quitado de la tienda.');
    } catch (error) { this.message.set((error as Error).message); }
    finally { this.busy.set(false); }
  }
}
