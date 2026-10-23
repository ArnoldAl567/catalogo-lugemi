import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { StoreMascot } from './store-mascot';

describe('Otto estático señalando WhatsApp', () => {
  beforeEach(() => {
    vi.useFakeTimers(); sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [StoreMascot], providers: [provideRouter([])] });
  });
  afterEach(() => {
    TestBed.resetTestingModule(); vi.useRealTimers(); vi.restoreAllMocks(); sessionStorage.clear();
  });
  const create = () => {
    const fixture = TestBed.createComponent(StoreMascot);
    fixture.detectChanges();
    return fixture;
  };
  it('conserva la imagen de pie y no inicia temporizadores de animación', () => {
    const interval = vi.spyOn(window, 'setInterval');
    const fixture = create();
    const image = () => fixture.nativeElement.querySelector('.mascot-pointing') as HTMLImageElement;
    expect(image().getAttribute('src')).toBe('/images/brand/lugemi-mascota-senala.png');
    vi.advanceTimersByTime(60000); fixture.detectChanges();
    expect(image().getAttribute('src')).toBe('/images/brand/lugemi-mascota-senala.png');
    expect(interval).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.mascot-sprite')).toBeNull();
  });
  it('abrir y cerrar la ayuda no cambia la postura ni ofrece reanudar animación', () => {
    const fixture = create(), pet = fixture.componentInstance;
    pet.greet(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mascot-pointing')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('WhatsApp');
    expect(fixture.nativeElement.textContent).not.toMatch(/animación|Pausar|Reanudar/);
    pet.close(); fixture.detectChanges();
    expect(pet.open()).toBe(false);
    expect(fixture.nativeElement.querySelector('.mascot-pointing')).not.toBeNull();
  });
  it('cierra la ayuda y se oculta cuando hay un diálogo de compra', () => {
    const fixture = create(), pet = fixture.componentInstance;
    pet.greet(); fixture.detectChanges();
    fixture.componentRef.setInput('blocked', true); fixture.detectChanges();
    expect(pet.open()).toBe(false);
    expect(fixture.nativeElement.querySelector('.mascot-shell').classList.contains('blocked')).toBe(true);
  });
  it('permite ocultar y recuperar a Otto durante la visita', () => {
    const fixture = create(), pet = fixture.componentInstance;
    pet.hide(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mascot-character')).toBeNull();
    expect(sessionStorage.getItem('lugemi-mascot-hidden')).toBe('true');
    pet.show(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mascot-pointing')).not.toBeNull();
    expect(sessionStorage.getItem('lugemi-mascot-hidden')).toBeNull();
  });
});
