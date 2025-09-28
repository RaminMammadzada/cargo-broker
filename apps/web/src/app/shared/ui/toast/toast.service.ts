import { Injectable, Signal, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  id?: string;
  title?: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface Toast extends ToastOptions {
  id: string;
  variant: ToastVariant;
}

const DEFAULT_DURATION = 5000;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastsSignal = signal<Toast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  get toasts(): Signal<Toast[]> {
    return this.toastsSignal.asReadonly();
  }

  show(options: ToastOptions): string {
    const id = options.id ?? crypto.randomUUID();
    const toast: Toast = {
      id,
      title: options.title,
      message: options.message,
      variant: options.variant ?? 'info',
      duration: options.duration ?? DEFAULT_DURATION
    };

    this.toastsSignal.update((current) => [...current, toast]);

    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => this.dismiss(id), toast.duration);
      this.timers.set(id, timer);
    }

    return id;
  }

  dismiss(id: string): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this.toastsSignal.update((current) => current.filter((toast) => toast.id !== id));
  }

  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.toastsSignal.set([]);
  }
}
