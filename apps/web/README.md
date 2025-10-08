# Cargo Broker Web App

An Angular-powered prototype that walks merchants through simulating cargo orders in Azerbaijan. The application is fully localized (AZ/EN/RU), enforces an end-to-end checkout sequence, and persists mock submissions so teams can explore UX and content decisions.

## Tech stack

- Angular standalone APIs (v18+)
- Angular signals for client-side state management
- Tailwind CSS for design tokens and layout primitives
- `ngx-translate` for runtime localization
- Jasmine/Karma with Puppeteer-driven headless Chromium for unit tests

## Prerequisites

- Node.js 20+
- npm 10+

## Install dependencies

```bash
npm install
```

## Run the development server

```bash
npm start
```

The app is available at [http://localhost:4200](http://localhost:4200). Changing translations, styles, or features triggers a live reload.

## Run unit tests

```bash
npm test -- --watch=false
```

Tests execute in a Puppeteer-managed headless Chromium. If the binary fails to launch in your environment, install the missing system libraries or run the tests in a container that provides them.

## Lint the codebase

```bash
npm run lint
```

## Build configurations

The project defines multiple Angular build targets:

- `production`: optimized app shell used for deployment.
- `github-pages`: production build with an adjusted base href so the app can run from a GitHub Pages subdirectory.

To emit the GitHub Pages artifact locally:

```bash
npm run build -- --configuration=github-pages
```

The output is written to `dist/web/github-pages/browser`.

## Project structure

```
src/
  app/
    data-access/       # Models, services, validators, guards
    features/          # Feature components (order, delivery, payment, review)
    layout/            # Shell layout, language selector, navigation
    pages/             # Route-level wrappers for each journey step
    shared/            # Reusable UI and accessibility utilities
    testing/           # Translate helpers for specs
  main.ts              # Bootstrap logic
  styles.css           # Tailwind entry point
public/
  assets/i18n/         # AZ/EN/RU translation dictionaries
  assets/mocks/        # Shipping dataset consumed by delivery flow
```

## Documentation

- `docs/feature-copy-content-strategy.md` describes the voice, tone, and localization workflow.
- `todo.md` in the repository root tracks completed milestones and upcoming tasks.
- Root-level markdown files outline the architecture, customer workflow, and journey research.

## Troubleshooting

- **Chrome cannot start:** verify you have the required system libraries (e.g., `libatk-1.0`) or run `npm test` inside a container with the dependencies preinstalled.
- **Translations show keys:** ensure `provideTranslateHttpLoader` is registered in `app.config.ts` and that the JSON dictionaries are served from `public/assets/i18n`.
- **Guard blocks navigation:** the multi-step guard expects valid state slices; use the UI to progress through each step or reset the app from the status screen.
