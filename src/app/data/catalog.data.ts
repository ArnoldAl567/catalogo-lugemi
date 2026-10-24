import { Category, Product } from '../models/store.models';

// Colección ilustrativa: fotos generadas, precios y existencias referenciales.
// Catálogo local activo mientras no se conecte un inventario real.
export const CATEGORIES: Category[] = [
  ['recien-nacidos', 'Recién nacidos'], ['bodies', 'Bodies y conjuntos'],
  ['vestidos', 'Vestidos'], ['ropa-comoda', 'Ropa cómoda'], ['accesorios', 'Accesorios'],
  ['blusas', 'Polos y blusas'], ['camisetas', 'Polos y camisetas'], ['camisas', 'Camisas'],
  ['pantalones', 'Pantalones y jeans'], ['shorts', 'Shorts'], ['joggers', 'Joggers'], ['conjuntos', 'Conjuntos'], ['abrigos', 'Casacas y chompas'],
].map(([id, name]) => ({ id, name }));

export const AUDIENCES = [{ id: 'bebes', name: 'Bebés', age: 'Sus primeros descubrimientos' }, { id: 'ninas', name: 'Niñas', age: 'Un mundo por imaginar' }, { id: 'ninos', name: 'Niños', age: 'Listos para cada aventura' }];
export const COLLECTIONS = [{ id: 'nueva', name: 'Nueva colección' }, { id: 'ocasiones', name: 'Ocasiones especiales' }, { id: 'verano', name: 'Temporada de verano' }, { id: 'invierno', name: 'Temporada de invierno' }];
const colors: Record<string, { name: string; hex: string }> = {
  marfil: { name: 'Marfil', hex: '#F0EBDF' }, salvia: { name: 'Salvia', hex: '#C8D5C2' },
  rosa: { name: 'Rosa empolvado', hex: '#E8CFCB' }, beige: { name: 'Beige', hex: '#D6C4AD' },
  marino: { name: 'Azul marino', hex: '#182D4D' }, denim: { name: 'Denim', hex: '#718FA8' },
  celeste: { name: 'Celeste', hex: '#D8E8EF' },
};
interface Seed { id: string; name: string; audience: Product['audience']; categoryId: string; price: number; colorIds: string[]; description: string; contents: string; collections: string[]; }
const seeds: Seed[] = [
  { id: 'conjunto-nube', name: 'Conjunto Nube', audience: 'bebes', categoryId: 'bodies', price: 89.90, colorIds: ['marfil', 'salvia'], description: 'Un pequeño conjunto de cárdigan y bombacho, con textura de punto y botones al frente. Para acompañar sus primeros descubrimientos.', contents: '1 cárdigan y 1 bombacho', collections: ['nueva', 'invierno'] },
  { id: 'vestido-alma', name: 'Vestido Alma bebé', audience: 'bebes', categoryId: 'vestidos', price: 79.90, colorIds: ['rosa', 'marfil'], description: 'Vestido con cuello delicado y bombacho a juego. Una silueta encantadora para las primeras celebraciones.', contents: '1 vestido y 1 bombacho', collections: ['ocasiones', 'verano'] },
  { id: 'vestido-flora', name: 'Vestido Flora', audience: 'ninas', categoryId: 'vestidos', price: 109.90, colorIds: ['rosa', 'beige'], description: 'Mangas cortas, cuello con un pequeño volante y falda fruncida. Un vestido para girar, jugar y guardar recuerdos.', contents: '1 vestido', collections: ['nueva', 'ocasiones', 'verano'] },
  { id: 'conjunto-olivia', name: 'Conjunto Olivia', audience: 'ninas', categoryId: 'conjuntos', price: 119.90, colorIds: ['salvia', 'rosa'], description: 'Blusa marfil con mangas de volantes y pantalón de silueta amplia. Dos piezas para combinar a su manera.', contents: '1 blusa y 1 pantalón', collections: ['nueva', 'verano'] },
  { id: 'conjunto-leo', name: 'Conjunto Leo', audience: 'ninos', categoryId: 'camisas', price: 99.90, colorIds: ['beige', 'celeste'], description: 'Camisa marfil de cuello redondo y short a juego con sus días de aventura. Un conjunto de líneas sencillas y detalles especiales.', contents: '1 camisa y 1 short', collections: ['nueva', 'ocasiones', 'verano'] },
  { id: 'conjunto-milo', name: 'Conjunto Milo', audience: 'ninos', categoryId: 'camisetas', price: 89.90, colorIds: ['salvia', 'celeste'], description: 'Polo de manga corta y pantalón beige: un dúo relajado para pequeños exploradores y tardes de juego.', contents: '1 polo y 1 pantalón', collections: ['verano'] },
  { id: 'casaca-bosque', name: 'Casaca Bosque', audience: 'ninos', categoryId: 'abrigos', price: 139.90, colorIds: ['salvia', 'beige'], description: 'Casaca infantil con capucha, bolsillos y cierre frontal. Una capa para acompañar sus paseos en días frescos.', contents: '1 casaca', collections: ['nueva', 'invierno'] },
  { id: 'cardigan-luna', name: 'Cárdigan Luna', audience: 'ninas', categoryId: 'abrigos', price: 99.90, colorIds: ['rosa', 'marfil'], description: 'Cárdigan de punto con botones y cuello redondo. Un toque delicado sobre sus conjuntos favoritos.', contents: '1 cárdigan', collections: ['invierno'] },
  {"id":"polo-pique-clasico","name":"Polo piqué clásico","audience":"ninos","categoryId":"camisetas","price":59.9,"colorIds":["marino"],"description":"Polo azul marino de manga corta, cuello con botones y un pequeño bordado de oso. Una prenda sencilla para combinar con jeans o shorts.","contents":"1 polo","collections":["nueva","verano"]},
  {"id":"polo-pique-marfil","name":"Polo piqué rayas","audience":"ninos","categoryId":"camisetas","price":59.9,"colorIds":["marfil"],"description":"Polo marfil de manga corta con detalles azul marino en el cuello y los puños. Un diseño para acompañar sus días de juego.","contents":"1 polo","collections":["nueva","verano"]},
  {"id":"short-denim-aventura","name":"Short denim","audience":"ninos","categoryId":"shorts","price":69.9,"colorIds":["denim"],"description":"Short infantil de jean azul con bolsillos cargo y cierre frontal. Una silueta cómoda para combinar con sus polos favoritos.","contents":"1 short","collections":["nueva","verano"]},
  {"id":"short-drill-arena","name":"Short drill","audience":"ninos","categoryId":"shorts","price":69.9,"colorIds":["beige"],"description":"Short infantil de color arena con bolsillos laterales cargo y botón frontal. Un básico versátil para sus aventuras.","contents":"1 short","collections":["nueva","verano"]},
  {"id":"jean-clasico","name":"Jean clásico","audience":"ninos","categoryId":"pantalones","price":89.9,"colorIds":["denim"],"description":"Pantalón infantil de jean azul de corte recto, con bolsillos y cierre frontal. Para combinar con polos, camisas o prendas de abrigo.","contents":"1 pantalón","collections":["nueva"]},
  {"id":"jogger-explorador","name":"Jogger explorador","audience":"ninos","categoryId":"joggers","price":79.9,"colorIds":["marino"],"description":"Jogger azul marino con cintura ajustable, bolsillos cargo y puños elásticos en los tobillos.","contents":"1 jogger","collections":["nueva","invierno"]},
];

