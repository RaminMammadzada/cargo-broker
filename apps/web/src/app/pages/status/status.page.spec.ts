import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { StatusPageComponent } from './status.page';
import { enTranslations } from '../../testing/en-translations.fixture';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { StatusService } from '../../data-access/services/status.service';
import { AppStateService } from '../../data-access/state/app-state.service';
import { OrderSubmission } from '../../data-access/models/order.model';

describe('StatusPageComponent', () => {
  let fixture: ComponentFixture<StatusPageComponent>;
  let translate: TranslateService;
  let params$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let statusServiceGetSpy: jasmine.Spy;
  let setPaymentStatusSpy: jasmine.Spy;

  const submission: OrderSubmission = {
    id: 'ORDER-123',
    createdAt: new Date().toISOString(),
    total: 200,
    payment: 'approved',
    draft: {
      language: 'en',
      country: 'AZ',
      items: [{ url: 'https://example.com/item', price: 200 }]
    },
    delivery: {
      recipientName: 'Kamala Mammadova',
      method: 'courier',
      companyId: 'fastexpress',
      companyName: 'FastExpress',
      addressLine: 'Baku',
      customerCode: 'FX-1010'
    }
  };

  beforeEach(async () => {
    params$ = new BehaviorSubject(convertToParamMap({ id: 'ORDER-123' }));
    statusServiceGetSpy = jasmine.createSpy('get').and.returnValue(submission);
    setPaymentStatusSpy = jasmine.createSpy('setPaymentStatus');

    await TestBed.configureTestingModule({
      imports: [StatusPageComponent, RouterTestingModule, provideTranslateTesting()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: params$.asObservable()
          }
        },
        { provide: StatusService, useValue: { get: statusServiceGetSpy } },
        {
          provide: AppStateService,
          useValue: {
            setPaymentStatus: setPaymentStatusSpy
          }
        }
      ]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(StatusPageComponent);
    fixture.detectChanges();
  });

  it('should render the status summary for the resolved order', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(statusServiceGetSpy).toHaveBeenCalledWith('ORDER-123');
    expect(setPaymentStatusSpy).toHaveBeenCalledWith('approved');
    expect(element.querySelector('h3')?.textContent).toContain(enTranslations.status.states.approved);
    expect(element.querySelector('.space-y-4 .font-medium.text-slate-800')?.textContent).toContain(
      submission.delivery.recipientName
    );
  });

  it('should show a missing state when the order cannot be located', () => {
    statusServiceGetSpy.and.returnValue(null);

    const other = TestBed.createComponent(StatusPageComponent);
    other.detectChanges();

    const element = other.nativeElement as HTMLElement;
    expect(element.querySelector('.bg-amber-50')?.textContent).toContain(enTranslations.status.missing.title);
  });

  it('should render translated helper text and actions', () => {
    const element = fixture.nativeElement as HTMLElement;
    const description = element.querySelector('p.text-slate-600')?.textContent ?? '';
    expect(description).toContain(enTranslations.pages.status.description);

    const actionLabels = Array.from(element.querySelectorAll('a')).map((anchor) => anchor.textContent?.trim());
    expect(actionLabels).toEqual([
      enTranslations.pages.status.actions.backToPayment,
      enTranslations.pages.status.actions.viewOrders,
      enTranslations.pages.status.actions.startNew
    ]);
  });
});
