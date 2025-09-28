import { Signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { stepGuard } from './step.guard';
import { AppStateService } from '../state/app-state.service';

describe('stepGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let hasOrderDraftSpy: jasmine.Spy<() => boolean>;
  let hasDeliverySpy: jasmine.Spy<() => boolean>;

  function runGuard(data?: Record<string, unknown>): boolean | UrlTree {
    const route = { data } as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;

    return TestBed.runInInjectionContext(() => stepGuard(route, state)) as unknown as
      | boolean
      | UrlTree;
  }

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    hasOrderDraftSpy = jasmine.createSpy('hasOrderDraft');
    hasDeliverySpy = jasmine.createSpy('hasDelivery');

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        {
          provide: AppStateService,
          useValue: {
            hasOrderDraft: hasOrderDraftSpy as unknown as Signal<boolean>,
            hasDelivery: hasDeliverySpy as unknown as Signal<boolean>
          } satisfies Partial<AppStateService>
        }
      ]
    });
  });

  it('allows routes without requirements', () => {
    const result = runGuard();

    expect(result).toBeTrue();
    expect(hasOrderDraftSpy).not.toHaveBeenCalled();
    expect(hasDeliverySpy).not.toHaveBeenCalled();
  });

  it('allows navigation when the requirement is satisfied', () => {
    hasOrderDraftSpy.and.returnValue(true);

    const result = runGuard({ requires: 'order' });

    expect(result).toBeTrue();
    expect(hasOrderDraftSpy).toHaveBeenCalled();
  });

  it('redirects to the first unmet requirement', () => {
    hasOrderDraftSpy.and.returnValue(false);

    const result = runGuard({ requires: 'order' });

    expect(router.createUrlTree).toHaveBeenCalledWith(['/order']);
    expect(result).toBe(router.createUrlTree.calls.mostRecent().returnValue);
  });

  it('evaluates requirements in order and redirects to the first unmet one', () => {
    hasOrderDraftSpy.and.returnValue(true);
    hasDeliverySpy.and.returnValue(false);

    const result = runGuard({ requires: ['order', 'delivery'] });

    expect(hasOrderDraftSpy).toHaveBeenCalled();
    expect(hasDeliverySpy).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/delivery']);
    expect(result).toBe(router.createUrlTree.calls.mostRecent().returnValue);
  });
});
