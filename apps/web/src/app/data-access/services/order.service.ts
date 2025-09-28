import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';

import { DeliveryInfo, OrderDraft, OrderSubmission, PaymentStatus } from '../models/order.model';

const INBOX_STORAGE_KEY = 'cargo-broker.order-inbox';

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window?.localStorage;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private memoryStore: OrderSubmission[] = [];

  submit(draft: OrderDraft, delivery: DeliveryInfo, total: number): OrderSubmission {
    const submission: OrderSubmission = {
      id: uuidv4(),
      draft: {
        ...draft,
        items: draft.items.map((item) => ({ ...item }))
      },
      delivery: { ...delivery },
      total,
      payment: 'initiated',
      createdAt: new Date().toISOString()
    };

    const inbox = [submission, ...this.loadInbox()];
    this.persistInbox(inbox);

    return submission;
  }

  list(): OrderSubmission[] {
    return this.loadInbox();
  }

  getById(id: string): OrderSubmission | null {
    return this.loadInbox().find((entry) => entry.id === id) ?? null;
  }

  updatePaymentStatus(
    id: string,
    status: Exclude<PaymentStatus, 'idle'>
  ): OrderSubmission | null {
    const inbox = this.loadInbox();
    const index = inbox.findIndex((entry) => entry.id === id);

    if (index === -1) {
      return null;
    }

    const updated: OrderSubmission = {
      ...inbox[index],
      payment: status
    };

    inbox[index] = updated;
    this.persistInbox(inbox);

    return updated;
  }

  private loadInbox(): OrderSubmission[] {
    if (isBrowserEnvironment()) {
      try {
        const raw = window.localStorage.getItem(INBOX_STORAGE_KEY);
        if (!raw) {
          this.memoryStore = [];
          return [];
        }

        const parsed = JSON.parse(raw) as OrderSubmission[];
        this.memoryStore = parsed ?? [];
        return [...this.memoryStore];
      } catch (error) {
        console.warn('Failed to read order inbox from storage', error);
        this.memoryStore = [];
        return [];
      }
    }

    return [...this.memoryStore];
  }

  private persistInbox(inbox: OrderSubmission[]): void {
    this.memoryStore = [...inbox];

    if (isBrowserEnvironment()) {
      try {
        window.localStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(inbox));
      } catch (error) {
        console.warn('Failed to persist order inbox to storage', error);
      }
    }
  }
}
