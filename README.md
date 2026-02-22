# Bekam Frontend

Community-powered grocery price comparison platform for Egypt. Built with React, TypeScript, and Vite.

**Arabic-first, fully bilingual (AR/EN), RTL-native, PWA-ready.**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5.5 |
| Build | Vite 5.4 |
| Styling | TailwindCSS 3.4 + CSS custom properties |
| Routing | React Router 6 (lazy-loaded) |
| Auth | Supabase Auth (email/password + phone OTP) |
| API Client | Axios with auto-token injection |
| i18n | i18next + browser language detection |
| Icons | Lucide React |
| Charts | Recharts |
| Barcode | QuaggaJS 2 |
| SEO | react-helmet-async |
| Error Monitoring | Sentry |
| PWA | vite-plugin-pwa (Workbox) |
| Testing | Vitest + Testing Library + jsdom |
| Linting | ESLint + Prettier |

---

## Quick Start

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3001` (see `../backend`)

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Start dev server
npm run dev
```

The app opens at `http://localhost:5173`. API requests proxy to `localhost:3001`.

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:3001/api
VITE_SENTRY_DSN=               # optional
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (port 5173) |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run unit tests (Vitest) |
| `npm run lint` | Lint with ESLint |

---

## Project Structure

```
src/
├── components/          # 25 reusable UI components
│   ├── Layout.tsx           # Page shell (Navbar + BottomNav + content)
│   ├── Navbar.tsx           # Top nav: logo, search, auth, lang/theme
│   ├── BottomNav.tsx        # Mobile bottom tab bar
│   ├── AdminLayout.tsx      # Admin sidebar layout
│   ├── AuthModal.tsx        # Login/signup modal (email + OTP)
│   ├── ProtectedRoute.tsx   # Auth/admin route guard
│   ├── ProductCard.tsx      # Product list card
│   ├── PriceCard.tsx        # Price entry with voting
│   ├── StoreCard.tsx        # Store info card
│   ├── VoiceSearchButton.tsx    # Mic button for voice search
│   ├── VoiceSubmitFlow.tsx      # Multi-step voice price submission
│   ├── BarcodeScanner.tsx       # Camera barcode scanner
│   ├── CommentSection.tsx       # Product comments
│   ├── PriceAlertButton.tsx     # Price drop alert subscription
│   ├── TrustBadge.tsx           # User reputation badge
│   ├── RegionSelector.tsx       # Region picker dropdown
│   ├── RegionProgress.tsx       # Region activation progress
│   ├── InlineAddProduct.tsx     # Quick-add product form
│   ├── InlineAddStore.tsx       # Quick-add store form
│   ├── LanguageSwitcher.tsx     # AR/EN toggle
│   ├── ThemeSwitcher.tsx        # Color theme picker
│   ├── SEOHead.tsx              # Dynamic meta tags
│   ├── PageLoader.tsx           # Suspense fallback
│   ├── ErrorBoundary.tsx        # Error catch boundary
│   └── InstallPrompt.tsx        # PWA install banner
│
├── pages/               # 11 page components
│   ├── Home.tsx             # Hero search, trending products, store rankings
│   ├── Search.tsx           # Full-text search + category filters + pagination
│   ├── Product.tsx          # Product detail, price comparison, comments
│   ├── Store.tsx            # Store detail + prices
│   ├── Submit.tsx           # Multi-step price submission (manual + voice)
│   ├── Regions.tsx          # Region browsing + waitlist
│   ├── Profile.tsx          # User profile + stats
│   ├── Basket.tsx           # Shopping basket comparison
│   ├── Inflation.tsx        # Price trend charts
│   ├── Challenge.tsx        # Community challenges
│   ├── NotFound.tsx         # 404 page
│   └── admin/
│       ├── Dashboard.tsx    # Admin stats overview
│       ├── Prices.tsx       # Moderate price submissions
│       ├── Products.tsx     # Manage products
│       ├── Stores.tsx       # Manage stores
│       └── Regions.tsx      # Manage regions
│
├── hooks/               # 7 custom hooks
│   ├── useAuth.ts           # Auth state + login/signup methods
│   ├── useRegion.ts         # Selected region (persisted to localStorage)
│   ├── useTheme.ts          # Theme color switching (6 themes)
│   ├── useSearch.ts         # Debounced product search (300ms)
│   ├── usePrices.ts         # Price CRUD: fetch, submit, vote
│   ├── useVoiceRecorder.ts  # Mic recording + base64 encoding (max 15s)
│   └── useVoiceSubmit.ts    # Voice → transcribe → parse → match pipeline
│
├── contexts/            # 3 React context providers
│   ├── AuthContext.tsx      # User session, admin check, auth methods
│   ├── RegionContext.tsx    # Active regions list + selection
│   └── ThemeContext.tsx     # Theme state + CSS variable application
│
├── lib/                 # Utilities and config
│   ├── api.ts               # Axios instance (auto Bearer token + Accept-Language)
│   ├── supabase.ts          # Supabase client init
│   ├── i18n.ts              # i18next config (AR default, auto-detect)
│   ├── storage.ts           # Supabase storage (price image upload)
│   ├── pushNotifications.ts # Web Push subscribe/unsubscribe
│   └── utils.ts             # cn(), formatPrice(), timeAgo(), getTrustLevel()
│
├── locales/             # Translation files
│   ├── ar.json              # Arabic (Egyptian dialect)
│   └── en.json              # English
│
├── __tests__/           # Unit tests
│   ├── AuthModal.test.tsx
│   ├── ErrorBoundary.test.tsx
│   └── Submit.test.tsx
│
├── App.tsx              # Router config + context providers
├── main.tsx             # Entry point (React root)
├── index.css            # Global styles, theme variables, component classes
└── vite-env.d.ts        # Vite type declarations
```

