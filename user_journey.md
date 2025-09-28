# user_journey.md

## 1) Personas (brief)

* **Guest Buyer (Primary)**: First-time user placing a simple order by pasting up to 3 product links. No account in MVP.
* **Returning Buyer (Secondary)**: Has used the app before; draft may auto-restore from localStorage.
* **Ops Viewer (Future)**: Internal staff viewing statuses, not in MVP scope.

## 2) Happy Path (MVP)

### Step 0 — Entry

* **Landing** `/` shows a minimal hero with Product value and a stepper. If a draft exists, show a restore prompt.
* **Goal**: Start flow with correct language and implicit country.

### Step 1 — Language Selection

* **Action**: User opens language dropdown (AZ/EN/RU) and chooses preferred language.
* **Result**: App updates instantly; preference saved to localStorage.
* **Edge copy**: Tooltip explaining languages are changeable anytime from the header.

### Step 2 — Country (Fixed for MVP)

* **Action**: Country appears as **Azerbaijan (AZ)**, disabled (info text: "More countries soon").
* **Result**: Proceed button enabled.

### Step 3 — Order Links `/order`

* **Action**: Add 1–3 product links via dynamic list. Each item supports: URL (required), Size, Color, Price (AZN), Notes.
* **Validation**:

  * At least 1 URL
  * Each URL valid and **unique** across items
  * Price if present ≥ 0
* **UX**: Inline errors, Add/Remove item controls, auto-focus next field.
* **Save**: Draft persists to localStorage (debounced).
* **Next**: Enabled when form valid.

### Step 4 — Delivery Info `/delivery`

* **Action**: Choose **method**: courier or pickup.

  * If **pickup**: select **company** → then **pickup point**.
  * If **courier**: select **company** → enter **address**.
* **Common fields**: Recipient Name (Ad–Soyad), Customer Code (for chosen company).
* **Validation**:

  * Recipient Name: non-empty
  * Customer Code: non-empty
  * Pickup method requires pickup point; Courier requires address line.
* **Data**: Companies & pickup points loaded from `/assets/mocks/shipping.json`.
* **Next**: Enabled when valid.

### Step 5 — Review & Confirm `/review`

* **Displays**: All items with size/color/price; delivery details; **computed total** from prices provided.
* **Actions**: Edit buttons jump back to previous steps without losing data.
* **Confirm**: Calls `OrderService.submit(draft, delivery)` (mock). Navigates to `/payment` with returned `orderId`.

### Step 6 — Mock Payment `/payment`

* **Displays**: Order summary + total; mock pay button.
* **Action**: Click **Pay** → `PaymentService.pay(orderId)` simulates 500–1500ms delay and returns **approved** or **failed**.
* **Result**: Route to `/status/:id` with outcome.

### Step 7 — Status `/status/:id`

* **If approved**: Show success state: "Order received" + "Payment confirmed". CTA: "Place another order".
* **If failed**: Show failure state with retry option and link back to payment or support info (static).
* **Persistence**: Status saved to localStorage "inbox" for future (optional Orders page).

---

## 3) Alternative & Edge Flows

### A) Duplicate or Invalid Links

* **Trigger**: User enters same URL twice or an invalid URL.
* **Handling**: Field-level error; Next disabled; screen reader announces error; link field highlighted.

### B) Exceed Link Limit

* **Trigger**: User attempts to add a 4th item.
* **Handling**: Disable add-button with hint: "Max 3 items in MVP".

### C) Missing Required Delivery Fields

* **Trigger**: Incorrect method/details combination.
* **Handling**: Contextual errors under fields; scrolling to first error on submit.

### D) Payment Failure (Mock)

* **Trigger**: Random or toggled failure.
* **Handling**: Status page shows failure; CTA: "Try payment again" → back to `/payment`.

### E) Abandon / Refresh

* **Trigger**: Page close/refresh mid-flow.
* **Handling**: On next visit, detect draft in localStorage and prompt: **Restore draft?** [Restore] [Discard].

### F) Language Toggle Mid-Flow

