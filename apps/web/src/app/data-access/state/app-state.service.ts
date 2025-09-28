import { Injectable, Signal, computed, effect, signal } from '@angular/core';

import {
  CountryCode,
  DeliveryInfo,
  Language,
  OrderDraft,
  PaymentStatus,
  ProductLink
} from '../models/order.model';

const STORAGE_KEY = 'cargo-broker.app-state';
const STORAGE_DEBOUNCE_MS = 250;
const DEFAULT_COUNTRY: CountryCode = 'AZ';
const DEFAULT_LANGUAGE: Language = 'az';

interface PersistedState {
  language: Language;
  orderDraft: OrderDraft;
  delivery: DeliveryInfo | null;
}

function createDefaultOrderDraft(language: Language = DEFAULT_LANGUAGE): OrderDraft {
  return {
    language,
    country: DEFAULT_COUNTRY,
    items: []
  };
}

function isBrowserEnvironment(): boolean {
  return typeof window !== 'undefined' && !!window?.localStorage;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly persisted = this.loadPersistedState();

  private readonly _language = signal<Language>(this.persisted?.language ?? DEFAULT_LANGUAGE);
  private readonly _orderDraft = signal<OrderDraft>(
    this.persisted?.orderDraft ?? createDefaultOrderDraft(this.persisted?.language)
  );
  private readonly _delivery = signal<DeliveryInfo | null>(this.persisted?.delivery ?? null);
  private readonly _paymentStatus = signal<PaymentStatus>('idle');

  readonly language: Signal<Language> = this._language.asReadonly();
  readonly orderDraft: Signal<OrderDraft> = this._orderDraft.asReadonly();
  readonly delivery: Signal<DeliveryInfo | null> = this._delivery.asReadonly();
  readonly paymentStatus: Signal<PaymentStatus> = this._paymentStatus.asReadonly();

  readonly hasOrderDraft = computed(() => {
    const items = this._orderDraft().items;
    if (!items.length) {
      return false;
    }

    const normalised = new Set<string>();

    return items.every((item) => {
      const url = item.url?.trim();
      if (!url) {
        return false;
      }

      let candidate = url;
      try {
        candidate = new URL(url).toString();
      } catch {
        return false;
      }

      if (normalised.has(candidate)) {
        return false;
      }

      normalised.add(candidate);
      return true;
    });
  });
  readonly hasDelivery = computed(() => !!this._delivery());
  readonly total = computed(() =>
    this._orderDraft()
      .items.map((item) => item.price ?? 0)
      .reduce((sum, price) => sum + price, 0)
  );

  constructor() {
    if (isBrowserEnvironment()) {
      let timeout: ReturnType<typeof setTimeout> | undefined;
      effect(() => {
        const snapshot: PersistedState = {
          language: this._language(),
          orderDraft: this._orderDraft(),
          delivery: this._delivery()
        };

        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(() => {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        }, STORAGE_DEBOUNCE_MS);
      });
    }
  }

  setLanguage(language: Language): void {
    this._language.set(language);
    this._orderDraft.update((draft) => ({
      ...draft,
      language
    }));
  }

  patchOrderDraft(partial: Partial<OrderDraft>): void {
    this._orderDraft.update((draft) => ({
      ...draft,
      ...partial,
      items: partial.items ?? draft.items,
      country: partial.country ?? DEFAULT_COUNTRY,
      language: partial.language ?? this._language()
    }));
  }

  setOrderItems(items: ProductLink[]): void {
    this._orderDraft.update((draft) => ({
      ...draft,
      items: [...items]
    }));
  }

  resetOrderDraft(): void {
    const language = this._language();
    this._orderDraft.set(createDefaultOrderDraft(language));
  }

  setDelivery(delivery: DeliveryInfo | null): void {
    this._delivery.set(delivery);
  }

  resetDelivery(): void {
    this._delivery.set(null);
  }

  setPaymentStatus(status: PaymentStatus): void {
    this._paymentStatus.set(status);
  }

  resetPaymentStatus(): void {
    this._paymentStatus.set('idle');
  }

  clearAll(): void {
    this.resetOrderDraft();
    this.resetDelivery();
    this.resetPaymentStatus();
    if (isBrowserEnvironment()) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  private loadPersistedState(): PersistedState | null {
    if (!isBrowserEnvironment()) {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as PersistedState;
      return {
        language: parsed.language ?? DEFAULT_LANGUAGE,
        orderDraft: {
          ...createDefaultOrderDraft(parsed.language ?? DEFAULT_LANGUAGE),
          ...parsed.orderDraft,
          items: parsed.orderDraft?.items ?? []
        },
        delivery: parsed.delivery ?? null
      };
    } catch (error) {
      console.warn('Failed to load persisted app state', error);
      return null;
    }
  }
}
