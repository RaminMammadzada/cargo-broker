import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { AppStateService } from '../data-access/state/app-state.service';
import { Language } from '../data-access/models/order.model';

interface LanguageOption {
  code: Language;
  labelKey: string;
}

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <label class="flex items-center gap-2 text-sm font-medium text-slate-700" for="language-select">
      <span>{{ 'language.label' | translate }}</span>
      <select
        id="language-select"
        class="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
        [value]="language()"
        (change)="onChange($event)"
      >
        <option *ngFor="let option of options" [value]="option.code">
          {{ option.labelKey | translate }}
        </option>
      </select>
    </label>
  `
})
export class LanguageSelectorComponent {
  private readonly appState = inject(AppStateService);

  readonly language = this.appState.language;

  readonly options: LanguageOption[] = [
    { code: 'az', labelKey: 'language.az' },
    { code: 'en', labelKey: 'language.en' },
    { code: 'ru', labelKey: 'language.ru' }
  ];

  onChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const language = select.value as Language;
    if (language && language !== this.language()) {
      this.appState.setLanguage(language);
    }
  }
}
