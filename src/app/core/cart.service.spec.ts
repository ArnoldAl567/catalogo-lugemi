import { TestBed } from '@angular/core/testing';
import { PRODUCTS } from '../data/catalog.data';
import { CartService } from './cart.service';
import { CatalogService } from './catalog.service';

describe('carrito persistente', () => {
  const product=PRODUCTS[0], variant=product.variants[0];
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({providers:[{provide:CatalogService,useValue:{getById:(id:string)=>PRODUCTS.find(item=>item.id===id)}}]});
  });
  afterEach(()=>TestBed.resetTestingModule());
  it('agrupa variantes idénticas y calcula importes decimales en céntimos', () => {
    const cart=TestBed.inject(CartService);
    expect(cart.add(product,variant.colorId,variant.size,1)).toBe(true);
    expect(cart.add(product,variant.colorId,variant.size,2)).toBe(true);
    expect(cart.items()).toHaveLength(1);
    expect(cart.count()).toBe(3);
    expect(cart.total()).toBe(105);
    expect(cart.add(product,variant.colorId,variant.size,-1)).toBe(false);
    expect(cart.add(product,variant.colorId,variant.size,999)).toBe(false);
  });
  it('separa tallas y modelos y permite actualizar y eliminar', () => {
    const cart=TestBed.inject(CartService), other=product.variants[1], another=PRODUCTS[1];
    cart.add(product,variant.colorId,variant.size,1);
    cart.add(product,other.colorId,other.size,1);
    cart.add(another,another.variants[0].colorId,another.variants[0].size,1);
    expect(cart.items()).toHaveLength(3);
    expect(cart.update(cart.items()[0],2)).toBe(true);
    expect(cart.total()).toBe(140);
    expect(cart.update(cart.items()[0],999)).toBe(false);
    cart.remove(cart.items()[1]);
    expect(cart.count()).toBe(3);
  });
  it('restaura la selección guardada y descarta datos malformados', () => {
    localStorage.setItem('maison-mode-cart-v1',JSON.stringify([{productId:product.id,colorId:variant.colorId,size:variant.size,quantity:2},{productId:product.id,quantity:-2}]));
    const cart=TestBed.inject(CartService);
    expect(cart.items()).toHaveLength(1);
    expect(cart.total()).toBe(70);
  });
  it('no falla si el almacenamiento contiene JSON corrupto', () => {
    localStorage.setItem('maison-mode-cart-v1','not json');
    expect(TestBed.inject(CartService).items()).toEqual([]);
  });
  it('elimina productos retirados después de cargar el catálogo', () => {
    localStorage.setItem('maison-mode-cart-v1',JSON.stringify([{productId:'retirado',colorId:'marfil',size:'4 años',quantity:1}]));
    const cart=TestBed.inject(CartService);
    TestBed.tick();
    expect(cart.items()).toEqual([]);
  });
});

