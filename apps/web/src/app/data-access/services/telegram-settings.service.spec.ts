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
    request.flush({
      phoneNumber: '994551234567',
      chatId: '12345',
      lastSyncedAt: '2024-01-01T00:00:00.000Z',
      botTokenConfigured: true
    });
  });

  it('should update the telegram phone number', () => {
    service.updateSettings('+994 (55) 678 90 00').subscribe();

    const request = httpMock.expectOne('/api/settings/telegram');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ phoneNumber: '+994 (55) 678 90 00' });
    request.flush({
      phoneNumber: '994556789000',
      chatId: '6789',
      lastSyncedAt: '2024-01-01T00:00:00.000Z',
      botTokenConfigured: true
    });
  });
});
