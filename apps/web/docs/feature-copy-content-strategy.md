# Feature Copy Content Strategy

This document defines how we plan, write, and translate copy for the cargo broker ordering journey. It ensures new features ship with consistent tone, localization coverage, and reusable translation keys.

## Principles

1. **Customer-first clarity** – copy must explain each step of the ordering journey in plain language and highlight the next action.
2. **Trust & reliability** – emphasize safety, delivery confidence, and transparent pricing to build user confidence.
3. **Actionable guidance** – every component should communicate what the user needs to provide and why it matters.
4. **Localization parity** – Azerbaijani, English, and Russian experiences ship together with equivalent messaging.

## Voice & Tone

- Friendly and professional; avoid slang.
- Use short sentences that work in all supported languages.
- Prefer verbs in buttons (e.g. “Confirm payment”, “Add item”).
- Surface reassurance in error and status messages (e.g. suggest corrective actions).

## Content Planning Workflow

1. **Define the user task** – capture what the user is trying to achieve (order intake, delivery selection, payment confirmation, etc.).
2. **Outline component copy** – document headings, helper text, CTA labels, validation messages, and toasts.
3. **Review with product & legal** – verify terminology (e.g. courier vs. pickup) and compliance requirements.
4. **Author source language (EN)** – write the English copy using the tone guidelines above.
5. **Translate to AZ & RU** – leverage the translation spreadsheet (see below) or submit to translators with context notes.
6. **QA in product** – validate rendering, layout fit, and pluralization/number formatting.

## Translation Key Naming

- Structure keys as `<feature>.<surface>.<element>` (e.g. `order.form.addItemButton`).
- Reuse shared keys (`common.*`) for cross-cutting UI (navigation, toasts, totals).
- Keep validation messages under `validation.*` so they can be reused by reactive forms.
- Document any non-obvious copy with comments in the JSON file to help translators.

## Collaboration Assets

- **Source of truth** – maintain a spreadsheet with columns for key, English, Azerbaijani, Russian, and context.
- **Review checkpoints** – translators sign off on AZ/RU, then engineering verifies JSON encoding and special characters.
- **Versioning** – treat translation updates like code; include them in PRs with screenshot diffs when UI changes.

## Localization QA Checklist

- [ ] Dynamic values (names, totals, ids) use interpolation placeholders (`{{ }}`) rather than string concatenation.
- [ ] Currency and dates are formatted with the `CurrencyPipe`/`DatePipe` using the locale from state.
- [ ] Right-to-left languages (future) render correctly by applying `dir` on the `<html>` element.
- [ ] Fallback language defaults to English when a key is missing.
- [ ] Unit tests cover at least one AZ and RU render path for each feature component.

## Future Enhancements

- Automate translation extraction with a script that validates unused or missing keys.
- Introduce screenshot tests to confirm layout stability in each language.
- Expand the spreadsheet to include glossary entries for shipping terminology.
