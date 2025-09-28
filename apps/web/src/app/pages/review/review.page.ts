import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { ReviewSummaryComponent } from '../../features/review/review-summary.component';

@Component({
  standalone: true,
  selector: 'app-review-page',
  imports: [TranslateModule, ReviewSummaryComponent],
  template: `
    <section class="space-y-6">
      <div class="space-y-2">
        <h2 class="text-2xl font-semibold text-slate-900">{{ 'pages.review.title' | translate }}</h2>
        <p class="max-w-2xl text-slate-600">{{ 'pages.review.description' | translate }}</p>
      </div>

      <app-review-summary />
    </section>
  `
})
export class ReviewPageComponent {}
