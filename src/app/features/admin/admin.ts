import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/catalog.service';
import { Product, ProductImage, ProductSpecification, ProductVariant } from '../../models/store.models';
import { MENU_CATEGORIES } from '../../data/shop-navigation';
import { productCategoryIds, productSpecifications } from '../../core/store.utils';

interface ColorDraft { id: string; name: string; hex: string; sizes: string; stock: number; front: string; back: string; third: string; }
interface ProductDraft { id: string; name: string; categoryIds: string[]; price: number; description: string; material: string; details: string; specifications: ProductSpecification[]; colors: ColorDraft[]; featured: boolean; stockUnconfirmed: boolean; }

function draftFrom(product: Product): ProductDraft {
  const colors = [...new Set(product.variants.map(variant => variant.colorId))].map(id => {
    const variants = product.variants.filter(variant => variant.colorId === id);
    const image = (view: 'full' | 'detail' | 'extra') => product.images.find(item => item.colorId === id && item.view === view)?.url ?? '';
    return { id, name: variants[0].colorName, hex: variants[0].hex, sizes: variants.map(variant => variant.size).join(', '), stock: variants[0].stock, front: image('full'), back: image('detail'), third: image('extra') };
  });
  const categoryName = product.categoryId === 'oversize' ? 'Polos oversize' : product.categoryId === 'raglan' ? 'Polos raglán' : MENU_CATEGORIES.find(item => item.id === product.categoryId)?.label ?? product.categoryId;
  return { id: product.id, name: product.name, categoryIds: [...productCategoryIds(product)], price: product.price, description: product.description, material: product.material, details: product.details.join('\n'), specifications: productSpecifications(product, categoryName).map(row => ({ ...row })), colors, featured: !!product.featured, stockUnconfirmed: !!product.stockUnconfirmed };
}
function blank(): ProductDraft {
  return { id: '', name: '', categoryIds: ['polos-nino'], price: 35, description: '', material: '', details: '', specifications: [], colors: [{ id: 'marfil', name: 'Marfil', hex: '#F2EDE1', sizes: '6, 8, 10, 12, 14, 16', stock: 99, front: '', back: '', third: '' }], featured: true, stockUnconfirmed: true };
}

