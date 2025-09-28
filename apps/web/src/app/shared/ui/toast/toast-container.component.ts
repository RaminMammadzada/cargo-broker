import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { ButtonComponent } from '../button/button.component';
import { FocusTrapDirective } from '../../a11y/focus-trap.directive';

import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, ButtonComponent, TranslateModule, FocusTrapDirective],
  template: `
    <section
      class="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4 sm:items-end"
      appFocusTrap="toasts().length > 0"
      [appFocusTrapAutoFocus]="true"
      role="region"
      aria-live="polite"
      [attr.aria-label]="'toast.regionLabel' | translate"
    >
      <article
        *ngFor="let toast of toasts()"
        class="pointer-events-auto w-full max-w-sm rounded-xl border px-4 py-3 shadow-lg"
        [ngClass]="variantClass(toast)"
        role="status"
        [attr.aria-live]="toast.variant === 'error' ? 'assertive' : 'polite'"
        tabindex="-1"
      >
        <div class="flex items-start gap-3">
          <div class="flex-1">
            <h3 *ngIf="toast.title" class="text-sm font-semibold">{{ toast.title }}</h3>
            <p class="text-sm text-slate-700" [ngClass]="toast.variant === 'error' ? 'text-red-700' : ''">{{ toast.message }}</p>
          </div>
          <app-button
            variant="ghost"
            size="sm"
            (click)="dismiss(toast.id)"
            [ariaLabel]="'toast.close' | translate"
          >
            ✕
          </app-button>
        </div>
      </article>
      <p *ngIf="!toasts().length" class="sr-only">{{ 'toast.none' | translate }}</p>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);

  readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  variantClass(toast: Toast): string {
    switch (toast.variant) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50 text-emerald-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'info':
      default:
        return 'border-slate-200 bg-white text-slate-700';
    }
  }
}
