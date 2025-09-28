import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AppStateService } from '../../data-access/state/app-state.service';
import { ProductLink } from '../../data-access/models/order.model';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { uniqueLinksValidator } from '../../shared/validators/unique-links.validator';
import { urlValidator } from '../../shared/validators/url.validator';

interface ProductLinkFormValue {
  url: string;
  size: string;
  color: string;
  price: string;
  notes: string;
}

interface OrderFormValue {
  items: ProductLinkFormValue[];
}

function toProductLink(value: ProductLinkFormValue): ProductLink {
  const price = value.price.trim() === '' ? undefined : Number(value.price);

  return {
    url: value.url.trim(),
    size: value.size.trim() === '' ? undefined : value.size.trim(),
    color: value.color.trim() === '' ? undefined : value.color.trim(),
    notes: value.notes.trim() === '' ? undefined : value.notes.trim(),
    price: Number.isFinite(price) && !Number.isNaN(price) ? price : undefined
  };
}

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ButtonComponent, CardComponent, FormFieldComponent],
  template: `
    <form class="space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
      <div class="space-y-6" formArrayName="items">
        <ng-container *ngFor="let group of itemControls; index as index">
          <app-card>
            <div class="flex items-start justify-between gap-4">
              <div class="space-y-1">
                <p class="text-sm font-medium text-slate-900">
                  {{ 'order.form.itemLabel' | translate : { index: index + 1 } }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ 'order.form.itemHelper' | translate }}
                </p>
              </div>
              <button
                type="button"
                class="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                (click)="removeItem(index)"
                [disabled]="itemControls.length === 1"
                [attr.aria-label]="'order.form.removeItem' | translate : { index: index + 1 }"
                data-testid="remove-item"
              >
                {{ 'order.form.remove' | translate }}
              </button>
            </div>

            <div class="mt-6 grid gap-4" [formGroupName]="index">
              <app-form-field
                [label]="'order.form.fields.url.label' | translate"
                [required]="true"
                [error]="controlError(group.get('url'))"
                [for]="'order-url-' + index"
              >
                <input
                  type="url"
                  class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                  [id]="'order-url-' + index"
                  formControlName="url"
                  autocomplete="url"
                  name="order-url-{{ index }}"
                  placeholder="{{ 'order.form.fields.url.placeholder' | translate }}"
                  data-testid="url-input"
                />
              </app-form-field>

              <div class="grid gap-4 md:grid-cols-2">
                <app-form-field
                  [label]="'order.form.fields.size.label' | translate"
                  [for]="'order-size-' + index"
                  [hint]="'order.form.fields.size.hint' | translate"
                >
                  <input
                    type="text"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    [id]="'order-size-' + index"
                    formControlName="size"
                    name="order-size-{{ index }}"
                    autocomplete="off"
                  />
                </app-form-field>

                <app-form-field
                  [label]="'order.form.fields.color.label' | translate"
                  [for]="'order-color-' + index"
                  [hint]="'order.form.fields.color.hint' | translate"
                >
                  <input
                    type="text"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    [id]="'order-color-' + index"
                    formControlName="color"
                    name="order-color-{{ index }}"
                    autocomplete="off"
                  />
                </app-form-field>
              </div>

              <div class="grid gap-4 md:grid-cols-2">
                <app-form-field
                  [label]="'order.form.fields.price.label' | translate"
                  [for]="'order-price-' + index"
                  [hint]="'order.form.fields.price.hint' | translate"
                  [error]="controlError(group.get('price'))"
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100"
                    [id]="'order-price-' + index"
                    formControlName="price"
                    name="order-price-{{ index }}"
                    autocomplete="off"
                  />
                </app-form-field>

                <app-form-field
                  [label]="'order.form.fields.notes.label' | translate"
                  [for]="'order-notes-' + index"
                  [hint]="'order.form.fields.notes.hint' | translate"
                >
                  <textarea
                    rows="3"
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-100 min-h-[96px]"
                    [id]="'order-notes-' + index"
                    formControlName="notes"
                    name="order-notes-{{ index }}"
                    autocomplete="off"
                  ></textarea>
                </app-form-field>
              </div>
            </div>
          </app-card>
        </ng-container>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          class="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          (click)="addItem()"
          [disabled]="itemControls.length >= maxItems"
          data-testid="add-item"
        >
          {{ 'order.form.add' | translate }}
        </button>

        <app-button
          variant="primary"
          type="submit"
          [disabled]="form.invalid || itemControls.length === 0 || submitting"
          data-testid="submit-order"
        >
          <span class="flex items-center gap-2">
            <span>{{ 'order.form.actions.next' | translate }}</span>
            <span *ngIf="submitting" class="h-2 w-2 animate-pulse rounded-full bg-white"></span>
          </span>
        </app-button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderFormComponent {
  private readonly appState = inject(AppStateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxItems = 3;
  submitting = false;

  readonly form = this.fb.group({
    items: this.fb.array<FormGroup>([], { validators: [uniqueLinksValidator()] })
  });

  constructor() {
    this.bootstrapFromState();
    this.form
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.persistDraft(value as OrderFormValue | null));
  }

  get itemControls(): FormGroup[] {
    return (this.form.get('items') as FormArray<FormGroup>).controls;
  }

  addItem(): void {
    if (this.itemControls.length >= this.maxItems) {
      return;
    }

    this.itemsArray.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.itemControls.length <= 1) {
      return;
    }

    this.itemsArray.removeAt(index);
    this.persistDraft(this.form.getRawValue() as OrderFormValue);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const { items } = this.form.getRawValue() as OrderFormValue;
    const mapped = items.map((item) => toProductLink(item));
    this.appState.setOrderItems(mapped);

    this.router.navigateByUrl('/delivery').finally(() => {
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

    const errors = control.errors ?? {};

    if (errors['required']) {
      return this.translate.instant('order.form.errors.required');
    }

    if (errors['url']) {
      return this.translate.instant('order.form.errors.url');
    }

    if (errors['min']) {
      return this.translate.instant('order.form.errors.priceMin');
    }

    if (errors['duplicateLink']) {
      return this.translate.instant('order.form.errors.duplicate');
    }

    return null;
  }

  private get itemsArray(): FormArray<FormGroup> {
    return this.form.get('items') as FormArray<FormGroup>;
  }

  private createItemGroup(initial?: ProductLink): FormGroup {
    return this.fb.group({
      url: this.fb.control(initial?.url ?? '', {
        validators: [Validators.required, urlValidator()]
      }),
      size: this.fb.control(initial?.size ?? ''),
      color: this.fb.control(initial?.color ?? ''),
      price: this.fb.control(initial?.price != null ? String(initial.price) : '', {
        validators: [Validators.min(0)]
      }),
      notes: this.fb.control(initial?.notes ?? '')
    });
  }

  private bootstrapFromState(): void {
    const items = this.appState.orderDraft().items;

    if (!items.length) {
      this.addItem();
      return;
    }

    items.slice(0, this.maxItems).forEach((item) => {
      this.itemsArray.push(this.createItemGroup(item));
    });
  }

  private persistDraft(value: OrderFormValue | null): void {
    const items = (value?.items ?? []) as ProductLinkFormValue[];
    const mapped = items.map((item: ProductLinkFormValue) => toProductLink(item));
    this.appState.setOrderItems(mapped);
  }

}
