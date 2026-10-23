import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { StoreMascot } from './store-mascot';

describe('mascota fija de la tienda', () => {
  beforeEach(() => {
    vi.useFakeTimers(); sessionStorage.clear();
    vi.stubGlobal('matchMedia', vi.fn(() => ({matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn()})));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    TestBed.configureTestingModule({imports: [StoreMascot], providers: [provideRouter([])]});
  });
  afterEach(() => {
    TestBed.resetTestingModule(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); sessionStorage.clear();
  });
  const create = () => {
    const fixture = TestBed.createComponent(StoreMascot); fixture.detectChanges(); return fixture;
  };
  it('se levanta, saluda, señala WhatsApp y se sienta sin desplazarse', () => {
    const fixture = create(), pet = fixture.componentInstance;
    vi.advanceTimersByTime(3200); expect(pet.pose()).toBe('rising');
    vi.advanceTimersByTime(640); expect(pet.pose()).toBe('standing');
    vi.advanceTimersByTime(960); expect(pet.pose()).toBe('waving');
    vi.advanceTimersByTime(1600); expect(pet.pose()).toBe('pointing');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mascot-pointing')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.whatsapp-cue').textContent).toContain('¿Te ayudamos?');
    expect(fixture.nativeElement.querySelector('.mascot-shell').style.transform).toBe('');
    vi.advanceTimersByTime(2400); expect(pet.pose()).toBe('sitting-down');
    vi.advanceTimersByTime(640); expect(pet.pose()).toBe('sitting');
  });
  it('permite pausar la secuencia', () => {
    const pet = create().componentInstance;
    pet.togglePause(); vi.advanceTimersByTime(30000);
    expect(pet.pose()).toBe('sitting');
    expect(sessionStorage.getItem('lugemi-mascot-paused')).toBe('true');
    pet.togglePause(); vi.advanceTimersByTime(3200);
    expect(pet.pose()).toBe('rising');
  });
  it('respeta movimiento reducido y los diálogos de compra', () => {
    const fixture = create(), pet = fixture.componentInstance;
    pet.reduced.set(true); vi.advanceTimersByTime(10000);
    expect(pet.pose()).toBe('sitting');
    pet.reduced.set(false); fixture.componentRef.setInput('blocked', true); fixture.detectChanges();
    vi.advanceTimersByTime(10000); expect(pet.pose()).toBe('sitting');
    expect(fixture.nativeElement.querySelector('.mascot-shell').classList.contains('blocked')).toBe(true);
  });
  it('abre el saludo sin instrucciones de arrastre y conserva las opciones', () => {
    const fixture = create(), pet = fixture.componentInstance;
    pet.greet(); fixture.detectChanges();
    expect(pet.pose()).toBe('waving');
    expect(fixture.nativeElement.textContent).toContain('WhatsApp');
    expect(fixture.nativeElement.textContent).not.toContain('arrastr');
    pet.close(); expect(pet.open()).toBe(false);
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
});
