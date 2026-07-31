# CLAUDE.md — Boston Budget Buddy

## Quick Reference

- **Stack**: React 19 + Vite 7 + Tailwind CSS v4 + Electron 40 + SQLite (better-sqlite3)
- **Dev server**: `npm run dev` (browser, port 5173, uses localStorage)
- **Electron dev**: `npm run electron:dev` (starts Vite + Electron concurrently)
- **Build**: `npm run build` (Vite build) / `npm run electron:build` (Vite + electron-builder)
- **No test framework** is configured yet
- **Version 2.0.0** — categories are user-editable; see the Categories section

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

### Categories (src/utils/categories.js) — user-editable data, v2+

Categories are **not** a constant. They live in the `categories` setting as JSON:
`{ key, label, emoji, type, order, archived }`, and are created/renamed/deleted
from the Settings modal.

- `key` is a **stable id referenced by every row in `expenses`** — it is assigned
  once and never rewritten. Renaming changes `label`, never `key`.
- `DEFAULT_CATEGORIES` in constants.js is *seed data only*, used on first run and
  to backfill a key found in saved budgets with no definition.
- Migration runs in `useBudget.jsx` (not `main.cjs`) so it behaves identically in
  browser dev and Electron. It is additive — it never touches the expenses table.
- **Delete = archive** when the category has expenses (label/emoji must survive
  for old rows); **purge** only when it has none. See `CategoryEditor.jsx`.
- `getCategory(key)` always returns a renderable record, falling back to `❓` for
  unknown keys, so a missing definition can never crash a render.

`type` (needs/wants/savings) is now only a grouping label for the settings UI.

### Budget status (`deriveCategoryStatus`)

`neutral` (no budget) · `good` · `warning` (≥80%) · **`met`** (exactly on budget)
· `over` (strictly above). `met` is a win: it renders green and is deliberately
excluded from `overBudgetCategories`. Uses a half-cent epsilon for float drift.

### Dale the Dachshund (src/components/Dale.jsx + DaleZone.jsx)

PNG mascot rendered **in the page flow**, inside `BudgetOverview` below the
"Left to spend this month" card — not a fixed overlay.

- **Dale only ever says nice things.** Every pool in `DALE_QUOTES` is kind; there
  is a test asserting no scolding vocabulary appears. Keep it that way.
- Quotes are picked by time of day (morning / day / night) via `utils/dale.js`.
  The clock is read **in the click handler**, not at render, so an app left open
  overnight still greets you correctly.
- Hats (`DALE_HATS`) are emoji anchored to his head via `HAT_ANCHOR`, expressed
  as % of Dale's rendered size. Persisted in the `dale_hat` setting.
- Drag the 🦴 onto him to feed him — hit-testing compares the pointer position
  against Dale's `getBoundingClientRect()`.

## Styling (src/index.css)

> ⚠️ **Any global reset MUST stay inside `@layer base`.** Tailwind v4 emits
> utilities into `@layer utilities`, and unlayered CSS beats layered CSS in the
> cascade regardless of specificity. An unlayered `* { margin: 0; padding: 0 }`
> silently kills every `p-*`, `m-*`, `mx-auto` and `space-y-*` in the app — cards
> lose their inner padding and centred containers hug the left edge.

> **Nunito is self-hosted** (`public/fonts/`, one 39KB variable woff2 covering
> weights 200–1000). Do not re-add a Google Fonts `<link>`: this app runs locally
> and often offline, and a failed font request silently changes every metric.

Use the `.emoji` class wherever an emoji renders. `letter-spacing` applies after
the final character too, so an emoji in a centred box is laid out as
"glyph + trailing space" and drifts visibly left. `.emoji` zeroes it and centres
via inline-flex with `line-height: 1`.

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
| `src/utils/constants.js` | Seed categories, defaults, Dale quotes + hats |
| `src/utils/categories.js` | Category model, migration, status rule |
| `src/utils/dale.js` | Time-of-day quote selection |
| `src/components/CategoryEditor.jsx` | Add/rename/delete categories in Settings |
| `src/components/EmojiPicker.jsx` | Self-contained emoji picker (no external dep) |
| `src/components/DaleZone.jsx` | Dale + hat rack + draggable treat |
| `src/utils/taxCalculator.js` | Tax math — update for new tax years |
| `src/utils/storage.js` | Persistence abstraction |
| `electron/main.cjs` | SQLite schema + IPC handlers |
| `electron/preload.cjs` | Electron API surface |
| `src/pages/Dashboard.jsx` | Main UI layout + SettingsModal |
| `src/pages/Onboarding.jsx` | Setup wizard (2 steps) |

## Common Tasks

**Add a budget category**: do it in the app (Settings -> Add category). Only edit
`DEFAULT_CATEGORIES` to change what a *brand new* install starts with.

**Add a new IPC method**: Add handler in `electron/main.cjs`, expose in
`electron/preload.cjs`, add fallback in `src/utils/storage.js`, consume in `useBudget.jsx`.

**Update tax year**: Edit brackets and deduction in `taxCalculator.js`.

**Change Dale behavior**: Edit mood derivation in `useBudget.jsx` (`daleMood` logic),
quotes in `constants.js` (`DALE_QUOTES`), animations in `Dale.jsx`.

## Known Gaps / Future Work

- No test framework wired into `npm` yet (logic in `utils/` is pure and easy to
  cover — add Vitest)
- No TypeScript — consider migrating for type safety
- No recurring/fixed expense automation
- No data export (CSV/PDF)
- No multi-month trend charts or analytics
- Electron build only targets macOS currently
- No CI/CD pipeline
