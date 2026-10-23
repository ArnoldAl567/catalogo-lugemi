import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, computed, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  readonly dragging = signal(false);
  readonly travelling = signal(false);
  readonly pose = signal<'sitting' | 'rising' | 'standing' | 'walking' | 'waving' | 'sitting-down'>('sitting');
  readonly frame = signal(0);
  readonly mirroredStep = signal(false);
  readonly travelMs = signal(6000);
  readonly spritePosition = computed(() => `${(this.frame() % 3) * 50}% ${this.frame() >= 3 ? 100 : 0}%`);
  private phaseMs = 0;
  private walkStep = 0;
  readonly x = signal(16);
  readonly y = signal(160);
  readonly size = signal(112);
  readonly ready = signal(false);
  readonly viewportWidth = signal(390);
  readonly bubbleLeft = computed(() => Math.max(12, Math.min(this.x(), this.viewportWidth() - (this.viewportWidth() <= 700 ? 230 : 254) - 12)) - this.x());
  readonly bubbleTop = computed(() => Math.max(104 - this.y(), -270));
  private timer?: ReturnType<typeof setInterval>;
  private media?: MediaQueryList;
  private pointer?: {id: number; startX: number; startY: number; x: number; y: number};
  private moved = false;
  private suppressClick = false;
  private focused = false;
  private readonly onMotionChange = (event: MediaQueryListEvent) => {
    this.freeze(); this.reduced.set(event.matches);
  };

  constructor() {
    effect(() => { if (this.blocked()) { this.freeze(); this.open.set(false); } });
  }

  ngAfterViewInit(): void {
    this.media = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.reduced.set(this.media.matches);
    this.media.addEventListener('change', this.onMotionChange);
    try {
      this.visible.set(sessionStorage.getItem('lugemi-mascot-hidden') !== 'true');
      this.paused.set(sessionStorage.getItem('lugemi-mascot-paused') === 'true');
    } catch { /* The mascot also works when browser storage is unavailable. */ }
    this.resize();
    this.x.set(Math.max(16, this.viewportWidth() - this.size() - 24));
    this.y.set(this.bounds().bottom);
    this.ready.set(true);
    this.timer = setInterval(() => this.animate(), 160);
  }

  private bounds() {
    return {right: Math.max(16, this.viewportWidth() - this.size() - 16), bottom: Math.max(104, window.innerHeight - this.size() - 88)};
  }
  private place(x: number, y: number): void {
    const bounds = this.bounds();
    this.x.set(Math.min(bounds.right, Math.max(16, x)));
    this.y.set(Math.min(bounds.bottom, Math.max(104, y)));
  }
  freeze(): void {
    const rect = this.shell?.nativeElement.getBoundingClientRect();
    this.travelling.set(false);
    this.pose.set('sitting'); this.frame.set(0); this.mirroredStep.set(false); this.phaseMs = 0;
    if (rect && this.ready()) this.place(rect.left, rect.top);
  }
  private animate(): void {
    if (!this.visible() || this.blocked() || this.paused() || this.reduced() || this.dragging() || this.open() || this.focused || document.hidden || document.querySelector('[aria-modal="true"]')) {
      if (this.travelling()) this.freeze();
      return;
    }
    this.phaseMs += 160;
    switch (this.pose()) {
      case 'sitting':
        if (this.phaseMs >= 2240) this.setPose('rising', 1);
        break;
      case 'rising':
        if (this.phaseMs >= 640) this.setPose('standing', 2);
        break;
      case 'standing':
        if (this.phaseMs >= 800) this.roam();
        break;
      case 'walking': {
        const step = this.walkStep++ % 4;
        this.frame.set([3, 2, 4, 2][step]);
        this.mirroredStep.set(step === 2);
        if (this.phaseMs >= this.travelMs()) {
          this.travelling.set(false); this.setPose('waving', 5);
        }
        break;
      }
      case 'waving':
        if (this.phaseMs >= 1280) this.setPose('sitting-down', 1);
        break;
      case 'sitting-down':
        if (this.phaseMs >= 640) this.setPose('sitting', 0);
        break;
    }
  }
  private setPose(pose: 'sitting' | 'rising' | 'standing' | 'walking' | 'waving' | 'sitting-down', frame: number): void {
    this.pose.set(pose); this.frame.set(frame); this.mirroredStep.set(false); this.phaseMs = 0;
  }
  private roam(): void {
    const bounds = this.bounds();
    // Cross the viewport at varied heights, leaving navigation and quick actions clear.
    const nextX = this.x() > this.viewportWidth() / 2 ? 16 + Math.random() * bounds.right * .3 : bounds.right * .65 + Math.random() * bounds.right * .35;
    const nextY = 150 + Math.random() * Math.max(0, bounds.bottom - 150);
    this.travelMs.set(Math.round(Math.min(8000, Math.max(4000, Math.hypot(nextX - this.x(), nextY - this.y()) / 65 * 1000)) / 160) * 160);
    this.setPose('walking', 3); this.walkStep = 0;
    this.travelling.set(true);
    this.place(nextX, nextY);
  }
  @HostListener('window:resize') resize(): void {
    this.freeze(); this.viewportWidth.set(document.documentElement.clientWidth || window.innerWidth); this.size.set(window.innerWidth <= 700 ? 100 : 132);
    this.place(this.x(), this.y());
  }
  @HostListener('document:visibilitychange') visibilityChange(): void { if (document.hidden) this.freeze(); }
  @HostListener('document:keydown.escape') close(): void { this.open.set(false); this.focused = false; this.setPose('sitting', 0); }
  onFocus(): void { this.focused = true; this.freeze(); }
  onBlur(event: FocusEvent): void {
    if (!this.shell?.nativeElement.contains(event.relatedTarget as Node | null)) this.focused = false;
  }
  startDrag(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.freeze(); this.moved = false; this.suppressClick = false;
    this.pointer = {id: event.pointerId, startX: event.clientX, startY: event.clientY, x: this.x(), y: this.y()};
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  drag(event: PointerEvent): void {
    const pointer = this.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    const dx = event.clientX - pointer.startX, dy = event.clientY - pointer.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) { this.moved = true; this.dragging.set(true); this.open.set(false); }
    if (this.moved) this.place(pointer.x + dx, pointer.y + dy);
  }
  endDrag(event: PointerEvent): void {
    if (this.pointer?.id !== event.pointerId) return;
    this.suppressClick = this.moved;
    this.pointer = undefined; this.dragging.set(false);
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
  }
  greet(): void {
    if (this.suppressClick) { this.suppressClick = false; return; }
    this.freeze(); this.open.update(value => !value);
    if (this.open() && !this.reduced()) this.setPose('waving', 5);
    if (!this.open()) this.focused = false;
  }
  moveWithKeyboard(event: KeyboardEvent): void {
    const offsets: Record<string, [number, number]> = {ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24]};
    const offset = offsets[event.key];
    if (!offset) return;
    event.preventDefault(); this.freeze(); this.place(this.x() + offset[0], this.y() + offset[1]);
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
    this.visible.set(true); this.open.set(false); this.focused = false;
    this.resize(); this.y.set(this.bounds().bottom);
    try { sessionStorage.removeItem('lugemi-mascot-hidden'); } catch { }
  }
  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
    this.media?.removeEventListener('change', this.onMotionChange);
  }
}
