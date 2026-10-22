import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models/store.models';
import { imagesForColor, money } from '../core/store.utils';
import { CatalogService } from '../core/catalog.service';
import { ProductPhoto } from './product-photo';
import { AUDIENCES } from '../data/catalog.data';

@Component({
  selector: 'app-product-card', standalone: true, imports: [RouterLink, ProductPhoto],
  template: `
    <article class="product-card">
      <a [routerLink]="['/producto', product().id]" [queryParams]="{color:selectedColor()}" class="product-visual" [attr.aria-label]="'Ver ' + product().name + ' en ' + selectedColorName()">
        @if (images()[0]; as photo) { <app-product-photo [image]="photo" class="main-image" /> }
        @if (images()[1]; as detail) { <app-product-photo [image]="detail" class="alternate-image" /> }
        @if (product().badge) { <span class="product-badge">{{ product().badge }}</span> }
        <span class="image-cta">Descubrir la prenda <span>↗</span></span>
      </a>
      <div class="product-caption"><span class="product-category">{{ audienceName() }} · {{ categoryName() }}</span>
        <a [routerLink]="['/producto', product().id]" [queryParams]="{color:selectedColor()}" class="product-name">{{ product().name }}</a>
        <div class="product-price"><strong>{{ money(product().price) }}</strong>@if (product().previousPrice) { <s>{{ money(product().previousPrice!) }}</s> }</div>
        <div class="product-colors" role="group" [attr.aria-label]="'Elegir color de ' + product().name">@for (color of colors(); track color.colorId) {
          <button type="button" [class.selected]="selectedColor()===color.colorId" [attr.aria-label]="'Mostrar ' + product().name + ' en ' + color.colorName" [attr.aria-pressed]="selectedColor()===color.colorId" [title]="color.colorName" (click)="manualColor.set(color.colorId)"><span [style.background]="color.hex"></span></button>
        }<span class="color-label">{{ selectedColorName() }}</span></div>
        <p class="product-sizes">{{ sizes().join(' · ') }}</p>
        <div class="card-actions"><a [routerLink]="['/producto', product().id]" [queryParams]="{color:selectedColor()}">Ver detalles <span>↗</span></a><a class="choose-variant" [routerLink]="['/producto', product().id]" [queryParams]="{color:selectedColor()}" [attr.aria-label]="'Elegir talla y añadir ' + product().name" title="Elegir talla y añadir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3M9 14h6M12 11v6"/></svg></a></div>
      </div>
    </article>
  `,
  styles: `
    :host{display:block;min-width:0}.product-card{height:100%}.product-visual{display:block;position:relative;aspect-ratio:4/5;overflow:hidden;background:#EDE5DA;border:1px solid #e8e1d7}.product-visual app-product-photo{position:absolute;inset:0;transition:transform .65s,opacity .5s}.alternate-image{opacity:0}.product-visual:hover .alternate-image,.product-visual:focus-visible .alternate-image{opacity:1}.product-visual:hover .main-image{transform:scale(1.025)}.product-badge{position:absolute;left:.8rem;top:.8rem;background:#FAF8F5ec;font-size:.53rem;letter-spacing:.12em;text-transform:uppercase;padding:.45rem .65rem;color:#78695F}.image-cta{position:absolute;bottom:0;left:0;right:0;background:#faf8f5ed;padding:1rem;display:flex;justify-content:space-between;font-size:.63rem;letter-spacing:.08em;transform:translateY(100%);transition:transform .3s}.product-visual:hover .image-cta,.product-visual:focus-visible .image-cta{transform:none}.product-caption{padding-top:1.15rem}.product-category{font-size:.53rem;letter-spacing:.12em;text-transform:uppercase;color:#78695F}.product-name{font-family:var(--font-serif);display:block;font-size:1.13rem;margin:.3rem 0 .5rem;line-height:1.35}.product-name:hover{text-decoration:underline;text-underline-offset:3px}.product-price{display:flex;gap:.65rem;align-items:center;font-size:.8rem}.product-price strong{font-weight:500}.product-price s{color:#85796e;font-size:.7rem}.product-colors{display:flex;align-items:center;margin-top:.6rem;gap:.05rem}.product-colors button{width:32px;height:32px;padding:6px;border:1px solid transparent;border-radius:50%;background:transparent}.product-colors button.selected{border-color:#A08A78}.product-colors button>span{display:block;width:100%;height:100%;border-radius:50%;border:1px solid #ad9f8e80}.color-label{font-size:.56rem;color:#78695F;margin-left:.45rem}.product-sizes{font-size:.61rem;line-height:1.6;color:#78695F;margin:.4rem 0 .7rem;min-height:1rem}.card-actions{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #DCD2C7}.card-actions>a:first-child{font-size:.61rem;letter-spacing:.07em;display:flex;justify-content:space-between;gap:1.5rem;padding:.8rem 0}.choose-variant{width:40px;height:40px;display:grid;place-items:center}.choose-variant svg{width:21px;height:21px}.card-actions a:hover{color:#A07E72}@media(max-width:600px){.product-badge{left:.5rem;top:.5rem;font-size:.47rem;padding:.35rem .45rem}.product-caption{padding-top:.8rem}.product-name{font-size:1rem}.product-category{font-size:.47rem;letter-spacing:.06em}.product-price{font-size:.77rem}.color-label{display:none}.product-sizes{font-size:.55rem;min-height:1.7rem}.product-colors button{width:36px;height:36px;padding:8px}.card-actions>a:first-child{font-size:.57rem;gap:.4rem}.product-visual{aspect-ratio:3/4}}
  `
})
export class ProductCard {
  readonly product = input.required<Product>();
  readonly preferredColor = input('');
  readonly manualColor = linkedSignal(() => this.preferredColor());
  readonly money = money;
  private readonly catalog = inject(CatalogService);
  readonly audienceName = computed(() => AUDIENCES.find(item => item.id === this.product().audience)?.name ?? '');
  readonly categoryName = computed(() => this.catalog.categories().find(item => item.id === this.product().categoryId)?.name ?? 'Prendas');
  readonly colors = computed(() => this.product().variants.filter((variant, index, variants) => variants.findIndex(item => item.colorId === variant.colorId) === index));
  readonly selectedColor = computed(() => {
    const candidate = this.manualColor() || this.preferredColor();
    return this.colors().some(color => color.colorId === candidate) ? candidate : (this.colors()[0]?.colorId ?? '');
  });
  readonly selectedColorName = computed(() => this.colors().find(color => color.colorId === this.selectedColor())?.colorName ?? '');
  readonly sizes = computed(() => [...new Set(this.product().variants.filter(variant => variant.colorId === this.selectedColor() && variant.stock > 0).map(variant => variant.size))]);
  readonly images = computed(() => imagesForColor(this.product(), this.selectedColor()));
}

