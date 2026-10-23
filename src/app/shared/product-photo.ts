import { Component, input } from '@angular/core';
import { ProductImage } from '../models/store.models';

@Component({
  selector: 'app-product-photo',
  standalone: true,
  template: `<img class="photo" [class.demo-detail]="image().view === 'detail' && image().url.startsWith('/images/')" [src]="image().url" [alt]="image().alt" loading="lazy" decoding="async" (error)="onError($event)" />`,
  styles: `:host{display:block;overflow:hidden;background:#EDE5DA}.photo{display:block;width:100%;height:100%;object-fit:contain;background:#EDE5DA}.demo-detail{transform:scale(1.2)}`,
})
export class ProductPhoto {
  readonly image = input.required<ProductImage>();
  onError(event: Event): void { const image = event.target as HTMLImageElement; if (!image.src.endsWith('image-fallback.svg')) image.src = '/image-fallback.svg'; }
}
