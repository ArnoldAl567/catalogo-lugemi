import { Category, Product } from '../models/store.models';

// Modelos y fotografías proporcionados por Lugemi Kids en su ficha de productos.
// La disponibilidad de cada talla se confirma al coordinar el pedido por WhatsApp.
export const CATEGORIES: Category[] = [
  { id: 'oversize', name: 'Polos oversize' },
  { id: 'raglan', name: 'Polos raglán' },
];

export const AUDIENCES = [{ id: 'infantil', name: 'Infantil', age: 'Tallas 6 a 16' }];

const sizes = ['6', '8', '10', '12', '14', '16'];

interface CatalogModel {
  id: string;
  name: string;
  categoryId: 'oversize' | 'raglan';
  colorId: string;
  colorName: string;
  hex: string;
  front: string;
  back: string;
  description: string;
  material: string;
  details: string[];
}

const models: CatalogModel[] = [
  {
    id: 'polo-oversize-athletic-67', name: 'Polo Oversize Athletic 67', categoryId: 'oversize',
    colorId: 'marfil', colorName: 'Marfil', hex: '#F2EDE1', front: 'athletic-67-frente', back: 'athletic-67-espalda',
    description: 'Polo oversize marfil con el número 67 al frente y gráfico Lugemi Athletic Club en la espalda. Su tela Jersey Pima es suave, ligera y fresca.',
    material: 'Jersey Pima', details: ['Manga corta y silueta oversize', 'Estampados al frente y en la espalda', 'Costuras recubiertas para mayor durabilidad'],
  },
  {
    id: 'polo-oversize-move', name: 'Polo Oversize Move', categoryId: 'oversize',
    colorId: 'olivo', colorName: 'Verde olivo', hex: '#7A853E', front: 'move-frente', back: 'move-espalda',
    description: 'Polo oversize verde olivo con estampado Move Your Way al frente y un detalle gráfico en la espalda. Confeccionado en Jersey Pima suave, ligero y fresco.',
    material: 'Jersey Pima', details: ['Manga corta y silueta oversize', 'Estampados al frente y en la espalda', 'Costuras recubiertas para mayor durabilidad'],
  },
  {
    id: 'polo-oversize-space', name: 'Polo Oversize Space', categoryId: 'oversize',
    colorId: 'marino', colorName: 'Azul marino', hex: '#182D4D', front: 'space-frente', back: 'space-espalda',
    description: 'Polo oversize azul marino con pequeño planeta al frente y un estampado espacial de astronauta en la espalda. Su tela Jersey Pima es suave, ligera y fresca.',
    material: 'Jersey Pima', details: ['Manga corta y silueta oversize', 'Estampado espacial en la espalda', 'Costuras recubiertas para mayor durabilidad'],
  },
  {
    id: 'polo-oversize-fire', name: 'Polo Oversize Fire', categoryId: 'oversize',
    colorId: 'arena', colorName: 'Arena', hex: '#CCBDA7', front: 'fire-frente', back: 'fire-espalda',
    description: 'Polo oversize color arena con estampado Find Your Fire al frente y detalle Lugemi en la espalda. Confeccionado en Jersey Pima suave, ligero y fresco.',
    material: 'Jersey Pima', details: ['Manga corta y silueta oversize', 'Estampados al frente y en la espalda', 'Costuras recubiertas para mayor durabilidad'],
  },
  {
    id: 'polo-raglan-lion', name: 'Polo raglán Lion', categoryId: 'raglan',
    colorId: 'terracota', colorName: 'Marfil y terracota', hex: '#AF5135', front: 'lion-frente', back: 'lion-espalda',
    description: 'Polo raglán de cuerpo marfil, mangas terracota y cuello azul marino. Su estampado frontal muestra un león con el mensaje Find Your Power. Tela Jersey Pima suave, ligera y fresca.',
    material: 'Jersey Pima', details: ['Mangas cortas de corte raglán', 'Estampado de león al frente', 'Costuras recubiertas para mayor durabilidad'],
  },
  {
    id: 'polo-raglan-skate', name: 'Polo raglán Skate', categoryId: 'raglan',
    colorId: 'verde', colorName: 'Marfil y verde', hex: '#596851', front: 'skate-frente', back: 'skate-espalda',
    description: 'Polo raglán de cuerpo marfil, mangas verdes y cuello mostaza. El frente lleva tres patinetas y el mensaje Good Days Ahead.',
    material: 'Composición por confirmar con la tienda', details: ['Mangas cortas de corte raglán', 'Estampado de patinetas al frente', 'Espalda lisa'],
  },
  {
    id: 'polo-raglan-focus-game-07', name: 'Polo raglán Focus Game 07', categoryId: 'raglan',
    colorId: 'rojo', colorName: 'Blanco y rojo', hex: '#BA3B32', front: 'focus-game-07-frente', back: 'focus-game-07-espalda',
    description: 'Polo raglán blanco con mangas rojas, cuello azul marino y estampado Focus Game 07 en el frente.',
    material: 'Composición por confirmar con la tienda', details: ['Mangas cortas de corte raglán', 'Estampado Focus Game 07 al frente', 'Espalda lisa'],
  },
  {
    id: 'polo-raglan-music', name: 'Polo raglán Music', categoryId: 'raglan',
    colorId: 'azul', colorName: 'Blanco y azul marino', hex: '#1B2438', front: 'music-frente', back: 'music-espalda',
    description: 'Polo raglán blanco con mangas azul marino, cuello terracota y estampado musical en el frente. Su tela Jersey Pima es suave, ligera y fresca.',
    material: 'Jersey Pima', details: ['Mangas cortas de corte raglán', 'Estampado musical al frente', 'Costuras recubiertas para mayor durabilidad'],
  },
];

export const PRODUCTS: Product[] = models.map((model, index) => ({
  id: model.id,
  name: model.name,
  categoryId: model.categoryId,
  audience: 'infantil',
  price: 35,
  description: model.description,
  material: model.material,
  details: model.details,
  contents: '1 polo',
  featured: true,
  createdAt: models.length - index,
  stockUnconfirmed: true,
  images: [
    { url: `/images/productos/${model.front}.jpeg`, colorId: model.colorId, view: 'full', alt: `${model.name}, vista frontal` },
    { url: `/images/productos/${model.back}.jpeg`, colorId: model.colorId, view: 'detail', alt: `${model.name}, vista posterior` },
  ],
  variants: sizes.map(size => ({ colorId: model.colorId, colorName: model.colorName, hex: model.hex, size, stock: 99 })),
}));
