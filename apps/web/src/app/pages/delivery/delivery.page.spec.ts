import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DeliveryPageComponent } from './delivery.page';
import { enTranslations } from '../../testing/en-translations.fixture';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { AppStateService } from '../../data-access/state/app-state.service';

describe('DeliveryPageComponent', () => {
  let fixture: ComponentFixture<DeliveryPageComponent>;
  let translate: TranslateService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    const mockState = {
      delivery: signal(null),
      setDelivery: jasmine.createSpy('setDelivery')
    } as unknown as AppStateService;

    await TestBed.configureTestingModule({
      imports: [DeliveryPageComponent, provideTranslateTesting(), HttpClientTestingModule],
      providers: [{ provide: AppStateService, useValue: mockState }]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    httpMock = TestBed.inject(HttpTestingController);

    fixture = TestBed.createComponent(DeliveryPageComponent);
    httpMock.expectOne('assets/mocks/shipping.json').flush({
      companies: [],
      pickupPoints: []
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render translated copy for the delivery step', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h2')?.textContent).toContain(enTranslations.pages.delivery.title);
    expect(element.querySelector('p.max-w-2xl')?.textContent).toContain(enTranslations.pages.delivery.description);
    expect(element.querySelector('p.text-sm')?.textContent).toContain(enTranslations.pages.delivery.helper);
    expect(element.querySelector('app-delivery-form')).toBeTruthy();
  });
});
