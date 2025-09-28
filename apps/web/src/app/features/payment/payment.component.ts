import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { AppStateService } from '../../data-access/state/app-state.service';
import { OrderSubmission } from '../../data-access/models/order.model';
import { OrderService } from '../../data-access/services/order.service';
import { PaymentService } from '../../data-access/services/payment.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';

type PaymentOutcome = 'approved' | 'failed';

function readNavigationOrderId(router: Router): string | null {
  const navigation = router.getCurrentNavigation();
  const state = (navigation?.extras.state as { orderId?: string } | undefined) ?? {};

  if (state.orderId) {
    return state.orderId;
  }

  if (typeof window !== 'undefined' && window.history.state?.['orderId']) {
    return window.history.state['orderId'] as string;
  }

  return null;
}

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent, CardComponent],
  template: `
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <ng-container *ngIf="submission() as resolved; else missingOrder">
        <app-card>
          <div class="space-y-6">
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ 'payment.summary.title' | translate }}
              </h3>
              <p class="text-sm text-slate-600">
                {{ 'payment.summary.description' | translate }}
              </p>
            </div>

            <div class="space-y-3 text-sm text-slate-700" data-testid="payment-breakdown">
              <div class="flex items-center justify-between">
                <span>{{ 'payment.summary.total' | translate }}</span>
                <span class="font-semibold text-slate-900">
                  {{ resolved.total | currency: 'AZN' : 'symbol-narrow' : '1.0-2' }}
                </span>
              </div>
              <div class="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                {{ 'payment.summary.helper' | translate }}
              </div>
            </div>

            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-slate-900">
                {{ 'payment.simulation.title' | translate }}
              </h4>
              <p class="text-xs text-slate-500">
                {{ 'payment.simulation.description' | translate }}
              </p>
              <div class="flex flex-wrap gap-2" role="group" aria-label="{{ 'payment.simulation.title' | translate }}">
                <button
                  type="button"
                  class="rounded-full border px-4 py-2 text-sm font-medium transition"
                  [class.bg-primary-600]="selectedOutcome() === 'approved'"
                  [class.text-white]="selectedOutcome() === 'approved'"
                  [class.border-primary-600]="selectedOutcome() === 'approved'"
                  [class.border-slate-300]="selectedOutcome() !== 'approved'"
                  [class.text-slate-700]="selectedOutcome() !== 'approved'"
                  (click)="selectOutcome('approved')"
                  [attr.aria-pressed]="selectedOutcome() === 'approved'"
                  aria-controls="payment-status"
                  data-testid="simulate-success"
                >
                  {{ 'payment.simulation.approved' | translate }}
                </button>
                <button
                  type="button"
                  class="rounded-full border px-4 py-2 text-sm font-medium transition"
                  [class.bg-rose-600]="selectedOutcome() === 'failed'"
                  [class.text-white]="selectedOutcome() === 'failed'"
                  [class.border-rose-600]="selectedOutcome() === 'failed'"
                  [class.border-slate-300]="selectedOutcome() !== 'failed'"
                  [class.text-slate-700]="selectedOutcome() !== 'failed'"
                  (click)="selectOutcome('failed')"
                  [attr.aria-pressed]="selectedOutcome() === 'failed'"
                  aria-controls="payment-status"
                  data-testid="simulate-failure"
                >
                  {{ 'payment.simulation.failed' | translate }}
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <app-button
                variant="primary"
                class="w-full justify-center"
                (click)="pay()"
                [disabled]="processing()"
                data-testid="pay-now"
              >
                <span class="flex items-center justify-center gap-2">
                  <span>{{ 'payment.actions.pay' | translate }}</span>
                  <span
                    *ngIf="processing()"
                    class="h-2 w-2 animate-ping rounded-full bg-white"
                    aria-hidden="true"
                  ></span>
                </span>
              </app-button>
              <p class="text-xs text-slate-600" *ngIf="hasStatusMessage()" id="payment-status" data-testid="payment-status">
                {{ ('payment.status.' + paymentStatus()) | translate }}
              </p>
            </div>
          </div>
        </app-card>

        <app-card class="h-max">
          <h3 class="text-sm font-semibold text-slate-900">{{ 'payment.details.title' | translate }}</h3>
          <dl class="mt-4 space-y-3 text-xs text-slate-600">
            <div>
              <dt class="font-medium text-slate-500">{{ 'payment.details.orderId' | translate }}</dt>
              <dd class="text-slate-800">{{ resolved.id }}</dd>
            </div>
            <div>
              <dt class="font-medium text-slate-500">{{ 'payment.details.items' | translate }}</dt>
              <dd class="text-slate-800">{{ resolved.draft.items.length }}</dd>
            </div>
            <div>
              <dt class="font-medium text-slate-500">{{ 'payment.details.recipient' | translate }}</dt>
              <dd class="text-slate-800">{{ resolved.delivery.recipientName }}</dd>
            </div>
            <div>
              <dt class="font-medium text-slate-500">{{ 'payment.details.method' | translate }}</dt>
              <dd class="text-slate-800">
                {{ 'review.summary.delivery.fields.method.options.' + resolved.delivery.method | translate }}
              </dd>
            </div>
          </dl>
        </app-card>
      </ng-container>
    </div>

    <ng-template #missingOrder>
      <app-card class="bg-amber-50 text-amber-900" data-testid="missing-order">
        <div class="space-y-2">
          <h3 class="text-base font-semibold">
            {{ 'payment.missing.title' | translate }}
          </h3>
          <p class="text-sm">
            {{ 'payment.missing.description' | translate }}
          </p>
        </div>
      </app-card>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly appState = inject(AppStateService);
  private readonly orderService = inject(OrderService);
  private readonly paymentService = inject(PaymentService);

  readonly selectedOutcome = signal<PaymentOutcome>('approved');
  readonly processing = signal(false);
  readonly submission = signal<OrderSubmission | null>(null);
  readonly paymentStatus = computed(() => this.appState.paymentStatus());
  readonly hasStatusMessage = computed(() => {
    const status = this.paymentStatus();
    return status !== 'idle';
  });

  ngOnInit(): void {
    const orderId = readNavigationOrderId(this.router);

    if (orderId) {
      const submission = this.orderService.getById(orderId);
      if (submission) {
        this.submission.set(submission);
        this.appState.setPaymentStatus(submission.payment);
        return;
      }
    }

    this.submission.set(null);
  }

  selectOutcome(outcome: PaymentOutcome): void {
    this.selectedOutcome.set(outcome);
  }

  async pay(): Promise<void> {
    if (this.processing()) {
      return;
    }

    const submission = this.submission();
    if (!submission) {
      return;
    }

    this.processing.set(true);
    this.appState.setPaymentStatus('initiated');

    try {
      const result = await this.paymentService.pay(submission.id, {
        outcome: this.selectedOutcome()
      });

      if (!result) {
        this.appState.setPaymentStatus('failed');
        return;
      }

      this.submission.set(result);
      this.appState.setPaymentStatus(result.payment);
      await this.router.navigate(['/status', result.id], {
        state: { orderId: result.id }
      });
    } finally {
      this.processing.set(false);
    }
  }
}
