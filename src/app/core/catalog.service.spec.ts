import { TestBed } from '@angular/core/testing';
import { CatalogService } from './catalog.service';
import { PRODUCTS } from '../data/catalog.data';

describe('catálogo local', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('muestra las prendas de inmediato sin consultar servicios externos', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    try {
      const catalog = TestBed.inject(CatalogService);
      expect(catalog.products()).toHaveLength(PRODUCTS.length);
      expect(catalog.getById('polo-oversize-athletic-67')?.name).toBe('Polo Oversize Athletic 67');
      expect(catalog.getById('vestido-alma')).toBeUndefined();
      expect(catalog.settings().whatsappNumber).toBe('51982226022');
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      fetchSpy.mockRestore();
    }
  });
});
