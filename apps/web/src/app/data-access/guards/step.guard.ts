import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { AppStateService } from '../state/app-state.service';

type Requirement = 'order' | 'delivery';

type RequirementConfig = Requirement | Requirement[];

const REDIRECT_MAP: Record<Requirement, string> = {
  order: '/order',
  delivery: '/delivery'
};

function normalize(config?: RequirementConfig): Requirement[] {
  if (!config) {
    return [];
  }

  return Array.isArray(config) ? config : [config];
}

function isRequirementSatisfied(requirement: Requirement, appState: AppStateService): boolean {
  switch (requirement) {
    case 'order':
      return appState.hasOrderDraft();
    case 'delivery':
      return appState.hasDelivery();
    default:
      return true;
  }
}

function redirectFor(requirement: Requirement, router: Router): UrlTree {
  const target = REDIRECT_MAP[requirement] ?? '/';
  return router.createUrlTree([target]);
}

export const stepGuard: CanActivateFn = (route) => {
  const appState = inject(AppStateService);
  const router = inject(Router);
  const requirements = normalize(route.data?.['requires'] as RequirementConfig | undefined);

  if (!requirements.length) {
    return true;
  }

  const firstUnmet = requirements.find((requirement) => !isRequirementSatisfied(requirement, appState));

  if (!firstUnmet) {
    return true;
  }

  return redirectFor(firstUnmet, router);
};
