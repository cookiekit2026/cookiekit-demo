# CookieKit — Copilot Instructions

## Project overview

CookieKit is a cookie-consent microfrontend service currently in **alpha/beta** — published but not officially released. This is a solo entrepreneurship project built and maintained by a single fullstack developer with 20 years of experience. Prefer pragmatic, direct solutions over over-engineered abstractions.

It consists of two packages in an npm workspace monorepo (Node ≥ 20, npm ≥ 9):

| Package                  | Tech                    | Domain                                           | Deployed to                                                 |
| ------------------------ | ----------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| `packages/cookiekit`     | StencilJS 4             | Web-component library (the microfrontend itself) | `cdn.cookiekit.eu` via Vercel (CI from private GitHub repo) |
| `packages/cookiekit-web` | Next.js 16 (App Router) | Marketing site, docs, subscription               | `www.cookiekit.eu` via Vercel                               |

`packages/cookiekit-demo` is a temporary scratch project — ignore it.

---

## packages/cookiekit (StencilJS web-component library)

### Purpose

Provides the embeddable cookie-consent UI as framework-agnostic web components. Customers load it from the CDN and drop the tags into their HTML.

### Key components

- `<consent-dialog>` — the main cookie-consent dialog; reads/writes the `cookiekit` cookie as JSON `{ consent, mode, timestamp }`.
- `<consent-guard>` — conditionally renders slot content based on consent state; listens for the `cookiekit:consent-changed` custom event.
- `<consent-missing>` — placeholder shown when required consent is absent.

### Conventions

- Component files use `.tsx`; styles are co-located `.styles.scss` files.
- Shadow DOM is the default for consent-dialog components to prevent style bleeding and host-page CSS interference.
- `consent-guard` intentionally uses `shadow: false` (light DOM) so it can activate `<script>` tags inside slots.
- Shadow DOM is acceptable for UU/a11y, but dialog behavior must still meet WCAG/EN 301 549 requirements.
- For consent dialogs, always implement and preserve: semantic dialog labeling (`role="dialog"` + accessible name), keyboard navigation, visible focus styles, and predictable tab order.
- If rendered as a modal, focus must move into the dialog on open, be trapped while open, and be restored to the previous element on close.
- Debug-only UI must not be exposed to assistive technology in production builds.
- Shared types live in `src/types/` (`entities.ts`, `enums.ts`).
- Shared constants (e.g. `COOKIE_NAME = 'cookiekit'`, `COOKIE_TYPE_OPTIONS`) live in `src/constants/index.ts`.
- Consent categories are `analytics`, `marketing`, `preferences`.
- The global custom event is `cookiekit:consent-changed`; its `detail` payload is `{ consent, mode, timestamp }`.
- Generate new components with `npm run generate --workspace=cookiekit`.
- Tests use Jest + Puppeteer (`*.spec.ts` unit, `*.e2e.ts` end-to-end). Run with `npm test --workspace=cookiekit`.
- Build output goes to `dist/` and `loader/`. Do not hand-edit files in `www/` or `loader/`.
- Stencil namespace is `cookiekit`; the ESM entry on the CDN is `cookiekit.esm.js`.

---

## packages/cookiekit-web (Next.js marketing & subscription site)

### Purpose

Sales pitch, documentation, and subscription management for CookieKit. Integrates with **Paddle.com** for payments and **MongoDB** for persistence.

### Stack

- Next.js 16 App Router, React 19, TypeScript 5
- MUI v7 (Material UI) with Emotion for components and styling
- SCSS (`src/styles/global.scss`) for global styles; component-level styles via MUI `sx` prop or Emotion
- Fonts: Roboto (body), Contrail One & Oxanium (display)
- Turbopack enabled in dev (`next dev` uses `turbopack.root`)

### Routing & i18n

- All user-facing pages live under `src/app/[locale]/`.
- Supported locales: `en` (default), `no`.
- Locale config: `src/i18n/config.ts` — always guard with `isValidLocale()` before rendering.
- Translations are file-based JSON per page under `src/locales/<page>/<locale>.json`.
- Dictionary loaders live in `src/i18n/get-dictionary.ts`.

