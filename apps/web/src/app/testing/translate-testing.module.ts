import { ModuleWithProviders } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

class TranslateTestingLoader implements TranslateLoader {
  getTranslation() {
    return of({});
  }
}

export function provideTranslateTesting(): ModuleWithProviders<TranslateModule> {
  return TranslateModule.forRoot({
    loader: {
      provide: TranslateLoader,
      useClass: TranslateTestingLoader
    }
  });
}
