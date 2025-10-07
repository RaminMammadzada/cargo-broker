import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

import { TelegramSettingsService } from '../../data-access/services/telegram-settings.service';
import { FormFieldComponent } from '../../shared/ui/form-field/form-field.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-telegram-settings-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FormFieldComponent, ButtonComponent],
  template: `
    <div class="mx-auto max-w-2xl space-y-8">
      <header class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-wide text-primary-600">
          {{ 'admin.telegram.badge' | translate }}
        </p>
        <h1 class="text-3xl font-bold text-slate-900">
          {{ 'admin.telegram.title' | translate }}
        </h1>
        <p class="text-sm text-slate-600">
          {{ 'admin.telegram.description' | translate }}
        </p>
      </header>

      <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div
          *ngIf="!botConfigured()"
          class="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {{ 'admin.telegram.form.missingBotToken' | translate }}
        </div>
        <form class="space-y-6" [formGroup]="form" (ngSubmit)="onSubmit()" novalidate>
          <app-form-field
            [label]="'admin.telegram.form.phoneNumber.label' | translate"
            [hint]="'admin.telegram.form.phoneNumber.hint' | translate"
            [error]="controlError(form.get('phoneNumber'))"
            [required]="true"
          >
            <input
              type="text"
              formControlName="phoneNumber"
              class="input"
              autocomplete="off"
              [attr.aria-busy]="loading()"
              placeholder="{{ 'admin.telegram.form.phoneNumber.placeholder' | translate }}"
            />
          </app-form-field>

          <div class="flex items-center justify-between gap-4">
            <p class="text-xs text-slate-500" *ngIf="lastUpdated() as timestamp">
              {{ 'admin.telegram.lastUpdated' | translate : { timestamp } }}
            </p>
            <p class="text-xs text-slate-500" *ngIf="chatId() as chat">
              {{ 'admin.telegram.form.currentChat' | translate : { chat } }}
            </p>
            <app-button
              variant="primary"
              type="submit"
              class="ml-auto"
              [disabled]="form.invalid || loading() || saving()"
            >
              <span class="flex items-center gap-2">
                <span>{{ 'admin.telegram.form.actions.save' | translate }}</span>
                <span
                  *ngIf="saving()"
                  class="h-2 w-2 animate-pulse rounded-full bg-white"
                  aria-hidden="true"
                ></span>
              </span>
            </app-button>
          </div>
        </form>
      </section>
    </div>
  `
})
export class TelegramSettingsPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly settingsService = inject(TelegramSettingsService);
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastService);

  readonly form = this.fb.nonNullable.group({
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[\d\s()+-]+$/)]]
  });

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly lastUpdated = signal<string | null>(null);
  readonly chatId = signal<string | null>(null);
  readonly botConfigured = signal<boolean>(true);

  constructor() {
    this.settingsService
      .getSettings()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (settings) => {
          this.form.patchValue({ phoneNumber: settings.phoneNumber ?? '' });
          this.chatId.set(settings.chatId);
          this.botConfigured.set(settings.botTokenConfigured);
          this.lastUpdated.set(settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleString() : null);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load telegram settings', error);
          this.toast.show({
            variant: 'error',
            message: this.translate.instant('admin.telegram.notifications.loadError')
          });
          this.loading.set(false);
        }
      });
  }

  controlError(control: ReturnType<typeof this.form.get>): string | null {
    if (!control || !control.invalid || !control.touched) {
      return null;
    }

    if (control.hasError('required')) {
      return this.translate.instant('admin.telegram.form.errors.required');
    }

    if (control.hasError('pattern')) {
      return this.translate.instant('admin.telegram.form.errors.pattern');
    }

    return this.translate.instant('admin.telegram.form.errors.generic');
  }

  async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const phoneNumber = this.form.getRawValue().phoneNumber.trim();
    this.saving.set(true);

    try {
      const settings = await firstValueFrom(this.settingsService.updateSettings(phoneNumber));
      this.toast.show({
        variant: 'success',
        message: this.translate.instant('admin.telegram.notifications.saved')
      });
      this.chatId.set(settings.chatId);
      this.botConfigured.set(settings.botTokenConfigured);
      this.lastUpdated.set(settings.lastSyncedAt ? new Date(settings.lastSyncedAt).toLocaleString() : new Date().toLocaleString());
    } catch (error) {
      console.error('Failed to update telegram settings', error);
      this.toast.show({
        variant: 'error',
        message: this.translate.instant('admin.telegram.notifications.saveError')
      });
    } finally {
      this.saving.set(false);
    }
  }
}
