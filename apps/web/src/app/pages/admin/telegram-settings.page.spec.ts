import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { TelegramSettingsPageComponent } from './telegram-settings.page';
import { TelegramSettingsService } from '../../data-access/services/telegram-settings.service';
import { provideTranslateTesting } from '../../testing/translate-testing.module';
import { enTranslations } from '../../testing/en-translations.fixture';
import { ToastService } from '../../shared/ui/toast/toast.service';

describe('TelegramSettingsPageComponent', () => {
  let fixture: ComponentFixture<TelegramSettingsPageComponent>;
  let element: HTMLElement;
  let translate: TranslateService;
  let updateSubject: Subject<unknown>;
  let toastShowSpy: jasmine.Spy;

  beforeEach(async () => {
    updateSubject = new Subject();
    toastShowSpy = jasmine.createSpy('show');

    await TestBed.configureTestingModule({
      imports: [TelegramSettingsPageComponent, provideTranslateTesting()],
      providers: [
        {
          provide: TelegramSettingsService,
          useValue: {
            getSettings: () => of({ chatId: '12345' }),
            updateSettings: () => updateSubject.asObservable()
          }
        },
        { provide: ToastService, useValue: { show: toastShowSpy } }
      ]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');

    fixture = TestBed.createComponent(TelegramSettingsPageComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads the current chat id into the form', () => {
    const input = element.querySelector('input[formcontrolname="chatId"]') as HTMLInputElement;
    expect(input.value).toBe('12345');
  });

  it('validates the chat id field and shows an error message when empty', async () => {
    const input = element.querySelector('input[formcontrolname="chatId"]') as HTMLInputElement;
    input.value = '';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new Event('blur'));
    fixture.detectChanges();

    await fixture.whenStable();

    const error = element.querySelector('.text-red-600');
    expect(error?.textContent).toContain(
      enTranslations.admin.telegram.form.errors.required
    );
  });

  it('submits the chat id and shows a success toast', async () => {
    const form = element.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    updateSubject.next({});
    updateSubject.complete();
    await fixture.whenStable();

    expect(toastShowSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ variant: 'success' })
    );
  });

  it('surfaces an error toast when saving fails', async () => {
    const service = TestBed.inject(TelegramSettingsService);
    spyOn(service, 'updateSettings').and.returnValue(throwError(() => new Error('network')));

    const form = element.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(toastShowSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ variant: 'error' })
    );
  });
});
