import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { OrderFormComponent } from '../../features/order/order-form.component';

@Component({
  standalone: true,
  selector: 'app-order-page',
  imports: [TranslateModule, OrderFormComponent],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">{{ 'pages.order.title' | translate }}</h2>
      <p class="max-w-2xl text-slate-600">{{ 'pages.order.description' | translate }}</p>
      <app-order-form />
    </section>
  `
})
export class OrderPageComponent {}
