import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { PaymentComponent } from './payment.component';
import { AppStateService } from '../../data-access/state/app-state.service';
import { OrderSubmission } from '../../data-access/models/order.model';
import { OrderService } from '../../data-access/services/order.service';
import { PaymentService } from '../../data-access/services/payment.service';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { enTranslations } from '../../testing/en-translations.fixture';

describe('PaymentComponent', () => {
  let fixture: ComponentFixture<PaymentComponent>;
  let element: HTMLElement;
  let paymentStatusSignal: WritableSignal<'idle' | 'initiated' | 'approved' | 'failed'>;
  let setPaymentStatusSpy: jasmine.Spy;
  let paymentServicePaySpy: jasmine.Spy;
  let orderServiceGetByIdSpy: jasmine.Spy;
  let routerNavigateSpy: jasmine.Spy;
  let translate: TranslateService;

  const submission: OrderSubmission = {
    id: 'order-123',
    createdAt: new Date().toISOString(),
    total: 205,
    payment: 'initiated',
    draft: {
      language: 'en',
      country: 'AZ',
      items: [
        {
          url: 'https://example.com/boots',
          price: 120
        },
        {
          url: 'https://example.com/gloves',
          price: 85
        }
      ]
    },
    delivery: {
      recipientName: 'Ilaha Rahimova',
      method: 'pickup',
      companyId: 'fastexpress',
      companyName: 'FastExpress',
      pickupPointId: 'fx_01',
      pickupPointName: 'Baku Downtown',
      customerCode: 'FX-2222'
    }
  };

  beforeEach(async () => {
    paymentStatusSignal = signal<'idle' | 'initiated' | 'approved' | 'failed'>('idle');
    setPaymentStatusSpy = jasmine
      .createSpy('setPaymentStatus')
      .and.callFake((status: 'idle' | 'initiated' | 'approved' | 'failed') => paymentStatusSignal.set(status));

    paymentServicePaySpy = jasmine
      .createSpy('pay')
      .and.callFake(async (_id: string, options?: { outcome?: 'approved' | 'failed' }) => ({
        ...submission,
        payment: options?.outcome ?? 'approved'
      }));

    orderServiceGetByIdSpy = jasmine
      .createSpy('getById')
      .and.callFake((id: string) => (id === submission.id ? submission : null));

    routerNavigateSpy = jasmine.createSpy('navigate').and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [PaymentComponent, provideTranslateTesting()],
      providers: [
        {
          provide: Router,
          useValue: {
            getCurrentNavigation: () => ({ extras: { state: { orderId: submission.id } } }),
            navigate: routerNavigateSpy
          }
        },
        {
          provide: AppStateService,
          useValue: {
            paymentStatus: paymentStatusSignal,
            setPaymentStatus: setPaymentStatusSpy
          }
        },
        {
          provide: OrderService,
          useValue: { getById: orderServiceGetByIdSpy }
        },
        { provide: PaymentService, useValue: { pay: paymentServicePaySpy } }
      ]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(PaymentComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should render the payment summary and details', () => {
    expect(element.querySelector('[data-testid="payment-breakdown"]')?.textContent).toContain(
      enTranslations.payment.summary.total
    );
    expect(element.querySelector('[data-testid="payment-status"]')?.textContent).toContain(
      enTranslations.payment.status.initiated
    );
    expect(element.querySelector('[data-testid="simulate-success"]')?.textContent).toContain(
      enTranslations.payment.simulation.approved
    );
  });

  it('should trigger the payment service and navigate to status on success', async () => {
    const button = element.querySelector('[data-testid="pay-now"]') as HTMLButtonElement;
    button.click();

    fixture.detectChanges();
    await fixture.whenStable();

    expect(setPaymentStatusSpy).toHaveBeenCalledWith('initiated');
    expect(paymentServicePaySpy).toHaveBeenCalledWith(submission.id, { outcome: 'approved' });
    expect(routerNavigateSpy).toHaveBeenCalledWith(['/status', submission.id], {
      state: { orderId: submission.id }
    });
    expect(setPaymentStatusSpy).toHaveBeenCalledWith('approved');
  });

  it('should show a missing state when the order cannot be resolved', async () => {
    orderServiceGetByIdSpy.and.returnValue(null);

    const component = TestBed.createComponent(PaymentComponent);
    component.detectChanges();

    const missing = component.nativeElement.querySelector('[data-testid="missing-order"]');
    expect(missing?.textContent).toContain(enTranslations.payment.missing.title);
  });
});
