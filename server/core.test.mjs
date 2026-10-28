import assert from 'node:assert/strict';
import { test } from 'node:test';
import products from './seed-products.json' with { type: 'json' };
import { validCategoryLabels, validProduct, validStyleSection } from './core.mjs';

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

test('valida las tarjetas editables de Explora por estilo', () => {
  const section = { title: 'Explora por estilo', linkLabel: 'Ver catálogo', cards: [
    { label: 'Polos oversize', category: 'oversize', image: '/images/productos/athletic-67-frente.jpeg', alt: 'Polo marfil' },
    { label: 'Conjuntos', category: 'conjuntos', image: '/api/images/123e4567-e89b-12d3-a456-426614174000', alt: 'Conjunto infantil' },
  ] };
  assert.equal(validStyleSection(section), true);
  assert.equal(validStyleSection({ ...section, cards: [...section.cards, ...section.cards, section.cards, section.cards] }), false);
  assert.equal(validStyleSection({ ...section, cards: [{ ...section.cards[0], image: 'https://example.com/imagen.jpg' }] }), false);
  assert.equal(validStyleSection({ ...section, cards: [{ ...section.cards[0], category: 'desconocida' }] }), false);
});

test('acepta solo los diez nombres de categoría editables', () => {
  const labels = {
    'polos-nino': 'Polos Niño', 'polos-nina': 'Polos Niña', 'sudaderas-nino': 'Sudaderas Niño',
    'pantalones-nino': 'Pantalones Niño', 'casacas-nina': 'Casacas Niña',
    'joggers-basicos': 'Joggers y Básicos', accesorios: 'Accesorios', ofertas: 'Ofertas',
    conjuntos: 'Conjuntos', 'short-bermudas': 'Short y Bermudas',
  };
  assert.equal(validCategoryLabels(labels), true);
  assert.equal(validCategoryLabels({ ...labels, ofertas: '  ' }), false);
  assert.equal(validCategoryLabels({ ...labels, desconocida: 'Otra' }), false);
  assert.equal(validCategoryLabels({ ...labels, conjuntos: 'x'.repeat(61) }), false);
});
