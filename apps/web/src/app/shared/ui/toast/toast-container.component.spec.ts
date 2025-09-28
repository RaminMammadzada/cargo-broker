import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslateService } from '@ngx-translate/core';

import { provideTranslateTesting } from '../../../testing/translate-testing.module';
import { enTranslations } from '../../../testing/en-translations.fixture';

import { ToastContainerComponent } from './toast-container.component';
import { ToastService } from './toast.service';

describe('ToastContainerComponent', () => {
  let fixture: ComponentFixture<ToastContainerComponent>;
  let service: ToastService;
  let translate: TranslateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent, provideTranslateTesting()]
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations, true);
    translate.use('en');
    service = TestBed.inject(ToastService);
    service.clear();
    fixture = TestBed.createComponent(ToastContainerComponent);
  });

  it('renders an empty state announcement when no toasts are queued', () => {
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('p.sr-only');
    expect(message).toBeTruthy();
  });

  it('renders toasts from the service and applies variant classes', () => {
    service.show({ id: 'one', message: 'Saved', title: 'Success', variant: 'success', duration: 0 });
    service.show({ id: 'two', message: 'Problem', variant: 'error', duration: 0 });

    fixture.detectChanges();

    const articles = fixture.nativeElement.querySelectorAll('article');
    expect(articles.length).toBe(2);
    expect(articles[0].className).toContain('bg-emerald-50');
    expect(articles[1].className).toContain('bg-red-50');
    const closeButton: HTMLButtonElement = articles[0].querySelector('button');
    expect(closeButton.getAttribute('aria-label')).toBe('Close notification');
  });

  it('dismisses a toast when the close button is clicked', () => {
    service.show({ id: 'close', message: 'Closable', duration: 0 });
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();
    fixture.detectChanges();

    expect(service.toasts().length).toBe(0);
    const articles = fixture.nativeElement.querySelectorAll('article');
    expect(articles.length).toBe(0);
  });
});
