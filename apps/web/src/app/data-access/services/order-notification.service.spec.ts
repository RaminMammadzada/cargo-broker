import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { OrderNotificationService } from './order-notification.service';
import { APP_CONFIG, AppConfig } from '../config/app-config';
import { OrderSubmission } from '../models/order.model';

describe('OrderNotificationService', () => {
  let service: OrderNotificationService;
  let httpMock: HttpTestingController;
  const config: AppConfig = { apiBaseUrl: '/api' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: APP_CONFIG, useValue: config }]
    });

    service = TestBed.inject(OrderNotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should post order submissions to the notifications endpoint', () => {
    const submission: OrderSubmission = {
      id: 'test-order',
      draft: {
        country: 'AZ',
        language: 'en',
        items: [{ url: 'https://example.com/item', price: 50 }]
      },
      delivery: {
        recipientName: 'Test User',
        method: 'courier',
        companyId: 'demo',
        companyName: 'Demo',
        addressLine: 'Somewhere 1',
        customerCode: 'D-1'
      },
      createdAt: new Date().toISOString(),
      total: 50,
      payment: 'initiated'
    };

    service.notifyOrder(submission).subscribe();

    const request = httpMock.expectOne('/api/notifications/order');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ submission });
    request.flush({});
  });
});
