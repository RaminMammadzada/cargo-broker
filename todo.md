> Tip for Copilot: Use these TODOs as commit-sized tasks. Each item describes intent and boundaries so Copilot can generate scaffolds and tests.

## 0) Project Setup

- [x] `npm create @angular@latest` (standalone app) → app name `web` (scaffolded under apps/web)
- [x] Add **Tailwind CSS** (postcss config) and base styles
- [x] Install deps: `@ngx-translate/core @ngx-translate/http-loader uuid`
- [x] Keep Karma test runner for now (Jest migration tracked for later) and verified default spec
- [x] Add ESLint + Prettier configs (via angular-eslint schematic)

## 1) App Shell & Routing

- [x] Create `app.routes.ts` with routes: `/`, `/order`, `/delivery`, `/review`, `/payment`, `/status/:id` (placeholder components wired)
- [x] Implement `LayoutComponent` shell (header + navigation; language selector/stepper components forthcoming), `Footer`
- [x] Guard pipeline to ensure previous step validity

## 2) i18n

- [x] Integrate **ngx-translate** with `TranslateHttpLoader` from `/assets/i18n/*.json`
- [x] Create `az.json`, `en.json`, `ru.json` with core keys
- [x] `LanguageSelectorComponent` (persist to localStorage)
- [x] Fix runtime loader configuration so AZ/EN/RU dictionaries render instead of raw keys
- [x] Add content strategy for feature copy (order/delivery/payment flows)

## 3) Data Models & State

- [x] Add interfaces in `data-access/models` (see architecture.md)
- [x] Create `AppStateService` using **Signals** with slices: language, orderDraft, delivery, payment
- [x] LocalStorage persistence (load on app start, save debounced)
- [x] Computed total from item prices

## 4) Shared UI & Utilities

- [x] `UrlValidator`, `UniqueLinksValidator`
- [x] Reusable `FormField` components, `Button`, `Card`, `Stepper`, `ToastService`

## 5) Feature: Order Form

- [x] `OrderFormComponent` (Reactive Form)
- [x] Add/Remove up to 3 items; each with url/size/color/price/notes
- [x] Real-time validation messages; Next disabled until valid

## 6) Feature: Delivery

- [x] `DeliveryFormComponent` (recipientName, method, company, pickup/address, customerCode)
- [x] Load shipping data from `/assets/mocks/shipping.json`
- [x] Conditional required fields (pickup vs courier)

## 7) Feature: Review

- [x] `ReviewComponent` summarizes order + delivery + total
- [x] Edit buttons jump back to sections
- [x] Confirm → calls `OrderService.submit`

## 8) Mock Services & Data

- [x] `/assets/mocks/shipping.json` with companies + pickup points
- [x] `OrderService` → create `OrderSubmission` with mock id + `payment='initiated'` and store to localStorage inbox
- [x] `PaymentService` → `pay(orderId)` returns approved/failed after timeout
- [x] `StatusService` → read submissions by id

## 9) Feature: Payment

- [x] `PaymentComponent` displays total + mock-pay button
- [x] Spinner during processing; result routes to `/status/:id`

## 10) Feature: Status

- [x] `StatusComponent` shows state (“Order received”, “Payment confirmed/failed”)
- [x] Link to “View orders” (optional inbox page)

## 11) Accessibility & Polish

- [x] Keyboard focus traps on dialogs; skip-links
- [x] aria-labels, roles, input `for`/`id` bindings
- [x] Color contrast check; prefers-reduced-motion

## 12) Testing

- [x] Unit tests for validators and `AppStateService`
- [x] Component tests for OrderForm and DeliveryForm
- [x] Component tests for layout shell and placeholder pages
- [x] Component tests for shared UI elements (button, card, form-field, stepper, toast)
- [ ] (Optional) Playwright e2e happy path

## 13) CI & Deploy

- [x] GitHub Actions: build + test workflow on push/PR
- [x] Configure baseHref for GitHub Pages (or Vercel)
- [x] Deploy job with artifact upload + pages deploy

## 14) Nice-to-have (Backlog)

- [ ] NgRx integration when state grows
- [ ] Real payment provider integration (Stripe-like) in dev sandbox
- [ ] Auth (OIDC) and saved user profiles
- [ ] Server-side order processing + emails/webhooks
- [ ] Analytics (privacy-friendly) and feature flags

## 15) Mock Files (starter)

- [x] Create `/assets/mocks/shipping.json`:

  ```json
  {
    "companies": [
      { "id": "fastexpress", "name": "FastExpress" },
      { "id": "azerpost", "name": "AzerPost" }
    ],
    "pickupPoints": [
      { "id": "fx_01", "companyId": "fastexpress", "name": "Baku Downtown" },
      { "id": "ap_11", "companyId": "azerpost", "name": "Ganjlik Mall" }
    ]
  }
  ```

- [x] Seed i18n keys (example):

  ```json
  // assets/i18n/az.json
  {
    "app": { "title": "Sadə Sifariş MVP" },
    "nav": { "next": "Növbəti", "back": "Geri", "confirm": "Təsdiqlə" },
    "order": {
      "title": "Sifariş Linkləri",
      "add": "Link əlavə et",
      "url": "Məhsul linki",
      "size": "Ölçü",
      "color": "Rəng",
      "price": "Qiymət (AZN)"
    }
  }
  ```