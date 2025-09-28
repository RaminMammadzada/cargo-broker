import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

export interface StepDefinition {
  id: string;
  labelKey: string;
  route: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, RouterLink, TranslateModule],
  template: `
    <nav aria-label="{{ 'nav.checkoutProgress' | translate }}" class="w-full">
      <ol class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" role="list">
        <li *ngFor="let step of steps; let index = index" class="flex-1" role="listitem">
          <a
            [routerLink]="step.route"
            class="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition"
            [ngClass]="statusClass(index)"
            [attr.aria-current]="status(index) === 'current' ? 'step' : null"
            [attr.aria-disabled]="status(index) === 'upcoming'"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold"
              [ngClass]="badgeClass(index)"
            >
              <ng-container *ngIf="status(index) === 'complete'; else indexLabel">✓</ng-container>
              <ng-template #indexLabel>{{ index + 1 }}</ng-template>
            </span>
            <span class="text-sm font-medium text-slate-700">
              {{ step.labelKey | translate }}
            </span>
            <span class="sr-only">{{ 'nav.stepStatus.' + status(index) | translate }}</span>
          </a>
        </li>
      </ol>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepperComponent {
  @Input() steps: StepDefinition[] = [];
  @Input() currentStepId: string | null = null;

  status(index: number): 'complete' | 'current' | 'upcoming' {
    const activeIndex = this.steps.findIndex((step) => step.id === this.currentStepId);
    if (activeIndex === -1) {
      return 'upcoming';
    }
    if (index < activeIndex) {
      return 'complete';
    }
    if (index === activeIndex) {
      return 'current';
    }
    return 'upcoming';
  }

  statusClass(index: number): string {
    switch (this.status(index)) {
      case 'complete':
        return 'bg-primary-50 text-primary-700 border-primary-100';
      case 'current':
        return 'bg-white text-primary-700 border-primary-200 shadow';
      case 'upcoming':
      default:
        return 'bg-transparent text-slate-500 hover:bg-slate-100';
    }
  }

  badgeClass(index: number): string {
    switch (this.status(index)) {
      case 'complete':
        return 'border-primary-200 bg-primary-600 text-white';
      case 'current':
        return 'border-primary-300 bg-white text-primary-700';
      case 'upcoming':
      default:
        return 'border-slate-200 bg-white text-slate-500';
    }
  }
}