---

## Routes

### Public

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Hero search, trending products, cheapest stores, active challenge |
| `/search` | Search | Full-text product search with category filters and pagination |
| `/product/:id` | Product | Price comparisons across stores, comments, alerts |
| `/store/:id` | Store | Store details and associated prices |
| `/regions` | Regions | Browse governorates, join waitlists |
| `/inflation` | Inflation | Price trend charts by category |
| `/challenge` | Challenge | Community weekly challenges and leaderboard |

### Protected (requires login)

| Path | Page | Description |
|------|------|-------------|
| `/submit` | Submit | Multi-step price submission (manual or voice) |
| `/profile` | Profile | User stats, trust level, submission history |
| `/basket` | Basket | Shopping basket price comparison across stores |

### Admin (requires admin role)

| Path | Page | Description |
|------|------|-------------|
| `/admin` | Dashboard | System metrics and submission stats |
| `/admin/prices` | Prices | Moderate and manage price submissions |
| `/admin/products` | Products | CRUD product catalog |
| `/admin/stores` | Stores | CRUD store directory |
| `/admin/regions` | Regions | Manage governorate activation |

---

## Architecture

```
App.tsx
└── ThemeProvider
    └── AuthProvider
        └── RegionProvider
            ├── Layout
            │   ├── Navbar
            │   ├── <Suspense> → Lazy-loaded pages
            │   ├── BottomNav (mobile)
            │   └── InstallPrompt (PWA)
            ├── ProtectedRoute → authenticated pages
            └── ProtectedRoute (admin) → AdminLayout → admin pages
```

**State management:** React Context for global state (auth, region, theme) + local `useState` for component state. No Redux — the app is intentionally simple.

**Data fetching:** Custom hooks wrapping Axios calls. The `api` instance auto-injects the Supabase Bearer token and `Accept-Language` header on every request.

**Code splitting:** All page components are lazy-loaded via `React.lazy()` with a `<Suspense>` fallback (`PageLoader`).

---

## Features

### Core
- **Price comparison** — compare grocery prices across stores in your region
- **Product search** — full-text search with category filters and pagination
- **Voice search** — tap the mic on Home or Search to speak a product name
- **Voice price submission** — say product, store, and price in natural language (Arabic/English)
- **Barcode scanning** — scan product barcodes to auto-fill submissions
- **Price alerts** — get notified when a product drops below your target price
- **Community voting** — upvote/downvote prices to verify accuracy

### User System
- **Authentication** — email/password or phone OTP via Supabase Auth
- **Trust system** — earn points for accurate submissions (Newcomer → Contributor → Trusted → Expert → Champion)
- **Shopping baskets** — create baskets and find the cheapest store for all items

### Regional
- **Governorate filtering** — prices scoped to your selected region
- **Region activation** — regions unlock after reaching a price submission threshold
- **Waitlists** — join the waitlist for inactive regions

### Platform
- **PWA** — installable, offline-capable with Workbox service worker caching
- **Push notifications** — web push via VAPID keys
- **Bilingual** — Arabic (Egyptian dialect) and English with full RTL support
- **6 color themes** — Red, Blue, Green, Purple, Orange, Teal
- **SEO** — dynamic meta tags via react-helmet-async
- **Error monitoring** — Sentry integration

