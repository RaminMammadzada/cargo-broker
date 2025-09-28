import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { signal, WritableSignal } from '@angular/core';

import { ReviewPageComponent } from './review.page';
import { enTranslations } from '../../testing/en-translations.fixture';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { AppStateService } from '../../data-access/state/app-state.service';
import { DeliveryInfo, OrderDraft } from '../../data-access/models/order.model';
import { OrderService } from '../../data-access/services/order.service';

describe('ReviewPageComponent', () => {
  let fixture: ComponentFixture<ReviewPageComponent>;
  let translate: TranslateService;
  let orderDraftSignal: WritableSignal<OrderDraft>;
  let deliverySignal: WritableSignal<DeliveryInfo | null>;
  let totalSignal: WritableSignal<number>;

  beforeEach(async () => {
    orderDraftSignal = signal<OrderDraft>({
      language: 'en',
      country: 'AZ',
      items: [
        {
          url: 'https://example.com/hoodie',
          price: 85
        }
      ]
    });

    deliverySignal = signal<DeliveryInfo | null>({
      recipientName: 'Roya Najafli',
      method: 'courier',
      companyId: 'fastexpress',
      companyName: 'FastExpress',
      addressLine: 'Baku, Azerbaijan',
      customerCode: 'FX-9999'
    });

    totalSignal = signal<number>(85);

    await TestBed.configureTestingModule({
      imports: [ReviewPageComponent, provideTranslateTesting()],
      providers: [
        {
          provide: AppStateService,
          useValue: {
            orderDraft: orderDraftSignal,
            delivery: deliverySignal,
            total: totalSignal,
            setPaymentStatus: jasmine.createSpy('setPaymentStatus')
          } as Partial<AppStateService>
        },
        { provide: OrderService, useValue: { submit: jasmine.createSpy('submit') } },
        { provide: Router, useValue: { navigateByUrl: jasmine.createSpy('navigateByUrl') } }
      ]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(ReviewPageComponent);
    fixture.detectChanges();
  });

  it('should render translated copy for the review step', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h2')?.textContent).toContain(enTranslations.pages.review.title);
    expect(element.querySelector('p.max-w-2xl')?.textContent).toContain(
      enTranslations.pages.review.description
    );
    expect(element.querySelector('app-review-summary')).toBeTruthy();
  });
});
