import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'LUGEMI KIDS | Boutique infantil', loadComponent: () => import('./features/home/home').then(m => m.Home) },
  { path: 'catalogo', title: 'Catálogo | LUGEMI KIDS', loadComponent: () => import('./features/catalog/catalog').then(m => m.Catalog) },
  { path: 'producto/:id', loadComponent: () => import('./features/product/product').then(m => m.ProductPage) },
  { path: 'carrito', title: 'Mi carrito | LUGEMI KIDS', loadComponent: () => import('./features/cart/cart').then(m => m.CartPage) },
  { path: 'checkout', title: 'Finalizar pedido | LUGEMI KIDS', loadComponent: () => import('./features/checkout/checkout').then(m => m.Checkout) },
  { path: 'contacto', title: 'Contacto | LUGEMI KIDS', loadComponent: () => import('./features/contact/contact').then(m => m.Contact) },
  { path: '**', redirectTo: '' },
];
