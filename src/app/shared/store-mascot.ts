import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

type Pose = 'sitting' | 'rising' | 'standing' | 'waving' | 'pointing' | 'sitting-down';

@Component({
  selector: 'app-store-mascot', standalone: true, imports: [RouterLink],
  templateUrl: './store-mascot.html', styleUrl: './store-mascot.css',
})
export class StoreMascot implements AfterViewInit, OnDestroy {
  @ViewChild('shell') shell?: ElementRef<HTMLElement>;
  readonly blocked = input(false);
  readonly visible = signal(true);
  readonly open = signal(false);
  readonly paused = signal(false);
  readonly reduced = signal(false);
  readonly ready = signal(false);
  readonly pose = signal<Pose>('sitting');
  readonly frame = signal(0);
  readonly spritePosition = computed(() => `${(this.frame() % 3) * 50}% ${this.frame() >= 3 ? 100 : 0}%`);
  private phaseMs = 0;
  private timer?: ReturnType<typeof setInterval>;
  private media?: MediaQueryList;
  private focused = false;
  private readonly onMotionChange = (event: MediaQueryListEvent) => {
    this.freeze(); this.reduced.set(event.matches);
  };

  constructor() {
    effect(() => { if (this.blocked()) { this.freeze(); this.open.set(false); this.focused = false; } });
  }

  ngAfterViewInit(): void {
    this.media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced.set(this.media.matches);
    this.media.addEventListener('change', this.onMotionChange);
    try {
      this.visible.set(sessionStorage.getItem('lugemi-mascot-hidden') !== 'true');
      this.paused.set(sessionStorage.getItem('lugemi-mascot-paused') === 'true');
    } catch { /* Storage is optional. */ }
    this.ready.set(true);
    this.timer = setInterval(() => this.animate(), 160);
  }

  freeze(): void { this.setPose('sitting', 0); }
  private animate(): void {
    if (!this.visible() || this.blocked() || this.paused() || this.reduced() || this.open() || this.focused || document.hidden || document.querySelector('[aria-modal="true"]')) return;
    this.phaseMs += 160;
    switch (this.pose()) {
      case 'sitting': if (this.phaseMs >= 3200) this.setPose('rising', 1); break;
      case 'rising': if (this.phaseMs >= 640) this.setPose('standing', 2); break;
      case 'standing': if (this.phaseMs >= 960) this.setPose('waving', 5); break;
      case 'waving': if (this.phaseMs >= 1600) this.setPose('pointing', 2); break;
      case 'pointing': if (this.phaseMs >= 2400) this.setPose('sitting-down', 1); break;
      case 'sitting-down': if (this.phaseMs >= 640) this.setPose('sitting', 0); break;
    }
  }
  private setPose(pose: Pose, frame: number): void {
    this.pose.set(pose); this.frame.set(frame); this.phaseMs = 0;
  }
  @HostListener('document:visibilitychange') visibilityChange(): void { if (document.hidden) this.freeze(); }
  @HostListener('document:keydown.escape') close(): void { this.open.set(false); this.focused = false; this.freeze(); }
  onFocus(): void { this.focused = true; this.freeze(); }
  onBlur(event: FocusEvent): void {
    if (!this.shell?.nativeElement.contains(event.relatedTarget as Node | null)) this.focused = false;
  }
  greet(): void {
    this.freeze(); this.open.update(value => !value);
    if (this.open() && !this.reduced() && !this.paused()) this.setPose('waving', 5);
    if (!this.open()) this.focused = false;
  }
  togglePause(): void {
    this.freeze(); this.paused.update(value => !value);
    try { sessionStorage.setItem('lugemi-mascot-paused', String(this.paused())); } catch { }
  }
  hide(): void {
    this.freeze(); this.open.set(false); this.visible.set(false); this.focused = false;
    try { sessionStorage.setItem('lugemi-mascot-hidden', 'true'); } catch { }
  }
  show(): void {
    this.visible.set(true); this.open.set(false); this.focused = false; this.freeze();
    try { sessionStorage.removeItem('lugemi-mascot-hidden'); } catch { }
  }
  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.media?.removeEventListener('change', this.onMotionChange);
  }
}
