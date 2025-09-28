import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PaymentPageComponent } from './payment.page';
import { enTranslations } from '../../testing/en-translations.fixture';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { AppStateService } from '../../data-access/state/app-state.service';
import { OrderService } from '../../data-access/services/order.service';
import { PaymentService } from '../../data-access/services/payment.service';

describe('PaymentPageComponent', () => {
  let fixture: ComponentFixture<PaymentPageComponent>;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentPageComponent, provideTranslateTesting()],
      providers: [
        {
          provide: Router,
          useValue: {
            getCurrentNavigation: () => ({ extras: { state: { orderId: 'order-123' } } }),
            navigate: jasmine.createSpy('navigate').and.resolveTo(true)
          }
        },
        {
          provide: AppStateService,
          useValue: {
            paymentStatus: signal<'idle' | 'initiated' | 'approved' | 'failed'>('initiated'),
            setPaymentStatus: jasmine.createSpy('setPaymentStatus')
          }
        },
        {
          provide: OrderService,
          useValue: {
            getById: () => ({
              id: 'order-123',
              createdAt: new Date().toISOString(),
              total: 99,
              payment: 'initiated',
              draft: {
                language: 'en',
                country: 'AZ',
                items: [{ url: 'https://example.com/item', price: 99 }]
              },
              delivery: {
                recipientName: 'Aysel Aliyeva',
                method: 'courier',
                companyId: 'fastexpress',
                companyName: 'FastExpress',
                addressLine: 'Baku',
                customerCode: 'FX-1001'
              }
            })
          }
        },
        {
          provide: PaymentService,
          useValue: {
            pay: jasmine.createSpy('pay').and.resolveTo(null)
          }
        }
      ]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(PaymentPageComponent);
    fixture.detectChanges();
  });

  it('should render the page heading and mount the payment feature', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h2')?.textContent).toContain(enTranslations.pages.payment.title);
    expect(element.querySelector('p.max-w-2xl')?.textContent).toContain(enTranslations.pages.payment.description);
    expect(element.querySelector('[data-testid="payment-breakdown"]')).toBeTruthy();
  });
});
