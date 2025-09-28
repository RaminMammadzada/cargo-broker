import { TestBed, fakeAsync, tick } from '@angular/core/testing';

import { DeliveryInfo, ProductLink } from '../models/order.model';
import { AppStateService } from './app-state.service';

const STORAGE_KEY = 'cargo-broker.app-state';

describe('AppStateService', () => {
  let store: Record<string, string>;
  let getItemSpy: jasmine.Spy;
  let setItemSpy: jasmine.Spy;
  let removeItemSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = {};
    getItemSpy = spyOn(window.localStorage, 'getItem').and.callFake((key: string) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null
    );
    setItemSpy = spyOn(window.localStorage, 'setItem').and.callFake((key: string, value: string) => {
      store[key] = value;
    });
    removeItemSpy = spyOn(window.localStorage, 'removeItem').and.callFake((key: string) => {
      delete store[key];
    });
  });

  afterEach(() => {
    getItemSpy.and.callThrough();
    setItemSpy.and.callThrough();
    removeItemSpy.and.callThrough();
    TestBed.resetTestingModule();
  });

  function createService(): AppStateService {
    return TestBed.runInInjectionContext(() => new AppStateService());
  }

  it('creates default state when no persisted snapshot is present', () => {
    const service = createService();

    expect(service.language()).toBe('az');
    expect(service.orderDraft()).toEqual({
      language: 'az',
      country: 'AZ',
      items: []
    });
    expect(service.delivery()).toBeNull();
    expect(service.paymentStatus()).toBe('idle');
    expect(service.hasOrderDraft()).toBeFalse();
    expect(service.total()).toBe(0);
  });

  it('hydrates from persisted state when available', () => {
    const delivery: DeliveryInfo = {
      recipientName: 'Samira',
      method: 'pickup',
      companyId: 'fastexpress',
      companyName: 'FastExpress',
      pickupPointId: 'fx_01',
      pickupPointName: 'Baku Downtown',
      customerCode: 'ABCD-1234'
    };

    store[STORAGE_KEY] = JSON.stringify({
      language: 'ru',
      orderDraft: {
        language: 'ru',
        country: 'AZ',
        items: [
          {
            url: 'https://example.com/product',
            price: 42
          }
        ]
      },
      delivery
    });

    const service = createService();

    expect(getItemSpy).toHaveBeenCalledWith(STORAGE_KEY);
    expect(service.language()).toBe('ru');
    expect(service.orderDraft().items).toEqual([
      {
        url: 'https://example.com/product',
        price: 42
      }
    ]);
    expect(service.hasOrderDraft()).toBeTrue();
    expect(service.hasDelivery()).toBeTrue();
    expect(service.delivery()).toEqual(delivery);
  });

  it('updates language and persists the snapshot', fakeAsync(() => {
    const service = createService();

    service.setLanguage('en');

    tick(300);

    expect(service.language()).toBe('en');
    expect(service.orderDraft().language).toBe('en');
    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, jasmine.any(String));

    const persisted = JSON.parse(setItemSpy.calls.mostRecent().args[1]);
    expect(persisted.language).toBe('en');
    expect(persisted.orderDraft.language).toBe('en');
  }));

  it('merges order draft patches while keeping defaults intact', fakeAsync(() => {
    const service = createService();

    const items: ProductLink[] = [
      { url: 'https://example.com/a', price: 10 },
      { url: 'https://example.com/b' }
    ];

    service.patchOrderDraft({ items });

    tick(300);

    expect(service.orderDraft()).toEqual({
      language: service.language(),
      country: 'AZ',
      items
    });
    expect(service.hasOrderDraft()).toBeTrue();
    expect(service.total()).toBe(10);
  }));

  it('requires unique, valid URLs before the order draft is considered complete', () => {
    const service = createService();

    service.setOrderItems([{ url: '' }]);
    expect(service.hasOrderDraft()).toBeFalse();

    service.setOrderItems([
      { url: 'https://example.com/item' },
      { url: 'https://example.com/item' }
    ]);
    expect(service.hasOrderDraft()).toBeFalse();

    service.setOrderItems([
      { url: 'https://example.com/item' },
      { url: 'https://example.com/other' }
    ]);
    expect(service.hasOrderDraft()).toBeTrue();
  });

  it('clears delivery and payment information and removes persisted snapshot', fakeAsync(() => {
    const service = createService();

    service.setOrderItems([{ url: 'https://example.com', price: 25 }]);
    service.setDelivery({
      recipientName: 'Rashad',
      method: 'courier',
      companyId: 'fastexpress',
      companyName: 'FastExpress',
      addressLine: 'Main street 1',
      customerCode: 'EFGH-5678'
    });
    service.setPaymentStatus('approved');

    tick(300);
    setItemSpy.calls.reset();

    service.clearAll();

    expect(service.orderDraft().items).toEqual([]);
    expect(service.delivery()).toBeNull();
    expect(service.paymentStatus()).toBe('idle');
    expect(service.hasOrderDraft()).toBeFalse();
    expect(service.hasDelivery()).toBeFalse();
    expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEY);

    tick(300);

    expect(setItemSpy).toHaveBeenCalledWith(STORAGE_KEY, jasmine.any(String));
    const snapshot = JSON.parse(setItemSpy.calls.mostRecent().args[1]);
    expect(snapshot.orderDraft.items).toEqual([]);
    expect(snapshot.delivery).toBeNull();
  }));
});
