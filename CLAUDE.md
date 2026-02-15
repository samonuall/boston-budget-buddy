# CLAUDE.md — Boston Budget Buddy

## Quick Reference

- **Stack**: React 19 + Vite 7 + Tailwind CSS v4 + Electron 40 + SQLite (better-sqlite3)
- **Dev server**: `npm run dev` (browser, port 5173, uses localStorage)
- **Electron dev**: `npm run electron:dev` (starts Vite + Electron concurrently)
- **Build**: `npm run build` (Vite build) / `npm run electron:build` (Vite + electron-builder)
- **No test framework** is configured yet

## Architecture

### Data Flow

```
BudgetProvider (src/hooks/useBudget.jsx)
  ├── State: grossSalary, bonus, 401k%, expenses[], categoryBudgets{}, month/year
  ├── Computed: takeHome (via taxCalculator), spending by category, Dale mood
  └── Storage: window.electronAPI (Electron) || localStorage fallback (browser)
```

All components consume budget state via `useBudget()` hook. There is no router — `App.jsx` conditionally renders `<Onboarding>` or `<Dashboard>` based on `onboardingComplete` setting.

### Storage Layer (src/utils/storage.js)

Abstracts Electron IPC vs localStorage. Every function checks `window.electronAPI` first.
- **Electron path**: `contextBridge` in preload.cjs -> `ipcMain` handlers in main.cjs -> better-sqlite3
- **Browser path**: `localStorage` with `bbb_` key prefix, expenses stored as JSON array
- DB tables: `user_settings` (key/value), `expenses` (id, amount, category, note, date, created_at)

### Tax Calculator (src/utils/taxCalculator.js)

- 2024 federal single-filer brackets, $14,600 standard deduction
- MA flat 5% state tax
- FICA: Social Security 6.2% (capped $168,600) + Medicare 1.45%
- 401(k) deducted pre-tax from gross
- `calculateTakeHome(gross, bonus, four01kPct)` returns full breakdown

### Categories (src/utils/constants.js)

11 budget categories, each typed as needs/wants/savings:
- **Needs**: rent, food, utilities, transportation, renters_insurance, personal_care
- **Wants**: gym, fun, social
- **Savings**: roth_ira, savings

Splurge meter shows Needs / Wants / Treats (treats = 30% of wants spending).

### Dale the Dachshund (src/components/Dale.jsx)

SVG mascot fixed at viewport bottom. Mood states: happy, nervous, alarmed, sleeping.
Mood derived in `useBudget()` based on `overBudgetCategories` and `warningCategories`.
Click to cycle through mood-specific quotes from `DALE_QUOTES` in constants.js.

## Tailwind Theme (src/index.css)

Custom `@theme` colors — use these, not arbitrary hex:
- `cream`, `cream-dark` — backgrounds
- `sage`, `sage-dark`, `sage-light` — primary/success (green tones)
- `dusty-purple`, `dusty-purple-dark`, `dusty-purple-light` — secondary (purple)
- `teal`, `teal-dark` — accent
- `warm-rose`, `warm-rose-dark` — treats/danger accent
- `text`, `text-light`, `text-muted` — text colors
- `warning`, `danger`, `success` — status colors

## Key Files to Know

| File | What it does |
|------|-------------|
| `src/hooks/useBudget.jsx` | Central state — start here for any logic changes |
| `src/utils/constants.js` | Categories, defaults, Dale quotes |
| `src/utils/taxCalculator.js` | Tax math — update for new tax years |
| `src/utils/storage.js` | Persistence abstraction |
| `electron/main.cjs` | SQLite schema + IPC handlers |
| `electron/preload.cjs` | Electron API surface |
| `src/pages/Dashboard.jsx` | Main UI layout + SettingsModal |
| `src/pages/Onboarding.jsx` | Setup wizard (2 steps) |

## Common Tasks

**Add a new budget category**: Add to `CATEGORIES` in constants.js, add default in
`DEFAULT_BUDGETS`, update type arrays (`NEEDS_CATEGORIES`, etc.) if needed.

**Add a new IPC method**: Add handler in `electron/main.cjs`, expose in
`electron/preload.cjs`, add fallback in `src/utils/storage.js`, consume in `useBudget.jsx`.

**Update tax year**: Edit brackets and deduction in `taxCalculator.js`.

**Change Dale behavior**: Edit mood derivation in `useBudget.jsx` (`daleMood` logic),
quotes in `constants.js` (`DALE_QUOTES`), animations in `Dale.jsx`.

## Known Gaps / Future Work

- No test suite — add Vitest + React Testing Library
- No TypeScript — consider migrating for type safety
- No recurring/fixed expense automation
- No data export (CSV/PDF)
- No multi-month trend charts or analytics
- Electron build only targets macOS currently
- No CI/CD pipeline
- Settings modal lacks category budget editing (set during onboarding only)
