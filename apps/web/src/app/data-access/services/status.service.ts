import { Injectable, inject } from '@angular/core';

import { OrderSubmission } from '../models/order.model';
import { OrderService } from './order.service';

@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly orderService = inject(OrderService);

  get(orderId: string): OrderSubmission | null {
    return this.orderService.getById(orderId);
  }
}
