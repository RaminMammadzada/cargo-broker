import { Component, effect, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { AppStateService } from './data-access/state/app-state.service';

import { LayoutComponent } from './layout/layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  template: `<app-layout />`
})
export class App {
  private readonly translate = inject(TranslateService);
  private readonly appState = inject(AppStateService);

  constructor() {
    this.translate.addLangs(['az', 'en', 'ru']);
    this.translate.setDefaultLang('az');

    effect(() => {
      const language = this.appState.language();
      this.translate.use(language);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = language;
      }
    });
  }
}