@Component({ selector: 'app-admin', standalone: true, imports: [FormsModule], templateUrl: './admin.html', styleUrl: './admin.css' })
export class Admin {
  readonly menuCategories = MENU_CATEGORIES;
  categoryLabel(id: string): string { return MENU_CATEGORIES.find(item => item.id === id)?.label ?? (id === 'raglan' ? 'Polo raglán' : id === 'oversize' ? 'Polo oversize' : id); }
  categoriesForProduct(product: Product): string { return productCategoryIds(product).map(id => this.categoryLabel(id)).join(' · '); }
  readonly catalog = inject(CatalogService);
  readonly authenticated = signal(false);
  readonly configured = signal(true);
  readonly busy = signal(false);
  readonly message = signal('');
  readonly editing = signal<ProductDraft | null>(null);
  username = '';
  password = '';
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
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
      const response = await fetch('/api/admin/login', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: this.username.trim(), password: this.password }) });
      if (!response.ok) throw new Error((await response.json()).error ?? 'No se pudo ingresar');
      this.password = '';
      this.authenticated.set(true);
      await Promise.all([this.catalog.refresh(), this.catalog.refreshCategories()]);
    } catch (error) { this.message.set((error as Error).message); }
    finally { this.busy.set(false); }
  }

  async logout(): Promise<void> {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
    this.authenticated.set(false); this.editing.set(null);
  }

  async changePassword(): Promise<void> {
    if (this.newPassword !== this.confirmPassword) { this.message.set('Las contraseñas nuevas no coinciden.'); return; }
    this.busy.set(true); this.message.set('');
    try {
      const response = await fetch('/api/admin/change-password', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword: this.currentPassword, newPassword: this.newPassword }) });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('El servicio no está disponible. Recarga la página e inténtalo de nuevo.');
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'No se pudo cambiar la contraseña');
      this.authenticated.set(false);
      this.editing.set(null);
      this.message.set('Contraseña actualizada. Ingresa con tu nueva contraseña.');
    } catch (error) { this.message.set((error as Error).message); }
    finally { this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.busy.set(false); }
  }

  edit(product: Product): void { this.original = product; this.editing.set(draftFrom(product)); this.message.set(''); }
  create(): void { this.original = undefined; this.editing.set(blank()); this.message.set(''); }
  cancel(): void { this.editing.set(null); this.message.set(''); }
  addColor(): void { this.editing()?.colors.push({ id: '', name: '', hex: '#182D4D', sizes: '6, 8, 10, 12, 14, 16', stock: 99, front: '', back: '', third: '' }); }
  removeColor(index: number): void { this.editing()?.colors.splice(index, 1); }
  imageCount(draft: ProductDraft): number { return draft.colors.reduce((count, color) => count + Number(!!color.front) + Number(!!color.back) + Number(!!color.third), 0); }
  addSpecification(): void { const draft = this.editing(); if (draft && draft.specifications.length < 7) draft.specifications.push({ label: '', value: '' }); }
  removeSpecification(index: number): void { this.editing()?.specifications.splice(index, 1); }
  clearImage(color: ColorDraft, view: 'back' | 'third'): void { color[view] = ''; }
  toggleDraftCategory(id: string, checked: boolean): void {
    const draft = this.editing(); if (!draft) return;
    draft.categoryIds = checked ? [...draft.categoryIds, id] : draft.categoryIds.filter(value => value !== id);
  }

  async setCategoryEnabled(id: string, enabled: boolean): Promise<void> {
    const current = this.catalog.enabledCategoryIds();
    const enabledIds = enabled ? [...current, id] : current.filter(value => value !== id);
    this.busy.set(true); this.message.set('');
    try {
      const response = await fetch('/api/admin/categories', { method: 'PUT', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabledIds }) });
      const result = await response.json() as { enabledIds?: string[]; error?: string };
      if (!response.ok || !result.enabledIds) throw new Error(result.error ?? 'No se pudo actualizar la categoría');
      this.catalog.setEnabledCategoryIds(result.enabledIds);
      this.message.set(enabled ? 'Categoría visible en la tienda.' : 'Categoría oculta en la tienda.');
    } catch (error) { this.message.set((error as Error).message); }
    finally { this.busy.set(false); }
  }

  async upload(event: Event, color: ColorDraft, view: 'front' | 'back' | 'third'): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const draft = this.editing();
    if (!draft || (!color[view] && this.imageCount(draft) >= 3)) { this.message.set('Cada producto puede tener como máximo 3 imágenes.'); input.value = ''; return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2_000_000) { this.message.set('Usa una imagen JPG, PNG o WebP de hasta 2 MB.'); input.value = ''; return; }
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
    if (!id || !draft.name.trim() || !draft.description.trim() || draft.colors.length === 0 || draft.categoryIds.length === 0) { this.message.set('Completa nombre, descripción, al menos una categoría y un color.'); return; }
    if (draft.colors.some(color => !color.id.trim() || !color.name.trim() || !color.sizes.trim() || !color.front)) { this.message.set('Cada color necesita nombre, tallas e imagen frontal.'); return; }
    if (this.imageCount(draft) > 3) { this.message.set('Cada producto puede tener como máximo 3 imágenes.'); return; }
    if (draft.specifications.length > 7 || draft.specifications.some(row => !row.label.trim() || !row.value.trim())) { this.message.set('Completa el nombre y valor de cada detalle (máximo 7).'); return; }
    const images: ProductImage[] = draft.colors.flatMap(color => [
      { url: color.front, alt: `${draft.name}, vista frontal en ${color.name}`, colorId: color.id, view: 'full' as const },
      ...(color.back ? [{ url: color.back, alt: `${draft.name}, vista posterior en ${color.name}`, colorId: color.id, view: 'detail' as const }] : []),
      ...(color.third ? [{ url: color.third, alt: `${draft.name}, foto adicional en ${color.name}`, colorId: color.id, view: 'extra' as const }] : []),
    ]);
    const variants: ProductVariant[] = draft.colors.flatMap(color => [...new Set(color.sizes.split(',').map(size => size.trim()).filter(Boolean))].map(size => ({ colorId: color.id, colorName: color.name, hex: color.hex, size, stock: Number(color.stock) || 0 })));
    const primaryCategory = this.original && ['oversize', 'raglan'].includes(this.original.categoryId) && draft.categoryIds.includes('polos-nino') ? this.original.categoryId : draft.categoryIds[0];
    const specifications = draft.specifications.map(row => ({ label: row.label.trim(), value: row.value.trim() }));
    const material = specifications.find(row => row.label.toLowerCase() === 'material')?.value ?? draft.material.trim();
    const contents = specifications.find(row => row.label.toLowerCase() === 'contenido')?.value ?? this.original?.contents ?? '1 prenda';
    const product: Product = { ...(this.original ?? {}), id, name: draft.name.trim(), categoryId: primaryCategory, categoryIds: draft.categoryIds, audience: 'infantil', price: Number(draft.price), description: draft.description.trim(), material, contents, details: draft.details.split('\n').map(line => line.trim()).filter(Boolean), specifications, images, variants, featured: draft.featured, stockUnconfirmed: draft.stockUnconfirmed, createdAt: this.original?.createdAt ?? Date.now() };
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
