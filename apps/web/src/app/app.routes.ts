import { Routes } from '@angular/router';

import { stepGuard } from './data-access/guards/step.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing.page').then((m) => m.LandingPageComponent)
  },
  {
    path: 'order',
    loadComponent: () => import('./pages/order/order.page').then((m) => m.OrderPageComponent)
  },
  {
    path: 'delivery',
    canActivate: [stepGuard],
    data: { requires: 'order' },
    loadComponent: () => import('./pages/delivery/delivery.page').then((m) => m.DeliveryPageComponent)
  },
  {
    path: 'review',
    canActivate: [stepGuard],
    data: { requires: ['order', 'delivery'] },
    loadComponent: () => import('./pages/review/review.page').then((m) => m.ReviewPageComponent)
  },
  {
    path: 'payment',
    canActivate: [stepGuard],
    data: { requires: ['order', 'delivery'] },
    loadComponent: () => import('./pages/payment/payment.page').then((m) => m.PaymentPageComponent)
  },
  {
    path: 'status/:id',
    loadComponent: () => import('./pages/status/status.page').then((m) => m.StatusPageComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPageComponent)
  },
  {
    path: 'admin/telegram',
    loadComponent: () =>
      import('./pages/admin/telegram-settings.page').then((m) => m.TelegramSettingsPageComponent)
  },
  { path: '**', redirectTo: '' }
];
