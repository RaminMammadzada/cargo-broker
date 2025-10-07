import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APP_CONFIG } from '../config/app-config';
import { TelegramSettings } from '../models/telegram.model';

@Injectable({ providedIn: 'root' })
export class TelegramSettingsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly endpoint = `${this.config.apiBaseUrl}/settings/telegram`;

  getSettings() {
    return this.http.get<TelegramSettings>(this.endpoint);
  }

  updateSettings(chatId: string) {
    return this.http.put<TelegramSettings>(this.endpoint, { chatId });
  }
}
