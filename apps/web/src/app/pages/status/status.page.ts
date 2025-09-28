import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { StatusService } from '../../data-access/services/status.service';
import { AppStateService } from '../../data-access/state/app-state.service';
import { CardComponent } from '../../shared/ui/card/card.component';

@Component({
  standalone: true,
  selector: 'app-status-page',
  imports: [CommonModule, RouterLink, TranslateModule, CardComponent],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">{{ 'pages.status.title' | translate }}</h2>
      <p class="text-slate-600">{{ 'pages.status.description' | translate }}</p>

      <ng-container *ngIf="order() as current; else unknownOrder">
        <app-card>
          <div class="space-y-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-slate-500 uppercase tracking-wide">
                {{ 'status.reference' | translate : { id: current.id } }}
              </p>
              <h3 class="text-lg font-semibold text-slate-900">
                {{ ('status.states.' + current.payment) | translate }}
              </h3>
              <p class="text-sm text-slate-600">{{ 'status.helper' | translate }}</p>
            </div>

            <div class="rounded-lg bg-slate-50 p-4 text-sm text-slate-700 space-y-2">
              <div class="flex items-center justify-between">
                <span>{{ 'status.summary.total' | translate }}</span>
                <span class="font-semibold">{{ current.total | currency: 'AZN' : 'symbol-narrow' : '1.0-2' }}</span>
              </div>
              <div>
                <p class="text-xs text-slate-500">
                  {{ 'status.summary.recipient' | translate }}
                </p>
                <p class="font-medium text-slate-800">{{ current.delivery.recipientName }}</p>
              </div>
            </div>

            <div class="text-xs text-slate-500">
              <p>{{ 'status.nextSteps' | translate }}</p>
            </div>
          </div>
        </app-card>
      </ng-container>

      <ng-template #unknownOrder>
        <app-card class="bg-amber-50 text-amber-900">
          <div class="space-y-2">
            <h3 class="text-base font-semibold">{{ 'status.missing.title' | translate }}</h3>
            <p class="text-sm">{{ 'status.missing.description' | translate }}</p>
          </div>
        </app-card>
      </ng-template>

      <div class="flex flex-wrap gap-3">
        <a
          routerLink="/payment"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          {{ 'pages.status.actions.backToPayment' | translate }}
        </a>
        <a
          routerLink="/orders"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-white"
        >
          {{ 'pages.status.actions.viewOrders' | translate }}
        </a>
        <a
          routerLink="/"
          class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          {{ 'pages.status.actions.startNew' | translate }}
        </a>
      </div>
    </section>
  `
})
export class StatusPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly statusService = inject(StatusService);
  private readonly appState = inject(AppStateService);
  private readonly params = toSignal(this.route.paramMap);

  readonly order = computed(() => {
    const id = this.params()?.get('id');
    if (!id) {
      return null;
    }

    return this.statusService.get(id);
  });

  constructor() {
    effect(() => {
      const current = this.order();
      if (current) {
        this.appState.setPaymentStatus(current.payment);
      }
    });
  }
}
