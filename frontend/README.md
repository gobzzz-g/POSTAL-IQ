# POSTALIQ Frontend — Web Application & Design System

The modern client application for **POSTALIQ**, built with React 19, TypeScript, Tailwind CSS v4, and Vite.

## Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── animation/      # Framer Motion entrance, stagger & page transition wrappers
│   │   ├── common/         # Leaflet PostalMap, StatCards, Modals, StatusBadges
│   │   └── layout/         # PublicNavbar, PublicFooter, AppLayout, Navbar
│   ├── features/
│   │   ├── address-search/ # AddressWorkspace & single-address query workbench
│   │   ├── admin/          # AdminDashboard (Analytics, record management, logs)
│   │   ├── auth/           # UserLoginPage & AdminLoginPage
│   │   ├── bulk-validation/# BulkValidation (Batch CSV drag-and-drop & export)
│   │   ├── history/        # HistoryView (Private session audit log)
│   │   ├── landing/        # Public LandingPage, Features, About, HowItWorks, Privacy
│   │   ├── map/            # InteractiveMapPage (Leaflet GPS survey centroids)
│   │   ├── post-office-search/ # Gazetteer directory lookup
│   │   └── prediction/     # PredictionCard, CandidateComparison, FeedbackModal
│   ├── services/           # Typed API Client & session authentication management
│   ├── types/              # Pydantic-mirrored TypeScript interfaces
│   ├── App.tsx             # Route declarations & protected route guards
│   ├── main.tsx            # Application entrypoint
│   └── index.css           # Tailwind CSS v4 design tokens & theme variant
├── package.json
└── vite.config.ts
```

## Available Scripts

### `npm run dev`
Starts the Vite local development server on `http://127.0.0.1:5173` with Hot Module Replacement (HMR).

### `npm run build`
Compiles TypeScript using `tsc -b` and bundles production assets via Vite.

### `npm test`
Executes Vitest test suite (`src/test/App.test.tsx`) verifying route guards, authenticated redirects, and homepage rendering.

## Design System & Theme Support

- **Typography**: Google Font `Urbanist` for editorial headings and UI, `JetBrains Mono` for PIN codes and GPS coordinates.
- **Color Palette**:
  - Primary Accent: Crimson `#A01D26`
  - Dark Theme: Charcoal `#18191B` and `#1B1C1D`
  - Light Theme: Clean Slate `bg-slate-50` and `#FFFFFF`
- **Dark/Light Mode**: Synced to `localStorage` under `postaliq_theme` and applied via Tailwind CSS v4 `@custom-variant dark`.
