import { Component, computed, input } from '@angular/core';
import { ProductImage } from '../models/store.models';

@Component({
  selector: 'app-product-photo',
  standalone: true,
  template: `@if (image().quadrant && image().atlasShape) { <span class="photo" role="img" [attr.aria-label]="image().alt" [style.background-image]="'url(' + image().url + ')'" [style.background-size]="size()" [style.background-position]="position()"></span> } @else { <img class="photo" [class.demo-detail]="image().view==='detail' && image().url.startsWith('/images/')" [src]="image().url" [alt]="image().alt" loading="lazy" decoding="async" (error)="onError($event)" /> }`,
  styles: `:host{display:block;overflow:hidden;background:#EDE5DA}.photo{display:block;width:100%;height:100%;background-repeat:no-repeat;background-color:#EDE5DA}img.photo{object-fit:contain}.demo-detail{transform:scale(1.2)}`,
})
export class ProductPhoto {
  readonly image = input.required<ProductImage>();
  onError(event: Event): void { const image = event.target as HTMLImageElement; if (!image.src.endsWith('image-fallback.svg')) image.src = '/image-fallback.svg'; }
  readonly size = computed(() => {
    const image = this.image();
    if (image.atlasShape === 'tall') return image.view === 'detail' ? '260% auto' : '200% auto';
    return image.view === 'detail' ? 'auto 260%' : 'auto 200%';
  });
  readonly position = computed(() => {
    const { atlasShape, quadrant, view } = this.image();
    if (!quadrant || !atlasShape) return 'center';
    const right = quadrant.endsWith('right');
    const bottom = quadrant.startsWith('bottom');
    if (view === 'detail') {
      const x = atlasShape === 'wide' ? (right ? '85%' : '15%') : (right ? '90%' : '10%');
      const y = atlasShape === 'tall' ? (bottom ? '86%' : '14%') : (bottom ? '90%' : '10%');
      return `${x} ${y}`;
    }
    const x = atlasShape === 'wide' ? (right ? '89%' : '11%') : atlasShape === 'portrait' ? (right ? '96%' : '4%') : (right ? '100%' : '0%');
    const y = atlasShape === 'tall' ? (bottom ? '93%' : '7%') : (bottom ? '100%' : '0%');
    return `${x} ${y}`;
  });
}
