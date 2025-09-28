import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AppStateService } from '../../data-access/state/app-state.service';
import { DeliveryInfo } from '../../data-access/models/order.model';
import { PickupPoint, ShippingCompany, ShippingData } from '../../data-access/models/shipping.model';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';

type DeliveryMethod = DeliveryInfo['method'];

interface DeliveryFormValue {
  recipientName: string;
  method: DeliveryMethod;
  companyId: string;
  pickupPointId: string;
  addressLine: string;
  customerCode: string;
}

@Component({
  selector: 'app-delivery-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ButtonComponent, CardComponent, FormFieldComponent],
  template: `
    <form class="space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <app-card>
        <div class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">{{ 'delivery.form.title' | translate }}</h3>
            <p class="mt-1 text-sm text-slate-600">{{ 'delivery.form.subtitle' | translate }}</p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <app-form-field
              [label]="'delivery.form.fields.recipientName.label' | translate"
              [required]="true"
              [error]="controlError(form.get('recipientName'))"
              [for]="'recipient-name'"
            >
              <input
                id="recipient-name"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                formControlName="recipientName"
                autocomplete="name"
                data-testid="recipient-name"
              />
            </app-form-field>

            <app-form-field
              [label]="'delivery.form.fields.customerCode.label' | translate"
              [required]="true"
              [error]="controlError(form.get('customerCode'))"
              [for]="'customer-code'"
            >
              <input
                id="customer-code"
                type="text"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                formControlName="customerCode"
                autocomplete="one-time-code"
                data-testid="customer-code"
              />
            </app-form-field>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <app-form-field
              [label]="'delivery.form.fields.method.label' | translate"
              [required]="true"
              [for]="'delivery-method'"
            >
              <select
                id="delivery-method"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                formControlName="method"
                data-testid="method-select"
              >
                <option value="courier">{{ 'delivery.form.fields.method.options.courier' | translate }}</option>
                <option value="pickup">{{ 'delivery.form.fields.method.options.pickup' | translate }}</option>
              </select>
            </app-form-field>

            <app-form-field
              [label]="'delivery.form.fields.company.label' | translate"
              [required]="true"
              [error]="controlError(form.get('companyId'))"
              [for]="'delivery-company'"
            >
              <select
                id="delivery-company"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                formControlName="companyId"
                data-testid="company-select"
              >
                <option value="" disabled hidden>{{ 'delivery.form.fields.company.placeholder' | translate }}</option>
                <option *ngFor="let company of companies()" [value]="company.id">{{ company.name }}</option>
              </select>
            </app-form-field>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <app-form-field
              *ngIf="form.get('method')?.value === 'pickup'"
              [label]="'delivery.form.fields.pickupPoint.label' | translate"
              [required]="true"
              [error]="controlError(form.get('pickupPointId'))"
              [for]="'pickup-point'"
            >
              <select
                id="pickup-point"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                formControlName="pickupPointId"
                data-testid="pickup-select"
              >
                <option value="" disabled hidden>{{ 'delivery.form.fields.pickupPoint.placeholder' | translate }}</option>
                <option *ngFor="let point of pickupPoints()" [value]="point.id">{{ point.name }}</option>
              </select>
            </app-form-field>

            <app-form-field
              *ngIf="form.get('method')?.value === 'courier'"
              [label]="'delivery.form.fields.address.label' | translate"
              [required]="true"
              [error]="controlError(form.get('addressLine'))"
              [for]="'address-line'"
            >
              <textarea
                id="address-line"
                rows="3"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 min-h-[96px]"
                formControlName="addressLine"
                autocomplete="street-address"
                data-testid="address-line"
              ></textarea>
            </app-form-field>
          </div>
        </div>
      </app-card>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white"
          (click)="router.navigateByUrl('/order')"
          data-testid="back-to-order"
        >
          {{ 'delivery.form.actions.back' | translate }}
        </button>

        <app-button
          variant="primary"
          type="submit"
          [disabled]="form.invalid || submitting || companies().length === 0"
          data-testid="submit-delivery"
        >
          <span class="flex items-center gap-2">
            <span>{{ 'delivery.form.actions.next' | translate }}</span>
            <span *ngIf="submitting" class="h-2 w-2 animate-pulse rounded-full bg-white"></span>
          </span>
        </app-button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryFormComponent {
  private readonly appState = inject(AppStateService);
  readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly shippingData = signal<ShippingData | null>(null);

  readonly companies = computed<ShippingCompany[]>(() => this.shippingData()?.companies ?? []);
  readonly pickupPoints = computed<PickupPoint[]>(() => {
    const data = this.shippingData();
    const companyId = this.form.get('companyId')?.value;
    if (!data || !companyId) {
      return [];
    }

    return data.pickupPoints.filter((point) => point.companyId === companyId);
  });

  submitting = false;

  readonly form = this.fb.group({
    recipientName: this.fb.control('', { validators: [Validators.required] }),
    method: this.fb.control<DeliveryMethod>('courier', { validators: [Validators.required] }),
    companyId: this.fb.control('', { validators: [Validators.required] }),
    pickupPointId: this.fb.control(''),
    addressLine: this.fb.control(''),
    customerCode: this.fb.control('', { validators: [Validators.required] })
  });

  constructor() {
    this.bootstrapFromState();
    this.loadShippingData();
    this.handleMethodChanges();
    this.handleCompanyChanges();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const value = this.form.getRawValue() as DeliveryFormValue;
    const payload = this.toDeliveryInfo(value);
    this.appState.setDelivery(payload);

    this.router.navigateByUrl('/review').finally(() => {
      this.submitting = false;
    });
  }

  controlError(control: AbstractControl | null): string | null {
    if (!control) {
      return null;
    }

    if (!control.invalid || (!control.touched && !control.dirty)) {
      return null;
    }

    if (control.hasError('required')) {
      return this.translate.instant('delivery.form.errors.required');
    }

    return null;
  }

  private loadShippingData(): void {
    this.http
      .get<ShippingData>('assets/mocks/shipping.json')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.shippingData.set(data);
          const companyControl = this.form.get('companyId');
          if (companyControl) {
            if (!data.companies.length) {
              companyControl.disable({ emitEvent: false });
              companyControl.patchValue('', { emitEvent: false });
            } else {
              companyControl.enable({ emitEvent: false });
              if (!companyControl.value) {
                companyControl.patchValue(data.companies[0].id, { emitEvent: false });
              }
            }
          }
          this.syncMethodControls(this.form.get('method')?.value as DeliveryMethod);
          this.syncPickupPoint();
        },
        error: () => {
          this.shippingData.set({ companies: [], pickupPoints: [] });
          const companyControl = this.form.get('companyId');
          companyControl?.disable({ emitEvent: false });
          companyControl?.patchValue('', { emitEvent: false });
        }
      });
  }

  private handleMethodChanges(): void {
    const methodControl = this.form.get('method');
    methodControl
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((method) => {
        this.syncMethodControls(method as DeliveryMethod);
        this.syncPickupPoint();
      });

    this.syncMethodControls(methodControl?.value as DeliveryMethod);
    this.syncPickupPoint();
  }

  private handleCompanyChanges(): void {
    this.form
      .get('companyId')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.syncPickupPoint());
  }

  private syncMethodControls(method: DeliveryMethod): void {
    const pickupControl = this.form.get('pickupPointId');
    const addressControl = this.form.get('addressLine');

    if (method === 'pickup') {
      pickupControl?.setValidators([Validators.required]);
      pickupControl?.enable({ emitEvent: false });
      addressControl?.setValidators([]);
      addressControl?.patchValue('', { emitEvent: false });
      addressControl?.disable({ emitEvent: false });
    } else {
      addressControl?.setValidators([Validators.required]);
      addressControl?.enable({ emitEvent: false });
      pickupControl?.setValidators([]);
      pickupControl?.patchValue('', { emitEvent: false });
      pickupControl?.disable({ emitEvent: false });
    }

    pickupControl?.updateValueAndValidity({ emitEvent: false });
    addressControl?.updateValueAndValidity({ emitEvent: false });
  }

  private syncPickupPoint(): void {
    const pickupControl = this.form.get('pickupPointId');
    if (!pickupControl) {
      return;
    }

    const method = (this.form.get('method')?.value ?? 'courier') as DeliveryMethod;
    if (method !== 'pickup') {
      pickupControl.disable({ emitEvent: false });
      pickupControl.patchValue('', { emitEvent: false });
      pickupControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    const options = this.pickupPoints();
    if (!options.length) {
      pickupControl.disable({ emitEvent: false });
      pickupControl.patchValue('', { emitEvent: false });
      pickupControl.updateValueAndValidity({ emitEvent: false });
      return;
    }

    pickupControl.enable({ emitEvent: false });
    const currentValue = pickupControl.value;
    if (!currentValue || !options.some((option) => option.id === currentValue)) {
      pickupControl.patchValue(options[0].id, { emitEvent: false });
    }
  }

  private bootstrapFromState(): void {
    const delivery = this.appState.delivery();
    if (!delivery) {
      return;
    }

    this.form.patchValue(
      {
        recipientName: delivery.recipientName,
        method: delivery.method,
        companyId: delivery.companyId,
        pickupPointId: delivery.pickupPointId ?? '',
        addressLine: delivery.addressLine ?? '',
        customerCode: delivery.customerCode
      },
      { emitEvent: false }
    );
  }

  private toDeliveryInfo(value: DeliveryFormValue): DeliveryInfo {
    const company = this.companies().find((item) => item.id === value.companyId);
    const pickup =
      value.method === 'pickup'
        ? this.pickupPoints().find((item) => item.id === value.pickupPointId)
        : undefined;

    return {
      recipientName: value.recipientName.trim(),
      method: value.method,
      companyId: value.companyId,
      companyName: company?.name ?? value.companyId,
      pickupPointId: value.method === 'pickup' ? value.pickupPointId : undefined,
      pickupPointName: value.method === 'pickup' ? pickup?.name ?? value.pickupPointId : undefined,
      addressLine: value.method === 'courier' ? value.addressLine.trim() : undefined,
      customerCode: value.customerCode.trim()
    };
  }
}
