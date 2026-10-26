export const SHOP_CATEGORIES = [
  { label: 'Polos oversize', category: 'oversize', image: '/images/productos/athletic-67-frente.jpeg', alt: 'Polo oversize Athletic 67 marfil, vista frontal' },
  { label: 'Polos raglán', category: 'raglan', image: '/images/productos/lion-frente.jpeg', alt: 'Polo raglán Lion con mangas terracota, vista frontal' },
];

// The circle positions use the category artwork supplied for the store.
export const MENU_CATEGORIES = [
  { id: 'polos-nino', label: 'Polos Niño', x: '0%', y: '18%' },
  { id: 'polos-nina', label: 'Polos Niña', x: '25%', y: '53%' },
  { id: 'sudaderas-nino', label: 'Sudaderas Niño', x: '25%', y: '18%' },
  { id: 'pantalones-nino', label: 'Pantalones Niño', x: '50%', y: '18%' },
  { id: 'casacas-nina', label: 'Casacas Niña', x: '75%', y: '18%' },
  { id: 'joggers-basicos', label: 'Joggers y Básicos', x: '75%', y: '53%' },
  { id: 'accesorios', label: 'Accesorios', x: '0%', y: '88%' },
  { id: 'ofertas', label: 'Ofertas', x: '75%', y: '88%' },
  { id: 'conjuntos', label: 'Conjuntos', x: '100%', y: '18%' },
  { id: 'short-bermudas', label: 'Short y Bermudas', x: '100%', y: '53%' },
] as const;
