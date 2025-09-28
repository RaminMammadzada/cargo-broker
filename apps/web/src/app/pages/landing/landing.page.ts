import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'app-landing-page',
  imports: [RouterLink, TranslateModule],
  template: `
    <section class="space-y-6">
      <p class="text-sm uppercase tracking-wide text-primary-600">{{ 'landing.badge' | translate }}</p>
      <h1 class="text-3xl font-semibold text-slate-900 sm:text-4xl">{{ 'landing.title' | translate }}</h1>
      <p class="max-w-2xl text-lg text-slate-600">{{ 'landing.description' | translate }}</p>
      <div class="flex flex-wrap gap-3">
        <a
          routerLink="/order"
          class="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-primary-700"
        >
          {{ 'landing.actions.start' | translate }}
        </a>
        <a
          routerLink="/review"
          class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-white"
        >
          {{ 'landing.actions.review' | translate }}
        </a>
      </div>
    </section>
  `
})
export class LandingPageComponent {}