const shopImages: Record<string, string> = {
  "polo-pique-clasico": "/images/brand/tienda-polos.webp",
  "polo-pique-marfil": "/images/brand/categoria-polos.webp",
  "short-denim-aventura": "/images/brand/categoria-jeans.webp",
  "short-drill-arena": "/images/brand/tienda-shorts.webp",
  "jean-clasico": "/images/brand/tienda-jeans.webp",
  "jogger-explorador": "/images/brand/tienda-joggers.webp",
};

export const PRODUCTS: Product[] = seeds.map((seed, index) => {
  const sizes = seed.audience === 'bebes' ? ['0–3 m', '3–6 m', '6–12 m', '12–18 m'] : ['2 años', '4 años', '6 años', '8 años'];
  return {
    ...seed, demo: true, badge: seed.collections.includes('nueva') ? 'Nuevo' : undefined,
    material: 'Composición por confirmar con la tienda',
    details: ['Modelo de demostración; fotografía ilustrativa', 'Confirma las medidas de la prenda antes de pedir', 'Sigue las instrucciones de cuidado de la etiqueta'],
    featured: true, createdAt: seeds.length - index,
    images: seed.colorIds.flatMap(colorId => ['full', 'detail'].map(view => ({
      url: shopImages[seed.id] ?? `/images/${seed.id}-${colorId}.webp`, colorId, view: view as 'full' | 'detail',
      alt: `${seed.name} en ${colors[colorId].name}${view === 'detail' ? ', acercamiento de la misma fotografía' : ''}`,
    }))),
    variants: seed.colorIds.flatMap((colorId, colorIndex) => sizes.map((size, sizeIndex) => ({
      colorId, colorName: colors[colorId].name, hex: colors[colorId].hex, size,
      stock: sizeIndex === 3 && colorIndex === 1 ? 0 : 8 - sizeIndex,
    }))),
  };
});

