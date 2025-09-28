import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';

import { OrdersPageComponent } from './orders.page';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { OrderService } from '../../data-access/services/order.service';
import { OrderSubmission } from '../../data-access/models/order.model';
import { enTranslations } from '../../testing/en-translations.fixture';

describe('OrdersPageComponent', () => {
  let translate: TranslateService;
  let orderServiceStub: { list: jasmine.Spy<() => OrderSubmission[]> };

  const submissions: OrderSubmission[] = [
    {
      id: 'ORDER-1',
      createdAt: new Date('2024-04-01T10:00:00Z').toISOString(),
      total: 120,
      payment: 'approved',
      draft: {
        language: 'en',
        country: 'AZ',
        items: [{ url: 'https://example.com/a', price: 120 }]
      },
      delivery: {
        recipientName: 'Aisha',
        method: 'courier',
        companyId: 'fastexpress',
        companyName: 'FastExpress',
        addressLine: 'Baku',
        customerCode: 'FX-001'
      }
    }
  ];

  beforeEach(async () => {
    orderServiceStub = {
      list: jasmine.createSpy('list').and.returnValue(submissions)
    };

    await TestBed.configureTestingModule({
      imports: [OrdersPageComponent, RouterTestingModule, provideTranslateTesting()],
      providers: [{ provide: OrderService, useValue: orderServiceStub }]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');
  });

  function createComponent(): ComponentFixture<OrdersPageComponent> {
    const fixture = TestBed.createComponent(OrdersPageComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should render stored submissions with translated metadata', () => {
    const fixture = createComponent();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('h2')?.textContent).toContain(enTranslations.pages.orders.title);
    const cardText = element.querySelector('app-card')?.textContent ?? '';
    expect(cardText).toContain(enTranslations.status.states.approved);
    expect(cardText).toContain(submissions[0].delivery.recipientName);
    expect(cardText).toContain(enTranslations.pages.orders.actions.viewStatus);
  });

  it('should show an empty state when there are no submissions', () => {
    orderServiceStub.list.and.returnValue([]);

    const fixture = createComponent();
    const emptyElement = fixture.nativeElement as HTMLElement;
    expect(emptyElement.querySelector('.bg-slate-50')?.textContent).toContain(
      enTranslations.pages.orders.empty.title
    );
  });
});

