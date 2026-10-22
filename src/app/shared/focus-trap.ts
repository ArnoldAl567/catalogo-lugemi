import { AfterViewInit, Directive, ElementRef, HostListener, inject, OnDestroy } from '@angular/core';

// Shared by drawers and dialogs: keyboard focus, Escape support in the host and scroll locking.
@Directive({selector: '[appFocusTrap]', standalone: true})
export class FocusTrap implements AfterViewInit, OnDestroy {
  private static openCount = 0;
  private static originalOverflow = '';
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly previous = document.activeElement as HTMLElement | null;
  private destroyed = false;
  private focusables(): HTMLElement[] {
    return Array.from(this.host.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select,textarea,[tabindex="0"]')).filter(element => element.getClientRects().length > 0);
  }
  ngAfterViewInit(): void {
    if (FocusTrap.openCount++ === 0) { FocusTrap.originalOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; }
    this.host.tabIndex = -1;
    queueMicrotask(() => { if (!this.destroyed) (this.focusables()[0] ?? this.host).focus(); });
  }
  @HostListener('keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    const elements = this.focusables(), first = elements[0], last = elements[elements.length - 1];
    if (!first) { event.preventDefault(); this.host.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || document.activeElement === this.host)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    if (--FocusTrap.openCount === 0) document.body.style.overflow = FocusTrap.originalOverflow;
    if (this.previous?.isConnected) this.previous.focus();
  }
}

