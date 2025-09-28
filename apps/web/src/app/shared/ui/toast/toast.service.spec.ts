import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
    service.clear();
  });

  it('stores toasts with defaults and returns their id', () => {
    const id = service.show({ message: 'Saved!' });
    const [toast] = service.toasts();

    expect(id).toBe(toast.id);
    expect(toast.variant).toBe('info');
    expect(toast.message).toBe('Saved!');
    expect(toast.duration).toBeGreaterThan(0);
  });

  it('respects provided identifiers and variant overrides', () => {
    const id = service.show({ id: 'custom', message: 'Updated', variant: 'success' });
    const [toast] = service.toasts();

    expect(id).toBe('custom');
    expect(toast.variant).toBe('success');
  });

  it('dismisses toasts manually', () => {
    const id = service.show({ id: 'dismiss-me', message: 'Remove me', duration: 0 });
    expect(service.toasts().length).toBe(1);

    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });

  it('clears any active timers when dismissed manually', fakeAsync(() => {
    const id = service.show({ id: 'timer', message: 'Timer toast', duration: 10 });
    expect(service.toasts().length).toBe(1);

    service.dismiss(id);
    tick(20);

    expect(service.toasts().length).toBe(0);
  }));

  it('auto-dismisses toasts after the configured duration', fakeAsync(() => {
    service.show({ id: 'auto', message: 'Auto dismiss', duration: 50 });
    expect(service.toasts().length).toBe(1);

    tick(25);
    expect(service.toasts().length).toBe(1);

    tick(50);
    expect(service.toasts().length).toBe(0);
  }));

  it('clears all toasts and timers', fakeAsync(() => {
    service.show({ id: 'one', message: 'One', duration: 50 });
    service.show({ id: 'two', message: 'Two', duration: 50 });

    expect(service.toasts().length).toBe(2);

    service.clear();
    tick(100);

    expect(service.toasts().length).toBe(0);
  }));
});
