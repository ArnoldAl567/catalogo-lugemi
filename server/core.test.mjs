import assert from 'node:assert/strict';
import { test } from 'node:test';
import products from './seed-products.json' with { type: 'json' };
import { validProduct } from './core.mjs';

test('acepta hasta siete detalles editables y tres fotos por prenda', () => {
  const product = {
    ...products[0],
    specifications: Array.from({ length: 7 }, (_, index) => ({ label: `Detalle ${index + 1}`, value: 'Valor' })),
    images: [...products[0].images, { ...products[0].images[0], view: 'extra' }],
  };
  assert.equal(validProduct(product), true);
  assert.equal(validProduct({ ...product, specifications: [...product.specifications, { label: 'Octavo', value: 'Valor' }] }), false);
  assert.equal(validProduct({ ...product, specifications: [{ label: '', value: 'Valor' }] }), false);
  assert.equal(validProduct({ ...product, images: [...product.images, { ...product.images[0], colorId: 'azul' }] }), false);
  assert.equal(validProduct({ ...product, images: [...product.images, product.images[0]] }), false);
});
