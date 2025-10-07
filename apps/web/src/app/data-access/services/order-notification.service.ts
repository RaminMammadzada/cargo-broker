import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { APP_CONFIG } from '../config/app-config';
import { OrderSubmission } from '../models/order.model';

interface OrderNotificationPayload {
  submission: OrderSubmission;
}

@Injectable({ providedIn: 'root' })
export class OrderNotificationService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(APP_CONFIG);
  private readonly endpoint = `${this.config.apiBaseUrl}/notifications/order`;

  notifyOrder(submission: OrderSubmission) {
    const payload: OrderNotificationPayload = { submission };
    return this.http.post<void>(this.endpoint, payload);
  }
}
