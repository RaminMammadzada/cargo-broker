> Tip for Copilot: Use these TODOs as commit-sized tasks. Each item describes intent and boundaries so Copilot can generate scaffolds and tests.

## 0) Project Setup

- [ ] `npm create @angular@latest` (standalone app) → app name `web`
- [ ] Add **Tailwind CSS** (postcss config) and base styles
- [ ] Install deps: `@ngx-translate/core @ngx-translate/http-loader uuid`
- [ ] Setup Jest (or keep Karma) and basic test script
- [ ] Add ESLint + Prettier configs

## 1) App Shell & Routing

- [ ] Create `app.routes.ts` with routes: `/`, `/order`, `/delivery`, `/review`, `/payment`, `/status/:id`
- [ ] Implement `LayoutComponent` (header with LanguageSelector, stepper), `Footer`
- [ ] Guard pipeline to ensure previous step validity

## 2) i18n

- [ ] Integrate **ngx-translate** with `TranslateHttpLoader` from `/assets/i18n/*.json`
- [ ] Create `az.json`, `en.json`, `ru.json` with core keys
- [ ] `LanguageSelectorComponent` (persist to localStorage)

## 3) Data Models & State

- [ ] Add interfaces in `data-access/models` (see architecture.md)
- [ ] Create `AppStateService` using **Signals** with slices: language, orderDraft, delivery, payment
- [ ] LocalStorage persistence (load on app start, save debounced)
- [ ] Computed total from item prices

## 4) Shared UI & Utilities

- [ ] `UrlValidator`, `UniqueLinksValidator`
- [ ] Reusable `FormField` components, `Button`, `Card`, `Stepper`, `ToastService`

## 5) Feature: Order Form

- [ ] `OrderFormComponent` (Reactive Form)
- [ ] Add/Remove up to 3 items; each with url/size/color/price/notes
- [ ] Real-time validation messages; Next disabled until valid

## 6) Feature: Delivery

- [ ] `DeliveryFormComponent` (recipientName, method, company, pickup/address, customerCode)
- [ ] Load shipping data from `/assets/mocks/shipping.json`
- [ ] Conditional required fields (pickup vs courier)

## 7) Feature: Review

- [ ] `ReviewComponent` summarizes order + delivery + total
- [ ] Edit buttons jump back to sections
- [ ] Confirm → calls `OrderService.submit`

## 8) Mock Services & Data

- [ ] `/assets/mocks/shipping.json` with companies + pickup points
- [ ] `OrderService` → create `OrderSubmission` with mock id + `payment='initiated'` and store to localStorage inbox
- [ ] `PaymentService` → `pay(orderId)` returns approved/failed after timeout
- [ ] `StatusService` → read submissions by id

## 9) Feature: Payment

- [ ] `PaymentComponent` displays total + mock-pay button
- [ ] Spinner during processing; result routes to `/status/:id`

## 10) Feature: Status

- [ ] `StatusComponent` shows state (“Order received”, “Payment confirmed/failed”)
- [ ] Link to “View orders” (optional inbox page)

## 11) Accessibility & Polish

- [ ] Keyboard focus traps on dialogs; skip-links
- [ ] aria-labels, roles, input `for`/`id` bindings
- [ ] Color contrast check; prefers-reduced-motion

## 12) Testing

- [ ] Unit tests for validators and `AppStateService`
- [ ] Component tests for OrderForm and DeliveryForm
- [ ] (Optional) Playwright e2e happy path

## 13) CI & Deploy

- [ ] GitHub Actions: build + test workflow on push/PR
- [ ] Configure baseHref for GitHub Pages (or Vercel)
- [ ] Deploy job with artifact upload + pages deploy

## 14) Nice-to-have (Backlog)

- [ ] NgRx integration when state grows
- [ ] Real payment provider integration (Stripe-like) in dev sandbox
- [ ] Auth (OIDC) and saved user profiles
- [ ] Server-side order processing + emails/webhooks
- [ ] Analytics (privacy-friendly) and feature flags

## 15) Mock Files (starter)

- [ ] Create `/assets/mocks/shipping.json`:

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

- [ ] Seed i18n keys (example):

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