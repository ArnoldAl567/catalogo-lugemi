import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { CatalogService } from '../../core/catalog.service';
import { PRODUCTS } from '../../data/catalog.data';
import { Product } from '../../models/store.models';
import { Admin } from './admin';

describe('límites del administrador', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  function setup(product: Product) {
    const catalog = {
      products: signal([product]),
      allMenuCategories: signal([{ id: 'polos-nino', label: 'Polos Niño' }]),
      refresh: vi.fn(async () => {}),
    };
    TestBed.configureTestingModule({ providers: [{ provide: CatalogService, useValue: catalog }] });
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ configured: true, authenticated: false }), { status: 200 }));
    const admin = TestBed.runInInjectionContext(() => new Admin());
    return { admin, catalog, fetchSpy };
  }

  it('abre y guarda las cuatro imágenes y mantiene la cuarta al editar de nuevo', async () => {
    const original = PRODUCTS[0];
    const product: Product = {
      ...original,
      images: [
        ...original.images,
        { ...original.images[0], url: '/images/productos/tercera.jpeg', view: 'extra' },
        { ...original.images[0], url: '/images/productos/cuarta.jpeg', view: 'extra2' },
      ],
    };
    const { admin, fetchSpy } = setup(product);
    admin.edit(product);
    expect(admin.editing()!.colors[0].fourth).toBe('/images/productos/cuarta.jpeg');
    expect(admin.imageCount(admin.editing()!)).toBe(4);
    await admin.save();
    const save = fetchSpy.mock.calls.find(([url]) => url === '/api/admin/products');
    expect(save).toBeDefined();
    const saved: Product = JSON.parse(save![1]!.body as string);
    expect(saved.images).toHaveLength(4);
    expect(saved.images[3].view).toBe('extra2');
    admin.edit(saved);
    expect(admin.editing()!.colors[0].fourth).toBe('/images/productos/cuarta.jpeg');
  });

  it('bloquea nuevos productos al llegar a 150', () => {
    const { admin, catalog } = setup(PRODUCTS[0]);
    catalog.products.set(Array.from({ length: 150 }, () => PRODUCTS[0]));
    admin.create();
    expect(admin.editing()).toBeNull();
    expect(admin.message()).toContain('150 productos');
    admin.edit(PRODUCTS[0]);
    expect(admin.editing()).not.toBeNull();
  });
});
