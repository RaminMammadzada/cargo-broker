import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { OrderSubmission } from '../../data-access/models/order.model';
import { OrderService } from '../../data-access/services/order.service';
import { CardComponent } from '../../shared/ui/card/card.component';

@Component({
  standalone: true,
  selector: 'app-orders-page',
  imports: [CommonModule, RouterLink, TranslateModule, CardComponent],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">{{ 'pages.orders.title' | translate }}</h2>
      <p class="text-slate-600">{{ 'pages.orders.description' | translate }}</p>

      <ng-container *ngIf="hasOrders(); else emptyState">
        <div class="grid gap-4 md:grid-cols-2">
          <app-card *ngFor="let order of orders(); trackBy: trackById">
            <div class="space-y-3">
              <div class="space-y-1">
                <p class="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {{ 'orders.reference' | translate : { id: order.id } }}
                </p>
                <h3 class="text-lg font-semibold text-slate-900">
                  {{ ('status.states.' + order.payment) | translate }}
                </h3>
                <p class="text-sm text-slate-600">
                  {{ 'orders.createdAt' | translate : { date: order.createdAt | date: 'medium' } }}
                </p>
              </div>

              <dl class="grid grid-cols-2 gap-2 text-sm text-slate-600">
                <div class="space-y-1">
                  <dt class="text-xs uppercase tracking-wide text-slate-500">
                    {{ 'orders.total' | translate }}
                  </dt>
                  <dd class="font-medium text-slate-900">
                    {{ order.total | currency: 'AZN' : 'symbol-narrow' : '1.0-2' }}
                  </dd>
                </div>
                <div class="space-y-1">
                  <dt class="text-xs uppercase tracking-wide text-slate-500">
                    {{ 'orders.recipient' | translate }}
                  </dt>
                  <dd class="font-medium text-slate-900">{{ order.delivery.recipientName }}</dd>
                </div>
              </dl>

              <a
                class="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                [routerLink]="['/status', order.id]"
              >
                {{ 'pages.orders.actions.viewStatus' | translate }}
              </a>
            </div>
          </app-card>
        </div>
      </ng-container>

      <ng-template #emptyState>
        <app-card class="bg-slate-50 text-slate-700">
          <div class="space-y-2">
            <h3 class="text-base font-semibold text-slate-900">{{ 'pages.orders.empty.title' | translate }}</h3>
            <p class="text-sm">{{ 'pages.orders.empty.description' | translate }}</p>
            <div>
              <a
                routerLink="/order"
                class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                {{ 'pages.orders.empty.action' | translate }}
              </a>
            </div>
          </div>
        </app-card>
      </ng-template>
    </section>
  `
})
export class OrdersPageComponent {
  private readonly orderService = inject(OrderService);

  readonly orders = signal<OrderSubmission[]>(this.orderService.list());
  readonly hasOrders = computed(() => this.orders().length > 0);

  trackById(_: number, order: OrderSubmission): string {
    return order.id;
  }
}

