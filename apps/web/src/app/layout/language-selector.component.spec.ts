import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Language } from '../data-access/models/order.model';
import { AppStateService } from '../data-access/state/app-state.service';

import { LanguageSelectorComponent } from './language-selector.component';
import { enTranslations } from '../testing/en-translations.fixture';
import { provideTranslateTesting } from '../testing/translate-testing.module';

describe('LanguageSelectorComponent', () => {
  let fixture: ComponentFixture<LanguageSelectorComponent>;
  let translate: TranslateService;
  let mockAppState: {
    language: WritableSignal<Language>;
    setLanguage: jasmine.Spy<(language: Language) => void>;
  };

  beforeEach(async () => {
    mockAppState = {
      language: signal<Language>('en'),
      setLanguage: jasmine.createSpy('setLanguage')
    };

    await TestBed.configureTestingModule({
      imports: [LanguageSelectorComponent, provideTranslateTesting()],
      providers: [{ provide: AppStateService, useValue: mockAppState }]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(LanguageSelectorComponent);
    fixture.detectChanges();
  });

  it('should render the available language options', () => {
    const element = fixture.nativeElement as HTMLElement;
    const select = element.querySelector('select');
    const optionLabels = Array.from(select?.querySelectorAll('option') ?? []).map((option) => option.textContent?.trim());
    expect(optionLabels).toEqual([
      enTranslations.language.az,
      enTranslations.language.en,
      enTranslations.language.ru
    ]);
  });

  it('should update the language when a new option is selected', () => {
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'az';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(mockAppState.setLanguage).toHaveBeenCalledWith('az');
  });

  it('should not emit a language change if the same option is selected', () => {
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(mockAppState.setLanguage).not.toHaveBeenCalled();
  });
});
