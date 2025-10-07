import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import { TelegramSettingsService } from './telegram-settings.service';
import { APP_CONFIG, AppConfig } from '../config/app-config';

describe('TelegramSettingsService', () => {
  let service: TelegramSettingsService;
  let httpMock: HttpTestingController;
  const config: AppConfig = { apiBaseUrl: '/api' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: APP_CONFIG, useValue: config }]
    });

    service = TestBed.inject(TelegramSettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should load the configured telegram settings', () => {
    service.getSettings().subscribe();

    const request = httpMock.expectOne('/api/settings/telegram');
    expect(request.request.method).toBe('GET');
    request.flush({ chatId: '12345' });
  });

  it('should update the telegram chat id', () => {
    service.updateSettings('6789').subscribe();

    const request = httpMock.expectOne('/api/settings/telegram');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ chatId: '6789' });
    request.flush({ chatId: '6789' });
  });
});
