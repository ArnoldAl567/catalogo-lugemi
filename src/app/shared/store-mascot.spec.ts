import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { StoreMascot } from './store-mascot';

describe('mascota de la tienda', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn()})));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    TestBed.configureTestingModule({imports: [StoreMascot], providers: [provideRouter([])]});
  });
  afterEach(() => {
    TestBed.resetTestingModule(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals();
    sessionStorage.clear();
  });
  const create = () => {
    const fixture = TestBed.createComponent(StoreMascot);
    fixture.detectChanges();
    return fixture;
  };
  it('pasea automáticamente y deja de desplazarse cuando está pausada', () => {
    const fixture = create(), pet = fixture.componentInstance;
    const initial = pet.x();
    vi.advanceTimersByTime(10000);
    expect(pet.x()).not.toBe(initial);
    pet.togglePause();
    const stopped = pet.x();
    vi.advanceTimersByTime(30000);
    expect(pet.x()).toBe(stopped);
    expect(sessionStorage.getItem('lugemi-mascot-paused')).toBe('true');
  });
  it('respeta movimiento reducido y se detiene al abrir el carrito', () => {
    const fixture = create(), pet = fixture.componentInstance;
    pet.reduced.set(true);
    const initial = pet.x();
    vi.advanceTimersByTime(10000);
    expect(pet.x()).toBe(initial);
    pet.reduced.set(false);
    fixture.componentRef.setInput('blocked', true);
    fixture.detectChanges();
    const blocked = pet.x();
    vi.advanceTimersByTime(10000);
    expect(pet.x()).toBe(blocked);
  });
  it('mantiene al osito dentro de la pantalla al moverlo con teclado', () => {
    const pet = create().componentInstance;
    for (let i = 0; i < 100; i++) pet.moveWithKeyboard(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
    expect(pet.x()).toBeGreaterThanOrEqual(16);
    for (let i = 0; i < 100; i++) pet.moveWithKeyboard(new KeyboardEvent('keydown', {key: 'ArrowDown'}));
    expect(pet.y() + pet.size()).toBeLessThanOrEqual(window.innerHeight - 88);
  });
  it('permite ocultar y recuperar la mascota durante la visita', () => {
    const fixture = create(), pet = fixture.componentInstance;
    pet.hide(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mascot-character')).toBeNull();
    expect(sessionStorage.getItem('lugemi-mascot-hidden')).toBe('true');
    pet.show(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mascot-character')).not.toBeNull();
    expect(sessionStorage.getItem('lugemi-mascot-hidden')).toBeNull();
  });
  it('se levanta, camina con pasos alternos, saluda y vuelve a sentarse', () => {
    const pet = create().componentInstance;
    expect(pet.pose()).toBe('sitting');
    vi.advanceTimersByTime(2240);
    expect(pet.pose()).toBe('rising');
    vi.advanceTimersByTime(640);
    expect(pet.pose()).toBe('standing');
    vi.advanceTimersByTime(800);
    expect(pet.pose()).toBe('walking');
    vi.advanceTimersByTime(480);
    expect(pet.frame()).toBe(4);
    expect(pet.mirroredStep()).toBe(true);
    vi.advanceTimersByTime(pet.travelMs() - 480);
    expect(pet.pose()).toBe('waving');
    expect(pet.travelling()).toBe(false);
    vi.advanceTimersByTime(1280);
    expect(pet.pose()).toBe('sitting-down');
    vi.advanceTimersByTime(640);
    expect(pet.pose()).toBe('sitting');
  });
});