---

## Internationalization

Two languages with automatic detection:

| Language | Code | Direction | Default |
|----------|------|-----------|---------|
| Arabic (Egyptian) | `ar` | RTL | Yes |
| English | `en` | LTR | No |

Detection order: localStorage → browser language → fallback to `ar`.

Translation files live in `src/locales/`. The `LanguageSwitcher` component toggles between them. Document direction (`dir="rtl"`) is set automatically.

All TailwindCSS uses logical properties (`ps-`, `pe-`, `ms-`, `me-`, `start-`, `end-`) instead of `left/right` for proper RTL support.

---

## Theming

Six built-in color themes controlled via CSS custom properties:

| Theme | Primary Color | Key |
|-------|--------------|-----|
| Blaze | `#E63946` (Red) | `red` |
| Ocean | `#3B82F6` (Blue) | `blue` |
| Forest | `#22C55E` (Green) | `green` |
| Royal | `#A855F7` (Purple) | `purple` |
| Sunset | `#F97316` (Orange) | `orange` |
| Fresh | `#14B8A6` (Teal) | `teal` |

Themes are stored in `localStorage` and applied via `data-theme` on the `<html>` element. Each theme defines a full 50–900 shade palette for `primary`, `secondary`, `success`, `warning`, and `surface` colors.

Global component classes (`.btn-primary`, `.card`, `.input`, `.glass`, etc.) are defined in `index.css` and adapt to the active theme automatically.

---

## PWA Configuration

The app ships as a Progressive Web App via `vite-plugin-pwa`:

- **Install prompt** — custom `InstallPrompt` component for A2HS
- **Service worker** — auto-updating Workbox SW
- **Caching strategies:**
  - API calls → NetworkFirst (1-day cache)
  - Images → CacheFirst (30-day cache)
  - Google Fonts → StaleWhileRevalidate (1-year cache)
- **Offline support** — cached pages and API responses work offline
- **Manifest** — proper icons, theme color, display: standalone

---

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npx vitest

# Coverage
npx vitest run --coverage
```

Tests use **Vitest** + **Testing Library** + **jsdom**. Test files are in `src/__tests__/`.

Current test suites:
- `AuthModal.test.tsx` — login/signup modal rendering and interactions (6 tests)
- `ErrorBoundary.test.tsx` — error boundary catch and fallback UI (3 tests)
- `Submit.test.tsx` — price submission form flow (3 tests)

---

## API Integration

All API calls go through `src/lib/api.ts`, an Axios instance that:

1. Uses `VITE_API_URL` as base URL (defaults to `/api`)
2. Auto-attaches `Authorization: Bearer <token>` from Supabase session
3. Auto-attaches `Accept-Language` from i18next
4. Times out after 15 seconds

In development, Vite proxies `/api` to `http://localhost:3001` (configured in `vite.config.ts`).

### Key API Endpoints Used

| Method | Endpoint | Used By |
|--------|----------|---------|
| `GET` | `/products/search?q=...` | Search page, useSearch hook |
| `GET` | `/products/trending` | Home page |
| `GET` | `/products/:id` | Product detail page |
| `GET` | `/products/categories` | Search page filters |
| `GET` | `/prices?product_id=...` | Product detail page |
| `POST` | `/prices` | Submit page |
| `POST` | `/prices/:id/vote` | PriceCard voting |
| `GET` | `/stores/rankings` | Home page |
| `GET` | `/stores/:id` | Store detail page |
| `POST` | `/voice/process` | Voice submit flow |
| `POST` | `/voice/search` | Voice search button |
| `GET` | `/regions` | Regions page |
| `GET` | `/challenges/active` | Home + Challenge page |

---

## Build & Deploy

```bash
# Production build
npm run build

# Output is in dist/
# Deploy to any static hosting (Vercel, Netlify, Firebase, etc.)
```

The build output is a static SPA. Requires a server-side redirect rule to send all paths to `index.html` for client-side routing.

### Vercel

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Nginx

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Netlify

Create a `public/_redirects` file:

```
/* /index.html 200
```

---

## Code Style

- **TypeScript strict mode** — no implicit any, strict null checks
- **Prettier** — single quotes, semicolons, trailing commas, 100 char width
- **ESLint** — TypeScript rules + React Hooks rules
- **TailwindCSS** — utility-first, logical properties for RTL
- **Naming** — PascalCase components, camelCase hooks/utils, kebab-case files for assets

---

## License

Private — All rights reserved.
