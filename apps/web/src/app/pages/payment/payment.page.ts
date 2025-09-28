import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PaymentComponent } from '../../features/payment/payment.component';

@Component({
  standalone: true,
  selector: 'app-payment-page',
  imports: [TranslateModule, PaymentComponent],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">{{ 'pages.payment.title' | translate }}</h2>
      <p class="max-w-2xl text-slate-600">{{ 'pages.payment.description' | translate }}</p>
      <app-payment />
    </section>
  `
})
export class PaymentPageComponent {}
