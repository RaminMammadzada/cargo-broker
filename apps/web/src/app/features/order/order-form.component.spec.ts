import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { signal, WritableSignal } from '@angular/core';

import { OrderFormComponent } from './order-form.component';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { enTranslations } from '../../testing/en-translations.fixture';
import { AppStateService } from '../../data-access/state/app-state.service';
import { OrderDraft } from '../../data-access/models/order.model';

function createDraft(items: OrderDraft['items']): OrderDraft {
  return {
    language: 'en',
    country: 'AZ',
    items
  };
}

describe('OrderFormComponent', () => {
  let fixture: ComponentFixture<OrderFormComponent>;
  let component: OrderFormComponent;
  let element: HTMLElement;
  let router: Router;
  let translate: TranslateService;
  let orderDraftSignal: WritableSignal<OrderDraft>;
  let setOrderItemsSpy: jasmine.Spy;

  const configureTestingModule = async () => {
    orderDraftSignal = signal(createDraft([]));
    setOrderItemsSpy = jasmine.createSpy('setOrderItems');
    const mockAppState = {
      orderDraft: orderDraftSignal,
      setOrderItems: setOrderItemsSpy
    } as unknown as AppStateService;

    await TestBed.configureTestingModule({
      imports: [OrderFormComponent, provideTranslateTesting(), RouterTestingModule],
      providers: [{ provide: AppStateService, useValue: mockAppState }]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    router = TestBed.inject(Router);
  };

  const createComponent = () => {
    fixture = TestBed.createComponent(OrderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(async () => {
    await configureTestingModule();
  });

  it('should render existing order items from state', () => {
    orderDraftSignal.set(
      createDraft([
        { url: 'https://example.com/product-1', size: 'M', color: 'Red', notes: 'Gift' },
        { url: 'https://example.com/product-2', price: 12.5 }
      ])
    );

    createComponent();

    const urlInputs = element.querySelectorAll<HTMLInputElement>('[data-testid="url-input"]');
    expect(urlInputs.length).toBe(2);
    expect(urlInputs[0].value).toBe('https://example.com/product-1');
    expect(urlInputs[1].value).toBe('https://example.com/product-2');
  });

  it('should disable adding more than three items', () => {
    orderDraftSignal.set(
      createDraft([
        { url: 'https://example.com/1' },
        { url: 'https://example.com/2' },
        { url: 'https://example.com/3' }
      ])
    );

    createComponent();

    const addButton = element.querySelector<HTMLButtonElement>('[data-testid="add-item"]');
    expect(addButton).toBeTruthy();
    expect(addButton?.disabled).toBeTrue();
  });

  it('should surface duplicate link errors with translated copy', () => {
    createComponent();

    component.itemControls[0].get('url')?.setValue('https://example.com/duplicate');
    component.addItem();
    fixture.detectChanges();

    component.itemControls[1].get('url')?.setValue('https://example.com/duplicate');
    component.form.markAllAsTouched();
    fixture.detectChanges();

    const firstUrl = component.itemControls[0].get('url');
    const secondUrl = component.itemControls[1].get('url');

    expect(firstUrl?.hasError('duplicateLink')).toBeTrue();
    expect(secondUrl?.hasError('duplicateLink')).toBeTrue();
    expect(component.controlError(firstUrl ?? null)).toBe(enTranslations.order.form.errors.duplicate);
    expect(component.controlError(secondUrl ?? null)).toBe(enTranslations.order.form.errors.duplicate);
  });

  it('should persist items and navigate to delivery when submitted', fakeAsync(() => {
    createComponent();

    const navigateSpy = spyOn(router, 'navigateByUrl').and.returnValue(Promise.resolve(true));

    component.itemControls[0].get('url')?.setValue('https://example.com/valid');
    component.itemControls[0].get('price')?.setValue('45');
    fixture.detectChanges();

    component.onSubmit();
    expect(component.submitting).toBeTrue();

    tick();
    fixture.detectChanges();

    const lastCallArgs = setOrderItemsSpy.calls.mostRecent()?.args?.[0] as unknown[];
    expect(lastCallArgs?.length).toBe(1);
    expect(lastCallArgs?.[0]).toEqual(
      jasmine.objectContaining({ url: 'https://example.com/valid', price: 45 })
    );
    expect(navigateSpy).toHaveBeenCalledWith('/delivery');
    expect(component.submitting).toBeFalse();
  }));
});
