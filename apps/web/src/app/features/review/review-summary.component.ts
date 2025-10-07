import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { AppStateService } from '../../data-access/state/app-state.service';
import { DeliveryInfo, ProductLink } from '../../data-access/models/order.model';
import { OrderService } from '../../data-access/services/order.service';
import { OrderNotificationService } from '../../data-access/services/order-notification.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-review-summary',
  standalone: true,
  imports: [CommonModule, TranslateModule, ButtonComponent, CardComponent],
  template: `
    <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div class="space-y-6">
        <app-card data-testid="order-summary">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ 'review.summary.order.title' | translate }}
              </h3>
              <p class="text-sm text-slate-600">
                {{ 'review.summary.order.description' | translate }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              (click)="edit('order')"
              data-testid="edit-order"
            >
              {{ 'review.summary.order.actions.edit' | translate }}
            </button>
          </div>

          <ul class="mt-6 space-y-4" aria-label="Order items">
            <li
              *ngFor="let item of items(); index as index"
              class="rounded-lg border border-slate-200 bg-slate-50/60 p-4"
              data-testid="order-item"
            >
              <div class="flex flex-wrap items-center justify-between gap-4">
                <p class="text-sm font-medium text-slate-900">
                  {{ 'review.summary.order.itemLabel' | translate : { index: index + 1 } }}
                </p>
                <p *ngIf="item.price !== undefined" class="text-sm font-semibold text-slate-800">
                  {{ item.price | currency: 'AZN' : 'symbol-narrow' : '1.0-2' }}
                </p>
              </div>

              <dl class="mt-3 grid gap-2 text-xs text-slate-600">
                <div>
                  <dt class="font-semibold">
                    {{ 'review.summary.order.fields.url' | translate }}
                  </dt>
                  <dd>
                    <a
                      class="break-words text-primary-600 underline-offset-2 hover:underline"
                      [href]="item.url"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {{ item.url }}
                    </a>
                  </dd>
                </div>
                <div *ngIf="item.size">
                  <dt class="font-semibold">{{ 'review.summary.order.fields.size' | translate }}</dt>
                  <dd>{{ item.size }}</dd>
                </div>
                <div *ngIf="item.color">
                  <dt class="font-semibold">{{ 'review.summary.order.fields.color' | translate }}</dt>
                  <dd>{{ item.color }}</dd>
                </div>
                <div *ngIf="item.notes">
                  <dt class="font-semibold">{{ 'review.summary.order.fields.notes' | translate }}</dt>
                  <dd>{{ item.notes }}</dd>
                </div>
              </dl>
            </li>
          </ul>
        </app-card>

        <app-card data-testid="delivery-summary">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="space-y-1">
              <h3 class="text-lg font-semibold text-slate-900">
                {{ 'review.summary.delivery.title' | translate }}
              </h3>
              <p class="text-sm text-slate-600">
                {{ 'review.summary.delivery.description' | translate }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              (click)="edit('delivery')"
              data-testid="edit-delivery"
            >
              {{ 'review.summary.delivery.actions.edit' | translate }}
            </button>
          </div>

          <dl class="mt-6 grid gap-4 text-sm text-slate-700">
            <div>
              <dt class="font-semibold text-slate-900">
                {{ 'review.summary.delivery.fields.recipient' | translate }}
              </dt>
              <dd class="mt-1">{{ deliveryInfo()?.recipientName }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-slate-900">
                {{ 'review.summary.delivery.fields.method.label' | translate }}
              </dt>
              <dd class="mt-1">
                {{ 'review.summary.delivery.fields.method.options.' + deliveryInfo()?.method | translate }}
              </dd>
            </div>
            <div>
              <dt class="font-semibold text-slate-900">
                {{ 'review.summary.delivery.fields.company' | translate }}
              </dt>
              <dd class="mt-1">{{ deliveryInfo()?.companyName }}</dd>
            </div>
            <div *ngIf="deliveryInfo()?.method === 'pickup'">
              <dt class="font-semibold text-slate-900">
                {{ 'review.summary.delivery.fields.pickupPoint' | translate }}
              </dt>
              <dd class="mt-1">{{ deliveryInfo()?.pickupPointName }}</dd>
            </div>
            <div *ngIf="deliveryInfo()?.method === 'courier'">
              <dt class="font-semibold text-slate-900">
                {{ 'review.summary.delivery.fields.address' | translate }}
              </dt>
              <dd class="mt-1">{{ deliveryInfo()?.addressLine }}</dd>
            </div>
            <div>
              <dt class="font-semibold text-slate-900">
                {{ 'review.summary.delivery.fields.customerCode' | translate }}
              </dt>
              <dd class="mt-1">{{ deliveryInfo()?.customerCode }}</dd>
            </div>
          </dl>
        </app-card>
      </div>

      <app-card data-testid="confirm-summary" class="h-max">
        <div class="space-y-6">
          <div class="space-y-1">
            <h3 class="text-lg font-semibold text-slate-900">
              {{ 'review.summary.totals.title' | translate }}
            </h3>
            <p class="text-sm text-slate-600">
              {{ 'review.summary.totals.description' | translate }}
            </p>
          </div>

          <div class="space-y-3 text-sm text-slate-700">
            <div class="flex items-center justify-between">
              <span>{{ 'review.summary.totals.itemsLabel' | translate : { count: items().length } }}</span>
              <span>{{ total() | currency: 'AZN' : 'symbol-narrow' : '1.0-2' }}</span>
            </div>
            <div class="flex items-center justify-between text-xs text-slate-500">
              <span>{{ 'review.summary.totals.deliveryLabel' | translate }}</span>
              <span>{{ 'review.summary.delivery.fields.method.options.' + deliveryInfo()?.method | translate }}</span>
            </div>
          </div>

          <app-button
            variant="primary"
            class="w-full justify-center"
            (click)="confirm()"
            [disabled]="submitting()"
            data-testid="confirm-order"
          >
            <span class="flex items-center justify-center gap-2">
              <span>{{ 'review.summary.totals.actions.confirm' | translate }}</span>
              <span
                *ngIf="submitting()"
                class="h-2 w-2 animate-pulse rounded-full bg-white"
                aria-hidden="true"
              ></span>
            </span>
          </app-button>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReviewSummaryComponent {
  private readonly appState = inject(AppStateService);
  private readonly orderService = inject(OrderService);
  private readonly orderNotificationService = inject(OrderNotificationService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastService);

  readonly items = computed<ProductLink[]>(() => this.appState.orderDraft().items);
  readonly deliveryInfo = computed<DeliveryInfo | null>(() => this.appState.delivery());
  readonly total = computed(() => this.appState.total());

  readonly submitting = signal(false);

  edit(section: 'order' | 'delivery'): void {
    this.router.navigateByUrl(`/${section}`);
  }

  async confirm(): Promise<void> {
    if (this.submitting() || !this.items().length) {
      return;
    }

    const delivery = this.deliveryInfo();
    if (!delivery) {
      return;
    }

    this.submitting.set(true);
    const submission = this.orderService.submit(this.appState.orderDraft(), delivery, this.total());

    try {
      await firstValueFrom(this.orderNotificationService.notifyOrder(submission));
      this.appState.setPaymentStatus('initiated');
      await this.router.navigateByUrl('/payment', { state: { orderId: submission.id } });
      this.toast.show({
        variant: 'success',
        message: this.translate.instant('review.summary.notifications.success')
      });
    } catch (error) {
      console.error('Failed to send Telegram notification', error);
      this.toast.show({
        variant: 'error',
        message: this.translate.instant('review.summary.notifications.error')
      });
    } finally {
      this.submitting.set(false);
    }
  }
}
