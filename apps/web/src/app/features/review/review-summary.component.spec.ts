import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ReviewSummaryComponent } from './review-summary.component';
import { AppStateService } from '../../data-access/state/app-state.service';
import { DeliveryInfo, OrderDraft } from '../../data-access/models/order.model';
import { OrderService } from '../../data-access/services/order.service';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { enTranslations } from '../../testing/en-translations.fixture';

describe('ReviewSummaryComponent', () => {
  let fixture: ComponentFixture<ReviewSummaryComponent>;
  let element: HTMLElement;
  let orderDraftSignal: WritableSignal<OrderDraft>;
  let deliverySignal: WritableSignal<DeliveryInfo | null>;
  let totalSignal: WritableSignal<number>;
  let setPaymentStatusSpy: jasmine.Spy;
  let orderServiceSubmitSpy: jasmine.Spy;
  let routerNavigateSpy: jasmine.Spy;
  let translate: TranslateService;

  beforeEach(async () => {
    orderDraftSignal = signal<OrderDraft>({
      language: 'en',
      country: 'AZ',
      items: [
        {
          url: 'https://example.com/hoodie',
          size: 'M',
          color: 'Black',
          price: 85,
          notes: 'Prefer official store listing.'
        }
      ]
    });

    deliverySignal = signal<DeliveryInfo | null>({
      recipientName: 'Roya Najafli',
      method: 'courier',
      companyId: 'fastexpress',
      companyName: 'FastExpress',
      addressLine: 'Baku, Nizami street 12',
      customerCode: 'FX-9999'
    });

    totalSignal = signal<number>(85);
    setPaymentStatusSpy = jasmine.createSpy('setPaymentStatus');

    const mockState = {
      orderDraft: orderDraftSignal,
      delivery: deliverySignal,
      total: totalSignal,
      setPaymentStatus: setPaymentStatusSpy
    } as unknown as AppStateService;

    orderServiceSubmitSpy = jasmine.createSpy('submit').and.returnValue({
      id: 'mock-order-id'
    });

    routerNavigateSpy = jasmine.createSpy('navigateByUrl').and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [ReviewSummaryComponent, provideTranslateTesting()],
      providers: [
        { provide: AppStateService, useValue: mockState },
        { provide: OrderService, useValue: { submit: orderServiceSubmitSpy } },
        { provide: Router, useValue: { navigateByUrl: routerNavigateSpy } }
      ]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(ReviewSummaryComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should render order and delivery summaries with translated copy', () => {
    expect(element.querySelector('[data-testid="order-summary"] h3')?.textContent).toContain(
      enTranslations.review.summary.order.title
    );
    expect(element.querySelectorAll('[data-testid="order-item"]').length).toBe(1);
    expect(element.querySelector('[data-testid="delivery-summary"] h3')?.textContent).toContain(
      enTranslations.review.summary.delivery.title
    );
  });

  it('should submit the order and navigate to payment when confirming', async () => {
    const confirmButton = element.querySelector('[data-testid="confirm-order"]') as HTMLButtonElement;
    confirmButton.click();
    fixture.detectChanges();

    await fixture.whenStable();

    expect(orderServiceSubmitSpy).toHaveBeenCalled();
    expect(setPaymentStatusSpy).toHaveBeenCalledWith('initiated');
    expect(routerNavigateSpy).toHaveBeenCalledWith('/payment', { state: { orderId: 'mock-order-id' } });
  });

  it('should prevent confirmation when delivery information is missing', () => {
    deliverySignal.set(null);
    fixture.detectChanges();

    const confirmButton = element.querySelector('[data-testid="confirm-order"]') as HTMLButtonElement;
    confirmButton.click();
    fixture.detectChanges();

    expect(orderServiceSubmitSpy).not.toHaveBeenCalled();
    expect(setPaymentStatusSpy).not.toHaveBeenCalled();
  });
});
