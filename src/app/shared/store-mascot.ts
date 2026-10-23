import { AfterViewInit, Component, HostListener, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-store-mascot', standalone: true, imports: [RouterLink],
  templateUrl: './store-mascot.html', styleUrl: './store-mascot.css',
})
export class StoreMascot implements AfterViewInit {
  readonly blocked = input(false);
  readonly visible = signal(true);
  readonly open = signal(false);
  readonly ready = signal(false);

  constructor() {
    effect(() => { if (this.blocked()) this.open.set(false); });
  }

  ngAfterViewInit(): void {
    try {
      this.visible.set(sessionStorage.getItem('lugemi-mascot-hidden') !== 'true');
    } catch { /* Storage is optional. */ }
    this.ready.set(true);
  }

  @HostListener('document:keydown.escape') close(): void { this.open.set(false); }
  greet(): void { this.open.update(value => !value); }
  hide(): void {
    this.open.set(false); this.visible.set(false);
    try { sessionStorage.setItem('lugemi-mascot-hidden', 'true'); } catch { }
  }
  show(): void {
    this.visible.set(true); this.open.set(false);
    try { sessionStorage.removeItem('lugemi-mascot-hidden'); } catch { }
  }
}
