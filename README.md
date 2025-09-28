# Cargo Broker

Cargo Broker is a multi-step Angular application that helps merchants simulate the process of booking, paying for, and tracking cargo deliveries in Azerbaijan. The project stitches together localized customer flows, stateful form wizards, and supporting services so product teams can prototype end-to-end logistics experiences quickly.

## Repository structure

```
apps/
  web/                # Angular front end and supporting tooling
architecture.md       # System design notes
how-cargo-systems-works-in-azerbaijan.md
                      # Background research on the local cargo domain
user_journey.md       # Narrative walkthrough of the booking experience
the_customer_workflow_of_this_project.md
                      # Stakeholder workflow documentation
todo.md               # Roadmap tracking completed and planned tasks
```

## Features

- **Guided checkout journey** covering landing, order capture, delivery preferences, review, payment simulation, and status/inbox routes.
- **Signal-driven application state** with persisted order, delivery, payment, and language slices for resilient navigation between pages.
- **Rich localization** via `ngx-translate`, providing Azerbaijani, English, and Russian copy for the shell, journey steps, and mock data fixtures.
- **Accessible UI building blocks** including shared button, card, form field, stepper, and toast components with keyboard and screen-reader support.
- **Testing and tooling** with Angular TestBed-powered unit specs, Puppeteer-backed Karma runs, ESLint, TailwindCSS, and GitHub Actions CI ready for deployment.

## Getting started

1. **Install dependencies**

   ```bash
   cd apps/web
   npm install
   ```

2. **Start the development server**

   ```bash
   npm start
   ```

   The app is served on [http://localhost:4200](http://localhost:4200). Hot module replacement is enabled, and localized assets are loaded automatically.

3. **Run unit tests**

   ```bash
   npm test -- --watch=false
   ```

   The project uses a headless Chromium runner configured through Puppeteer. Ensure your environment allows the bundled binary to start.

4. **Lint the project**

   ```bash
   npm run lint
   ```

## Deployment

GitHub Actions builds the Angular project and archives the GitHub Pages artifact from `apps/web/dist/web/github-pages/browser`. Ensure the Pages workflow or any manual deployment reuses the `github-pages` build configuration to honour the base href.

## Additional documentation

- Read `todo.md` for the active roadmap and completed milestones.
- Explore the `docs/` and `public/assets/` directories inside `apps/web` for content strategy, mock data, and localization dictionaries.
- Review the feature specifications in the markdown files at the repository root to understand the intended customer journey and business context.

## Contributing

1. Fork and clone the repository.
2. Create a feature branch from `main`.
3. Make your changes, adding unit tests when applicable.
4. Run `npm run lint` and `npm test -- --watch=false` from `apps/web`.
5. Commit your work and open a pull request summarizing the updates and test coverage.

