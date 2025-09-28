import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { DeliveryFormComponent } from '../../features/delivery/delivery-form.component';

@Component({
  standalone: true,
  selector: 'app-delivery-page',
  imports: [TranslateModule, DeliveryFormComponent],
  template: `
    <section class="space-y-4">
      <h2 class="text-2xl font-semibold text-slate-900">{{ 'pages.delivery.title' | translate }}</h2>
      <p class="max-w-2xl text-slate-600">{{ 'pages.delivery.description' | translate }}</p>
      <p class="text-sm text-slate-500">{{ 'pages.delivery.helper' | translate }}</p>
      <app-delivery-form />
    </section>
  `
})
export class DeliveryPageComponent {}
