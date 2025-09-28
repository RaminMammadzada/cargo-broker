import { TestBed } from '@angular/core/testing';

import { DeliveryInfo, OrderDraft } from '../models/order.model';
import { OrderService } from './order.service';

function createDraft(overrides: Partial<OrderDraft> = {}): OrderDraft {
  return {
    language: 'en',
    country: 'AZ',
    items: [
      {
        url: 'https://example.com/product',
        size: 'M',
        color: 'Blue',
        price: 49.99,
        notes: 'Please ensure authentic packaging.'
      }
    ],
    ...overrides
  };
}

function createDelivery(overrides: Partial<DeliveryInfo> = {}): DeliveryInfo {
  return {
    recipientName: 'Leyla Safarova',
    method: 'courier',
    companyId: 'fastexpress',
    companyName: 'FastExpress',
    addressLine: 'Baku, Nizami street 12',
    customerCode: 'FX-12345',
    ...overrides
  };
}

describe('OrderService', () => {
  let service: OrderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderService);
    window.localStorage.clear();
  });

  it('should persist submissions to the inbox with generated ids', () => {
    const draft = createDraft();
    const delivery = createDelivery();

    const submission = service.submit(draft, delivery, 49.99);

    expect(submission.id).toBeTruthy();
    expect(submission.payment).toBe('initiated');
    expect(submission.draft).not.toBe(draft);
    expect(submission.delivery).not.toBe(delivery);

    const stored = window.localStorage.getItem('cargo-broker.order-inbox');
    expect(stored).toBeTruthy();

    const parsed = JSON.parse(stored ?? '[]');
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe(submission.id);
  });

  it('should list submissions in reverse chronological order', () => {
    const first = service.submit(createDraft(), createDelivery(), 80);
    const second = service.submit(
      createDraft({
        items: [
          {
            url: 'https://example.com/second',
            price: 120
          }
        ]
      }),
      createDelivery({
        method: 'pickup',
        companyId: 'azerpost',
        companyName: 'AzerPost',
        pickupPointId: 'ap_11',
        pickupPointName: 'Ganjlik Mall'
      }),
      120
    );

    const inbox = service.list();
    expect(inbox.length).toBe(2);
    expect(inbox[0].id).toBe(second.id);
    expect(inbox[1].id).toBe(first.id);

    const found = service.getById(second.id);
    expect(found?.id).toBe(second.id);
    expect(service.getById('missing')).toBeNull();
  });

  it('should update payment status for a stored submission', () => {
    const submission = service.submit(createDraft(), createDelivery(), 80);

    const approved = service.updatePaymentStatus(submission.id, 'approved');

    expect(approved?.payment).toBe('approved');
    expect(service.getById(submission.id)?.payment).toBe('approved');

    const failed = service.updatePaymentStatus(submission.id, 'failed');

    expect(failed?.payment).toBe('failed');
    expect(service.updatePaymentStatus('unknown', 'approved')).toBeNull();
  });
});
