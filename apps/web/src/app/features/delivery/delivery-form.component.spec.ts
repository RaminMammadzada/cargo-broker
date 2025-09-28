import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DeliveryFormComponent } from './delivery-form.component';
import { AppStateService } from '../../data-access/state/app-state.service';
import { DeliveryInfo } from '../../data-access/models/order.model';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { enTranslations } from '../../testing/en-translations.fixture';

const shippingResponse = {
  companies: [
    { id: 'fastexpress', name: 'FastExpress' },
    { id: 'azerpost', name: 'AzerPost' }
  ],
  pickupPoints: [
    { id: 'fx_01', companyId: 'fastexpress', name: 'Baku Downtown' },
    { id: 'ap_11', companyId: 'azerpost', name: 'Ganjlik Mall' }
  ]
};

describe('DeliveryFormComponent', () => {
  let fixture: ComponentFixture<DeliveryFormComponent>;
  let component: DeliveryFormComponent;
  let element: HTMLElement;
  let router: Router;
  let translate: TranslateService;
  let httpMock: HttpTestingController;
  let deliverySignal: WritableSignal<DeliveryInfo | null>;
  let setDeliverySpy: jasmine.Spy;

  const configureTestingModule = async () => {
    deliverySignal = signal<DeliveryInfo | null>(null);
    setDeliverySpy = jasmine.createSpy('setDelivery');
    const mockState = {
      delivery: deliverySignal,
      setDelivery: setDeliverySpy
    } as unknown as AppStateService;

    await TestBed.configureTestingModule({
      imports: [DeliveryFormComponent, provideTranslateTesting(), RouterTestingModule, HttpClientTestingModule],
      providers: [{ provide: AppStateService, useValue: mockState }]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(DeliveryFormComponent);
    component = fixture.componentInstance;

    httpMock.expectOne('assets/mocks/shipping.json').flush(shippingResponse);

    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    await configureTestingModule();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should render shipping companies and default selections', () => {
    createComponent();

    const companySelect = element.querySelector<HTMLSelectElement>('[data-testid="company-select"]');
    expect(companySelect?.value).toBe('fastexpress');
    expect(companySelect?.options.length).toBe(2 + 1); // includes placeholder option

    const methodSelect = element.querySelector<HTMLSelectElement>('[data-testid="method-select"]');
    expect(methodSelect?.value).toBe('courier');

    component.form.get('method')?.setValue('pickup');
    fixture.detectChanges();

    const pickupSelect = element.querySelector<HTMLSelectElement>('[data-testid="pickup-select"]');
    expect(pickupSelect).toBeTruthy();
    expect(pickupSelect?.value).toBe('fx_01');
  });

  it('should surface required errors depending on selected method', () => {
    createComponent();

    component.form.get('recipientName')?.markAsTouched();
    component.form.get('addressLine')?.markAsTouched();
    fixture.detectChanges();

    expect(component.controlError(component.form.get('recipientName'))).toBe(
      enTranslations.delivery.form.errors.required
    );

    component.form.get('method')?.setValue('pickup');
    component.form.get('pickupPointId')?.setValue('');
    component.form.get('pickupPointId')?.markAsTouched();
    fixture.detectChanges();

    expect(component.form.get('addressLine')?.value).toBe('');
    expect(component.controlError(component.form.get('pickupPointId'))).toBe(
      enTranslations.delivery.form.errors.required
    );
  });

  it('should persist delivery info and navigate to review on submit', fakeAsync(() => {
    createComponent();

    const navigateSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    component.form.setValue({
      recipientName: 'Aysel Quliyeva',
      method: 'courier',
      companyId: 'fastexpress',
      pickupPointId: '',
      addressLine: 'Baku, Nizami street 12',
      customerCode: 'FX-12345'
    });

    component.onSubmit();
    expect(component.submitting).toBeTrue();

    tick();
    fixture.detectChanges();

    expect(setDeliverySpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        method: 'courier',
        companyId: 'fastexpress',
        companyName: 'FastExpress',
        addressLine: 'Baku, Nizami street 12',
        pickupPointId: undefined
      })
    );
    expect(navigateSpy).toHaveBeenCalledWith('/review');
    expect(component.submitting).toBeFalse();
  }));

  it('should bootstrap existing delivery info from state', () => {
    deliverySignal.set({
      recipientName: 'Rustam Aliyev',
      method: 'pickup',
      companyId: 'azerpost',
      pickupPointId: 'ap_11',
      customerCode: 'AP-7788'
    } as DeliveryInfo);

    createComponent();

    expect(component.form.get('recipientName')?.value).toBe('Rustam Aliyev');
    expect(component.form.get('method')?.value).toBe('pickup');
    expect(component.form.get('companyId')?.value).toBe('azerpost');
    expect(component.form.get('pickupPointId')?.value).toBe('ap_11');
    expect(component.form.get('addressLine')?.value).toBe('');
    expect(component.form.get('customerCode')?.value).toBe('AP-7788');
  });
});
