import { Component, input } from '@angular/core';
import { ProductImage } from '../models/store.models';

@Component({
  selector: 'app-product-photo',
  standalone: true,
  template: `<img class="photo" [src]="image().url" [alt]="image().alt" [style.object-fit]="fit()" loading="lazy" decoding="async" (error)="onError($event)" />`,
  styles: `:host{display:block;overflow:hidden;background:#EDE5DA}.photo{display:block;width:100%;height:100%;object-fit:contain;background:#EDE5DA}`,
})
export class ProductPhoto {
  readonly image = input.required<ProductImage>();
  readonly fit = input<'contain' | 'cover'>('contain');
  onError(event: Event): void { const image = event.target as HTMLImageElement; if (!image.src.endsWith('image-fallback.svg')) image.src = '/image-fallback.svg'; }
}
