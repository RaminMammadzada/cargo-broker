import { Component } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AppStateService } from '../data-access/state/app-state.service';
import { Language } from '../data-access/models/order.model';

import { LayoutComponent } from './layout.component';
import { LanguageSelectorComponent } from './language-selector.component';
import { enTranslations } from '../testing/en-translations.fixture';
import { provideTranslateTesting } from '../testing/translate-testing.module';

@Component({
  standalone: true,
  template: `<p>Stub</p>`
})
class StubComponent {}

describe('LayoutComponent', () => {
  let fixture: ComponentFixture<LayoutComponent>;
  let translate: TranslateService;
  let router: Router;
  const mockAppState = {
    language: signal<Language>('en')
  } as Partial<AppStateService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LayoutComponent,
        LanguageSelectorComponent,
        RouterTestingModule.withRoutes(
          [
            { path: '', component: StubComponent },
            { path: 'order', component: StubComponent },
            { path: 'delivery', component: StubComponent },
            { path: 'review', component: StubComponent },
            { path: 'payment', component: StubComponent },
            { path: 'status/:id', component: StubComponent }
          ],
          { initialNavigation: 'enabledBlocking' }
        ),
        provideTranslateTesting()
      ],
      providers: [{ provide: AppStateService, useValue: mockAppState }]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
  });

  it('should render the brand and navigation links', () => {
    const element = fixture.nativeElement as HTMLElement;
    const headerLink = element.querySelector('header a');
    expect(headerLink?.textContent).toContain(enTranslations.app.brand);

    expect(element.querySelector('app-toast-container')).toBeTruthy();
  });

  it('exposes a skip link targeting the main content area', () => {
    const element = fixture.nativeElement as HTMLElement;
    const skipLink = element.querySelector('a.skip-link') as HTMLAnchorElement;
    expect(skipLink).toBeTruthy();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('should render the stepper with the current step highlighted', fakeAsync(() => {
    fixture.ngZone?.run(() => router.navigateByUrl('/order'));
    tick();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const stepLabels = Array.from(element.querySelectorAll('app-stepper li span.font-medium')).map((node) =>
      node.textContent?.trim()
    );
    expect(stepLabels).toEqual([
      enTranslations.nav.order,
      enTranslations.nav.delivery,
      enTranslations.nav.review,
      enTranslations.nav.payment,
      enTranslations.nav.status
    ]);

    fixture.ngZone?.run(() => router.navigateByUrl('/delivery'));
    tick();
    fixture.detectChanges();

    const badges = Array.from(element.querySelectorAll('app-stepper span.rounded-full')).map((node) =>
      node.textContent?.trim()
    );
    expect(badges[0]).toBe('✓');
    expect(badges[1]).toBe('2');
  }));

  it('should render the current year in the footer', () => {
    const element = fixture.nativeElement as HTMLElement;
    const footerText = element.querySelector('footer p')?.textContent ?? '';
    expect(footerText).toContain(new Date().getFullYear().toString());
  });
});