### Theme

- Light/dark toggle persisted in both `localStorage` and a `themeMode` cookie.
- Custom `ThemeProvider` wraps MUI's; import from `@/theme/ThemeProvider`.
- Theme tokens defined in `src/theme/index.ts`.

### Payments — Paddle

- Paddle v2 JS SDK loaded client-side via `<script>` tag in `PaddleCheckoutButton`. Do not install a Paddle npm package — `Paddle` is declared on `window`.
- Environment is controlled by `NEXT_PUBLIC_PADDLE_ENV` (`sandbox` | `production`). The button selects the correct credential pair automatically.
- **Sandbox env vars**: `NEXT_PUBLIC_PADDLE_SANDBOX_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_SANDBOX_PRICE_ID`
- **Production env vars**: `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_PRICE_ID`
- **Server-side secrets**: `PADDLE_SANDBOX_WEBHOOK_SECRET`, `PADDLE_WEBHOOK_SECRET`
- Customer data (name, email, organisation, domain) is collected by `CheckoutForm` before the overlay opens and passed to Paddle as `customData`.
- Paddle calls back post-purchase to `/[locale]/payment/success`.

#### Webhook routes

| Route                              | Handler                    | Sandbox flag |
| ---------------------------------- | -------------------------- | ------------ |
| `POST /api/paddle/webhook`         | `handle-paddle-webhook.ts` | `false`      |
| `POST /api/paddle/webhook-sandbox` | `handle-paddle-webhook.ts` | `true`       |

- Signature verification uses HMAC-SHA256 with timing-safe compare.
- Handled events: `subscription.created`, `subscription.trialing`, `subscription.updated`, `subscription.canceled`, `transaction.completed`.
- All Paddle events are idempotent — duplicate deliveries are safe.

#### Subscription status API

`GET /api/subscription/status?domain=example.com` — public endpoint (CORS `*`) used by the StencilJS component to check if a domain has an active subscription. Returns `{ active, status, billingInterval, subscriptionEnd }`.

### Database — MongoDB

- Mongoose 7 singleton connection in `src/lib/database/db-connect.ts`. Appends `/main` database name to the URI automatically.
- Required env var: `MONGODB_URI` (Atlas connection string, without trailing database name).
- Models are in `src/lib/database/subscription/`. Schema uses explicit collection name `'subscription'` to prevent Mongoose pluralisation.
- DB access must only happen in Server Components or Route Handlers — never in client components.
- Atlas Network Access must allow `0.0.0.0/0` (or Vercel fixed IPs on Pro) because Vercel serverless functions have dynamic egress IPs. Auth is still enforced via the URI credentials.

### Path aliases

- `@/` maps to `src/` (configured in `tsconfig.json`).

### File naming and organization rules

- All React components in `src/components/` use PascalCase filenames.
- If helper functions or resources are needed outside a component body, create a sibling `utils.ts` and export them from there.
- Function component props interfaces are named `Props` by default.
- If props interface is exported, name it `<ComponentName>Props`.
- Files and folders that are not React components use kebab-case names.
- All entities and enums are stored in `src/types/`.
- All shared constants are stored in `src/constants/global.ts`.

---

## Monorepo scripts (root `package.json`)

```
npm start               # stencil dev server
npm run start:web       # Next.js dev server
npm run build           # build cookiekit only
npm run build:all       # build all packages
npm run build:web       # build cookiekit-web
```

---

## General conventions

- TypeScript throughout; avoid `any`, prefer explicit interfaces.
- Functional components in React; class-based `@Component` decorator pattern in StencilJS.
- Do not add dependencies without checking whether the existing stack already covers the need.
- Keep web-component API surface minimal and backward-compatible — customers embed these on their sites.
- Environment secrets (Paddle, MongoDB) go in `.env.local` and are never committed.
