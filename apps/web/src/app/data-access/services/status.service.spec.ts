import { TestBed } from '@angular/core/testing';

import { DeliveryInfo, OrderDraft } from '../models/order.model';
import { OrderService } from './order.service';
import { StatusService } from './status.service';

function createDraft(): OrderDraft {
  return {
    language: 'en',
    country: 'AZ',
    items: [
      {
        url: 'https://example.com/watch'
      }
    ]
  };
}

function createDelivery(): DeliveryInfo {
  return {
    recipientName: 'Mina Rustamova',
    method: 'courier',
    companyId: 'fastexpress',
    companyName: 'FastExpress',
    addressLine: 'Baku, Fountain Square',
    customerCode: 'FX-1234'
  };
}

describe('StatusService', () => {
  let orderService: OrderService;
  let service: StatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    orderService = TestBed.inject(OrderService);
    service = TestBed.inject(StatusService);
    window.localStorage.clear();
  });

  it('should return stored submissions by id', () => {
    const submission = orderService.submit(createDraft(), createDelivery(), 0);

    expect(service.get(submission.id)?.id).toBe(submission.id);
    expect(service.get('missing')).toBeNull();
  });
});
