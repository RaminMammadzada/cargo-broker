## 1) Overview

A lightweight MVP for a **link-based shopping assistant** that lets users:

* Choose **language** (AZ / EN / RU)
* (For now) Country fixed to **Azerbaijan**
* Submit **1–3 product links** with per-link details (size, color, price, notes)
* Provide **delivery info** (pickup point / address), **courier company**, and **customer code**
* Review, confirm, and proceed to a **mock payment** step (no real payments)
* See status messages ("order received", "payment confirmed") — **mocked**

MVP is **frontend-only (Angular)** with **mock data** and **local persistence** (localStorage). No backend yet.

## 2) Goals

* **Now (MVP)**: ship a usable, testable Angular SPA with clean architecture, strong typing, i18n, validation, and mocked data/services.
* **Later (Full System)**: pluggable service layer pointing to real APIs (orders, payments, logistics), production-grade auth, observability, and CI/CD.

## 3) Scope (MVP)

* Angular SPA
* Feature-sliced architecture
* Routing with guards
* Global app state via lightweight service or Angular Signals (optionally NgRx later)
* i18n for **AZ/EN/RU**
* Forms with strong validation (Reactive Forms)
* Mock services for: Orders, Payments, Shipping Companies, Pickup Points
* LocalStorage for draft persistence and a tiny *"mock inbox"* of submitted orders
* Basic unit tests + a11y checks
* Deployable as static site (GitHub Pages / Vercel)

## 4) Tech Stack

* **Angular** (standalone APIs, Signals)
* **TypeScript**, **RxJS** (minimal), **Angular Router**
* **Angular i18n** or **@ngx-translate** (choose one; MVP uses ngx-translate for speed)
* **Tailwind CSS** for styling
* **Jest** (or Karma) for unit tests; **Playwright** for e2e (optional)

## 5) High-Level Architecture

```
apps/
  web/ (Angular app)
    src/
      app/
        core/               # singletons: interceptors (future), error handling, config
        shared/             # UI atoms/molecules, pipes, validators
        features/
          language/         # language selector
          country/          # country selector (fixed AZ but modular)
          order/            # multi-link order form + review
          delivery/         # courier/pickup selection, customer code
          payment/          # mock payment screen
          status/           # status/result screens
        data-access/
          models/           # TypeScript interfaces & enums
          services/         # Mock services (Orders, Payments, Shipping)
          state/            # AppState service (Signals) + localStorage persistence
        pages/              # route shells composing features
        app.routes.ts
        app.config.ts
      assets/
        i18n/               # az.json, en.json, ru.json
        mocks/              # mock JSON for companies, pickup points
      styles.css            # Tailwind entry
```

### Component & Feature Boundaries

* **language**: dropdown + persistence; emits language changes to translation service.
* **order**: dynamic form (1–3 items); per-item subform; live validation.
* **delivery**: choose courier company, pickup point/address, customer code.
* **payment**: displays total (from user-provided prices), mock-pay (simulated delay + success/fail toggles).
* **status**: shows “Order received”, “Payment confirmed”, etc. based on mock service state.

### State Management

* **AppStateService (Signals)**

  * `language`, `country`, `orderDraft`, `delivery`, `paymentStatus` signals
  * Persists `orderDraft` & `delivery` to localStorage (debounced)
  * Exposes computed totals
* Migration path to **NgRx** later if complexity grows.

## 6) Data Model (MVP)

```ts
// models/order.ts
export type Language = 'az' | 'en' | 'ru';
export type CountryCode = 'AZ';

export interface ProductLink {
  url: string;             // validated URL
  size?: string;
  color?: string;
  price?: number;          // user-entered price in AZN
  notes?: string;
}

export interface OrderDraft {
  language: Language;
  country: CountryCode;    // fixed 'AZ' for now
  items: ProductLink[];    // 1..3
}

export interface DeliveryInfo {
  recipientName: string;   // Ad–Soyad
  method: 'courier' | 'pickup';
  companyId: string;       // selected courier company
  pickupPointId?: string;  // if method === 'pickup'
  addressLine?: string;    // if courier
  customerCode: string;    // code inside selected company
}

export type PaymentStatus = 'idle' | 'initiated' | 'approved' | 'failed';

export interface OrderSubmission {
  id: string;              // mock UUID
  draft: OrderDraft;
  delivery: DeliveryInfo;
  createdAt: string;       // ISO
  total: number;           // sum of item.price
  payment: PaymentStatus;
}
```

## 7) Routing Map

```
/                    -> Home (Language + Country)
/order               -> OrderForm (1–3 links)
/delivery            -> DeliveryForm (courier/pickup + code)
/review              -> Review & Confirm
/payment             -> MockPayment
/status/:id          -> Status (Order Received / Payment ...)
```

* Guards: redirect forward only when required slices of state are valid; backward navigation allowed.

## 8) Validation Rules (key)

* 1–3 links required; each `url` must be valid and unique
* `price` ≥ 0, numeric; optional but used for total if provided
* If `method='pickup'` → `pickupPointId` required; if `courier` → `addressLine` required
* `recipientName` non-empty; `customerCode` non-empty

## 9) i18n Strategy

* **ngx-translate** with three resource files `az.json`, `en.json`, `ru.json`
* Keys organized by feature (`order.*`, `delivery.*`, `errors.*`, `status.*`)
* Persist language in localStorage; default from browser

## 10) Mock Services

* **ShippingService**: returns list of companies and pickup points from `/assets/mocks/shipping.json`
* **OrderService**: simulates `submitOrder(draft, delivery)` → returns mock `OrderSubmission` with `payment='initiated'`
* **PaymentService**: `pay(orderId)` → delays 500–1500ms → toggles `approved|failed` (deterministic flag or button)
* **StatusService**: reads from localStorage "inbox"

## 11) Error & UX

* Inline form errors; disable Next when invalid
* Toasts/snackbars for submit/payment results
* Loading spinners during mock delays
* Confirmation modals before leaving with dirty forms

## 12) Accessibility & UI

* Focus management between steps
* Keyboard navigable, form labels + aria-* attributes
* Color-contrast compliant; RTL-friendly if needed later

## 13) Testing

* Unit tests for validators, services, AppState
* Component tests for OrderForm and DeliveryForm (critical paths)
* Optional Playwright happy-path e2e (language → order → payment)

## 14) Build & Deployment

* GitHub Actions: build + test on PR
* Static deploy: GitHub Pages (angular.json baseHref) or Vercel/Netlify

## 15) Future Architecture (Post-MVP)

* **Backend Services** (NestJS or similar):

  * `orders` (create, update status, list)
  * `payments` (initiate, webhook confirm, refunds)
  * `logistics` (courier integrations, pickup points)
  * **Auth** (OIDC) + user accounts
* **DB**: PostgreSQL (orders, items, deliveries, users)
* **Queues**: RabbitMQ / SQS for async order processing
* **Webhooks**: payment provider → update status
* **Observability**: OpenTelemetry, structured logs, tracing
* **Security**: input sanitization, rate limits, CSRF, CSP, secrets management
* **Scalability**: API Gateways, CDN for static assets

### Draft REST API (future)

```
POST /api/orders
GET  /api/orders/{id}
POST /api/orders/{id}/pay
GET  /api/shipping/companies
GET  /api/shipping/companies/{id}/pickup-points
```