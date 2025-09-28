import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { RouterTestingModule } from '@angular/router/testing';

import azTranslations from '../../public/assets/i18n/az.json';

import { App } from './app';
import { provideTranslateTesting } from './testing/translate-testing.module';

describe('App', () => {
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HttpClientTestingModule, RouterTestingModule, provideTranslateTesting()]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('az', azTranslations, true);
    translate.use('az');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('header a')?.textContent).toContain('Cargo Broker MVP');
  });
});
