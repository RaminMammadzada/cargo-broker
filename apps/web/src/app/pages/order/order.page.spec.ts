import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { OrderPageComponent } from './order.page';
import { enTranslations } from '../../testing/en-translations.fixture';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { AppStateService } from '../../data-access/state/app-state.service';
import { OrderDraft } from '../../data-access/models/order.model';

describe('OrderPageComponent', () => {
  let fixture: ComponentFixture<OrderPageComponent>;
  let translate: TranslateService;
  const initialDraft: OrderDraft = {
    language: 'en',
    country: 'AZ',
    items: []
  };
  const mockAppState = {
    orderDraft: signal(initialDraft),
    setOrderItems: jasmine.createSpy('setOrderItems')
  } as unknown as AppStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderPageComponent, provideTranslateTesting(), RouterTestingModule],
      providers: [{ provide: AppStateService, useValue: mockAppState }]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(OrderPageComponent);
    fixture.detectChanges();
  });

  it('should render translated copy for the order step', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h2')?.textContent).toContain(enTranslations.pages.order.title);
    expect(element.querySelector('p.max-w-2xl')?.textContent).toContain(enTranslations.pages.order.description);
    expect(element.querySelector('app-order-form')).toBeTruthy();
  });
});
