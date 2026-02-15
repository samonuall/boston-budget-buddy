# Boston Budget Buddy

A personal budgeting desktop app for a single user living in Boston, MA. Built with React, Tailwind CSS, and Electron, featuring Dale the Dachshund as your animated budget mascot.

![Boston Budget Buddy](https://img.shields.io/badge/platform-macOS-blue) ![Electron](https://img.shields.io/badge/electron-40-47848f) ![React](https://img.shields.io/badge/react-19-61dafb)

## Features

- **Income & Tax Calculation** — Automatically computes monthly take-home pay using 2024 federal tax brackets, MA 5% flat tax, FICA, and 401(k) contributions
- **11 Budget Categories** — Rent, Food, Gym, Roth IRA, Fun, Social, Utilities, Transportation, Renter's Insurance, Personal Care, Savings
- **Splurge Meter** — Visual breakdown of spending into Needs / Wants / Treats
- **Dale the Dachshund** — Animated SVG mascot that reacts to your budget health (happy, nervous, alarmed, sleeping)
- **Onboarding Flow** — Two-step setup wizard for income and budget allocation
- **Expense Tracking** — Add, edit, and delete expenses with category tagging
- **Per-Category Progress Bars** — Color-coded status (on track, warning, over budget)
- **Month Navigation** — Browse spending history by month/year
- **Offline-First** — SQLite database via Electron, localStorage fallback for browser dev

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 |
| Bundler | Vite 7 |
| Styling | Tailwind CSS v4 |
| Desktop Shell | Electron 40 |
| Database | better-sqlite3 (SQLite) |
| Animations | Framer Motion |
| Icons | Lucide React |
| Font | Nunito (Google Fonts) |

## Project Structure

```
src/
  App.jsx                  # Root — routes between Onboarding and Dashboard
  main.jsx                 # Entry point, wraps app in BudgetProvider
  index.css                # Tailwind theme (cream, sage, dusty-purple, teal, warm-rose)
  pages/
    Dashboard.jsx          # Main budget dashboard + Settings modal
    Onboarding.jsx         # Two-step income & budget setup wizard
  components/
    BudgetOverview.jsx     # Grid of BudgetCards + remaining total
    BudgetCard.jsx         # Per-category progress bar card
    SplurgeMeter.jsx       # Needs/Wants/Treats horizontal bar
    ExpenseForm.jsx        # Quick-add expense form
    ExpenseFeed.jsx        # Scrollable expense list with delete
    MonthSelector.jsx      # Month/year navigation dropdown
    Dale.jsx               # Animated SVG dachshund mascot
  hooks/
    useBudget.jsx          # BudgetProvider context — state, CRUD, calculations
  utils/
    constants.js           # Categories, splurge types, Dale quotes, defaults
    taxCalculator.js       # Federal/MA/FICA tax math, formatCurrency
    storage.js             # Electron IPC ↔ localStorage abstraction
electron/
  main.cjs                 # Electron main process — SQLite init, IPC handlers
  preload.cjs              # contextBridge exposing electronAPI
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install & Run (Browser)

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Uses localStorage for persistence in browser mode.

### Run as Electron App

```bash
npm run electron:dev
```

This starts Vite and Electron concurrently. Data is stored in a SQLite database at Electron's `userData` path.

### Build for macOS

```bash
npm run electron:build
```

Outputs a `.dmg` to the `release/` directory.

## Design

The UI follows a "dreamy zen" aesthetic — soft creams, muted sage greens, dusty purples, and warm roses. All corners are rounded, cards use subtle shadows, and Framer Motion powers smooth transitions throughout.

Dale the Dachshund lives at the bottom of the viewport and changes mood based on your budget health:
- **Happy** — All categories on track
- **Nervous** — One or more categories approaching their limit
- **Alarmed** — Over budget in one or more categories
- **Sleeping** — No expenses logged yet

## Default Budget Assumptions

- Gross salary: $75,000
- Annual bonus: $7,000
- 401(k) contribution: 6%
- Filing status: Single, Boston MA resident
- Tax year: 2024

## License

Private project.
