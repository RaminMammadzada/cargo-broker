import { CommonModule, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { filter, map, startWith } from 'rxjs';

import { StepDefinition, StepperComponent } from '../shared/ui/stepper/stepper.component';
import { ToastContainerComponent } from '../shared/ui/toast/toast-container.component';

import { LanguageSelectorComponent } from './language-selector.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, TranslateModule, NgIf, LanguageSelectorComponent, StepperComponent, ToastContainerComponent],
  template: `
    <app-toast-container />
    <a
      class="skip-link"
      href="#main-content"
    >
      {{ 'layout.skipToContent' | translate }}
    </a>
    <div class="min-h-screen bg-slate-100 text-slate-900">
      <header class="border-b border-slate-200 bg-white/70 backdrop-blur sticky top-0 z-10" role="banner">
        <div class="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <a routerLink="/" class="flex items-center gap-2 text-lg font-semibold tracking-tight" aria-label="{{ 'layout.homeLink' | translate }}">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">CB</span>
            <span>{{ 'app.brand' | translate }}</span>
          </a>
          <app-language-selector />
        </div>
        <ng-container *ngIf="activeStepId() as currentStep">
          <div class="border-t border-slate-200 bg-white/80">
            <div class="mx-auto max-w-5xl px-6 py-3">
              <app-stepper [steps]="checkoutSteps" [currentStepId]="currentStep" />
            </div>
          </div>
        </ng-container>
      </header>

      <main id="main-content" class="mx-auto max-w-5xl px-6 py-10" tabindex="-1" role="main">
        <router-outlet />
      </main>

      <footer class="border-t border-slate-200 bg-white/70 backdrop-blur" role="contentinfo">
        <div class="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>{{ 'layout.footer.copyright' | translate: { year: currentYear } }}</p>
          <p class="flex items-center gap-3 text-xs text-slate-600">
            <span>{{ 'layout.footer.note' | translate }}</span>
            <a
              routerLink="/admin/telegram"
              class="font-medium text-primary-600 underline-offset-2 hover:underline"
            >
              {{ 'layout.footer.adminLink' | translate }}
            </a>
          </p>
        </div>
      </footer>
    </div>
  `
})
export class LayoutComponent {
  private readonly router = inject(Router);

  readonly checkoutSteps: StepDefinition[] = [
    { id: 'order', labelKey: 'nav.order', route: '/order' },
    { id: 'delivery', labelKey: 'nav.delivery', route: '/delivery' },
    { id: 'review', labelKey: 'nav.review', route: '/review' },
    { id: 'payment', labelKey: 'nav.payment', route: '/payment' },
    { id: 'status', labelKey: 'nav.status', route: '/status' }
  ];

  readonly activeStepId = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const url = this.router.url;
        const step = this.checkoutSteps.find((item) => url.startsWith(item.route));
        return step?.id ?? null;
      })
    ),
    { initialValue: null }
  );

  readonly currentYear = new Date().getFullYear();
}
