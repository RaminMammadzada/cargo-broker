import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';

import { DeliveryInfo, OrderDraft } from '../models/order.model';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';

function createDraft(overrides: Partial<OrderDraft> = {}): OrderDraft {
  return {
    language: 'en',
    country: 'AZ',
    items: [
      {
        url: 'https://example.com/sneakers',
        price: 150
      }
    ],
    ...overrides
  };
}

function createDelivery(overrides: Partial<DeliveryInfo> = {}): DeliveryInfo {
  return {
    recipientName: 'Farid Aliyev',
    method: 'pickup',
    companyId: 'fastexpress',
    companyName: 'FastExpress',
    pickupPointId: 'fx_01',
    pickupPointName: 'Baku Downtown',
    customerCode: 'FX-0001',
    ...overrides
  };
}

describe('PaymentService', () => {
  let orderService: OrderService;
  let service: PaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});

    orderService = TestBed.inject(OrderService);
    service = TestBed.inject(PaymentService);
    window.localStorage.clear();
  });

  it('should resolve with an approved submission after the simulated delay', fakeAsync(() => {
    const submission = orderService.submit(createDraft(), createDelivery(), 150);
    let result: unknown;

    service.pay(submission.id, { outcome: 'approved', delayMs: 50 }).then((value) => {
      result = value;
    });

    tick(49);
    expect(result).toBeUndefined();

    tick(1);
    flush();

    const updated = result as ReturnType<OrderService['getById']>;
    expect(updated?.payment).toBe('approved');
    expect(orderService.getById(submission.id)?.payment).toBe('approved');
  }));

  it('should return null when the submission cannot be found', fakeAsync(() => {
    let result: unknown;

    service.pay('missing', { outcome: 'approved', delayMs: 10 }).then((value) => {
      result = value;
    });

    tick(10);
    flush();

    expect(result).toBeNull();
  }));
});
