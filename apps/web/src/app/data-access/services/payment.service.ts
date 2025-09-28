import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timer } from 'rxjs';

import { OrderSubmission, PaymentStatus } from '../models/order.model';
import { OrderService } from './order.service';

type PaymentOutcome = Extract<PaymentStatus, 'approved' | 'failed'>;

export interface PayOptions {
  outcome?: PaymentOutcome;
  delayMs?: number;
}

const MIN_DELAY_MS = 600;
const MAX_DELAY_MS = 1500;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly orderService = inject(OrderService);

  async pay(orderId: string, options: PayOptions = {}): Promise<OrderSubmission | null> {
    const existing = this.orderService.getById(orderId);
    if (!existing) {
      return null;
    }

    const outcome = options.outcome ?? this.randomOutcome();
    const delay = options.delayMs ?? this.randomDelay();

    await firstValueFrom(timer(delay));

    return this.orderService.updatePaymentStatus(orderId, outcome);
  }

  private randomOutcome(): PaymentOutcome {
    return Math.random() < 0.75 ? 'approved' : 'failed';
  }

  private randomDelay(): number {
    const range = MAX_DELAY_MS - MIN_DELAY_MS;
    return Math.floor(Math.random() * range) + MIN_DELAY_MS;
  }
}