* **Trigger**: User changes language in header during any step.
* **Handling**: Instant translation; form state preserved.

### G) Accessibility / Reduced Motion

* **Trigger**: User has `prefers-reduced-motion` or uses keyboard-only.
* **Handling**: Reduced animations; focus outlines preserved; skip-links available.

---

## 4) UI Copy (key strings)

* **Order**: "Paste product link", "Add another link", "Remove", "Size", "Color", "Price (AZN)", "Notes"
* **Delivery**: "Recipient full name", "Delivery method", "Courier", "Pickup", "Company", "Pickup point", "Address", "Customer code"
* **Review**: "Review your order", "Edit links", "Edit delivery", "Confirm"
* **Payment**: "Total", "Pay", "Processing..."
* **Status** (success): "Order received", "Payment confirmed"
* **Status** (failed): "Payment failed", "Try again"

(i18n: mirror these keys in `az/en/ru` files under `order.*`, `delivery.*`, `review.*`, `payment.*`, `status.*`.)

---

## 5) Step-by-step Acceptance Criteria

### `/order`

* Given no items, **Next** is disabled.
* Given 1–3 valid unique URLs, **Next** is enabled.
* When user enters an invalid URL, show validation error immediately.

### `/delivery`

* Given method = pickup, cannot proceed without a pickup point.
* Given method = courier, cannot proceed without address line.
* Customer code and recipient name are mandatory in both cases.

### `/review`

* Displays exactly the items from draft and calculated total (sum of non-empty numeric prices).
* Confirm triggers mock submit and navigates to `/payment`.

### `/payment`

* Pay triggers async operation; button disabled while pending; shows spinner.
* Success navigates to `/status/:id` (approved); failure navigates to `/status/:id` (failed).

### `/status/:id`

* Success state shows success visuals and "Place another order" CTA.
* Failure state provides a retry path to payment.

---

## 6) Visual Flow (ASCII)

```
[Landing]
   |
   v
[Language ▾] --(change anytime)--> [Language ▾]
   |
   v
[Country: AZ (fixed)]
   |
   v
[Order Links] --(>=1 & <=3 valid URLs)--> [Delivery]
   |                                        ^
   |-- invalid/duplicate URL ---------------|
   v
[Review] -- Confirm --> [Payment] -- Pay --> [Status]
                                        \-- fail --> [Status (failed)] -- Retry --> [Payment]
```

---

## 7) Non-Functional Notes

* **Performance**: Small bundle; lazy-load feature routes if needed.
* **Resilience**: All network-like calls are local mocks; still show loading states to prepare for real backends.
* **Telemetry (future-ready)**: Event hooks at key journey points.

### Suggested Analytics Events (namespaced)

* `ux.language_changed` {from, to}
* `order.item_added` {index}
* `order.item_removed` {index}
* `order.validated` {count}
* `delivery.method_selected` {method}
* `delivery.company_selected` {companyId}
* `review.confirm_clicked`
* `payment.initiated` {orderId}
* `payment.result` {orderId, status}
* `status.viewed` {orderId, status}

---

## 8) Future Journey (Post-MVP)

* **Account & Auth**: Sign-in/up → saved addresses, history.
* **Real Payment**: Redirect to provider; return via webhook-confirmed status.
* **Order Tracking**: Live logistics updates; notifications (email/SMS/WhatsApp).
* **Multi-country**: Country unlocked; dynamic courier offerings per country.
* **Ops Portal**: Internal dashboard; manual review; SLA timers.

---

## 9) Risks & Mitigations

* **Users paste unsupported URLs** → Clear error and guidance; future: allow attachments or parsing fallback.
* **Ambiguous delivery details** → Contextual examples (placeholder text) and validation hints.
* **Payment confusion (mock)** → Copy clarifies that this is a demo; future swaps to real provider flow.

---

## 10) Definition of Done (MVP)

* All steps navigable with keyboard; form fields labeled and read by screen readers.
* Draft persists across refresh; restore prompt works.
* All acceptance criteria above green in unit/component tests.
* Deployed static build accessible at public URL.
