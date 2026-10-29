import { TestBed } from '@angular/core/testing';
import { CatalogService } from './catalog.service';
import { PRODUCTS } from '../data/catalog.data';

describe('catálogo local', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('muestra las prendas de inmediato mientras carga el catálogo compartido', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const catalog = TestBed.inject(CatalogService);
      expect(catalog.products()).toHaveLength(PRODUCTS.length);
      expect(catalog.getById('polo-oversize-athletic-67')?.name).toBe('Polo Oversize Athletic 67');
      expect(catalog.getById('vestido-alma')).toBeUndefined();
      expect(catalog.settings().whatsappNumber).toBe('51982226022');
      expect(fetchSpy).toHaveBeenCalledWith('/api/products');
      expect(fetchSpy.mock.calls.filter(([url]) => url === '/api/categories')).toHaveLength(1);
    } finally {
      fetchSpy.mockRestore();
    }
  });

  it('el administrador solicita datos actuales por una ruta sin caché pública', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ products: [], enabledIds: [], labels: {}, styleSection: { title: 'Estilos', linkLabel: 'Ver todo', cards: [] } }), { status: 200 }));
    try {
      const catalog = TestBed.inject(CatalogService);
      await catalog.refresh(true);
      await catalog.refreshCategories(true);
      expect(fetchSpy).toHaveBeenCalledWith('/api/products?admin=1');
      expect(fetchSpy).toHaveBeenCalledWith('/api/categories?admin=1');
      expect(catalog.styleSection().title).toBe('Estilos');
    } finally { fetchSpy.mockRestore(); }
  });
});
