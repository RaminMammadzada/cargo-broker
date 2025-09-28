import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateService } from '@ngx-translate/core';

import { LandingPageComponent } from './landing.page';
import { enTranslations } from '../../testing/en-translations.fixture';
import { provideTranslateTesting } from '../../testing/translate-testing.module';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent, RouterTestingModule, provideTranslateTesting()]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
  });

  it('should render the translated hero content', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain(enTranslations.landing.title);
    expect(element.querySelector('p.max-w-2xl')?.textContent).toContain(enTranslations.landing.description);
  });

  it('should render navigation actions for order and review steps', () => {
    const element = fixture.nativeElement as HTMLElement;
    const actions = Array.from(element.querySelectorAll('a')).map((anchor) => anchor.textContent?.trim());
    expect(actions).toEqual([
      enTranslations.landing.actions.start,
      enTranslations.landing.actions.review
    ]);
  });
});
