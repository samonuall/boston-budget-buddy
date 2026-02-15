# Implementation Guide: Boston Budget Buddy

## Overview

Boston Budget Buddy is a personal budgeting application built with React 19, Vite 7, Tailwind CSS v4, and Electron 40. It features a charming dachshund mascot named Dale who provides budget feedback.

This guide explains how to build and distribute the application as a Mac Electron app.

---

## Prerequisites

Before building the application, ensure you have:

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **macOS** (for building Mac applications)
- **Xcode Command Line Tools** (for native module compilation)

To install Xcode Command Line Tools:
```bash
xcode-select --install
```

---

## Installation & Setup

### 1. Clone or Download the Repository

```bash
git clone <repository-url>
cd kat_budget_planner
```

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all Node.js dependencies
- Run `postinstall` script to rebuild `better-sqlite3` for Electron

**Note:** The `better-sqlite3` package requires native compilation. If you encounter errors, ensure you have the Xcode Command Line Tools installed.

---

## Development

### Browser Development (Faster)

Run the app in a browser with hot-reload:

```bash
npm run dev
```

- Opens at `http://localhost:5173`
- Uses `localStorage` for data persistence
- Faster iteration for UI development

### Electron Development

Run the full Electron app in development mode:

```bash
npm run electron:dev
```

- Starts Vite dev server + Electron concurrently
- Uses SQLite database for data persistence
- Full desktop app experience

---

## Building the Mac Application

### Build for Distribution

To create a distributable Mac application:

```bash
npm run electron:build
```

This command:
1. Runs `vite build` to compile the React app
2. Runs `electron-builder` to package the Electron app
3. Creates a `.dmg` installer in the `release/` directory

### Build Output

After building, you'll find:

```
release/
├── Boston Budget Buddy-1.0.0.dmg        # Installer (distributable)
├── Boston Budget Buddy-1.0.0-mac.zip    # Zipped app bundle
└── mac/
    └── Boston Budget Buddy.app          # Application bundle
```

---

## Installing the Application

### Option 1: Use the DMG Installer (Recommended)

1. Locate `release/Boston Budget Buddy-1.0.0.dmg`
2. Double-click the DMG file
3. Drag "Boston Budget Buddy" to your Applications folder
4. Eject the DMG
5. Open the app from Applications

### Option 2: Use the .app Bundle Directly

1. Navigate to `release/mac/`
2. Copy `Boston Budget Buddy.app` to your Applications folder
3. Open the app from Applications

### First Launch: Security Note

macOS may show a security warning on first launch because the app is not signed:

1. **If you see "cannot be opened because it is from an unidentified developer":**
   - Open **System Settings** → **Privacy & Security**
   - Scroll down and click **Open Anyway** next to the app name
   - Confirm by clicking **Open**

2. **Alternative method:**
   - Right-click the app in Finder
   - Select **Open** from the context menu
   - Click **Open** in the dialog

---

## Features Implemented

### Core Functionality
- ✅ Monthly budget tracking with 11 categories
- ✅ Tax calculation (Federal + MA state + FICA)
- ✅ 401(k) contribution support
- ✅ Real-time spending visualization
- ✅ Dale the Dachshund mood indicator

### Recent Updates (Feb 2026)
- ✅ **Category Budget Editor**: Edit individual category budgets in Settings modal
  - Grouped by type (Needs/Wants/Savings)
  - Real-time allocation summary
  - Over-budget warnings

- ✅ **Expense Filtering**: Click any BudgetCard to filter expenses by category
  - Visual feedback with teal border/ring
  - Category-specific expense feed
  - Clear filter button

### Data Storage

**Browser Mode:**
- Uses `localStorage` with `bbb_` prefix
- Expenses stored as JSON array
- Settings stored as individual keys

**Electron Mode:**
- SQLite database (`budget.db` in app data directory)
- Location: `~/Library/Application Support/Boston Budget Buddy/budget.db`
- Tables: `user_settings`, `expenses`

---

## Customization

### App Icon

To customize the application icon:

1. Replace `public/icon.png` with your custom icon (1024x1024 recommended)
2. Rebuild the app: `npm run electron:build`

### App Metadata

Edit `package.json` to change:
- `name`: Package name
- `version`: Application version
- `description`: App description
- `build.appId`: Mac bundle identifier
- `build.productName`: Display name

---

## Distribution

### For Personal Use
- Use the `.dmg` file or `.app` bundle directly
- Share with trusted users via direct download

### For Public Distribution
To distribute publicly, you'll need:

1. **Apple Developer Account** ($99/year)
2. **Code Signing Certificate**
3. **Notarization** (required for macOS 10.15+)

Update `package.json` build config:
```json
"mac": {
  "target": "dmg",
  "icon": "public/icon.png",
  "identity": "Developer ID Application: Your Name (TEAM_ID)",
  "hardenedRuntime": true,
  "gatekeeperAssess": false,
  "entitlements": "build/entitlements.mac.plist",
  "entitlementsInherit": "build/entitlements.mac.plist"
}
```

---

## Troubleshooting

### Build Errors

**"better-sqlite3" compilation fails:**
```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
```

**Electron-builder fails:**
```bash
# Ensure you have the latest electron-builder
npm install electron-builder@latest --save-dev
npm run electron:build
```

### Runtime Errors

**Database errors in Electron:**
- Check that `better-sqlite3` was rebuilt correctly: `npm run postinstall`
- Ensure the app has write permissions to `~/Library/Application Support/`

**UI doesn't load:**
- Verify `dist/` folder was created: `ls dist/`
- Check Electron developer console (View → Toggle Developer Tools)

---

## Tech Stack Summary

| Component | Technology | Version |
|-----------|-----------|---------|
| UI Framework | React | 19.2.0 |
| Build Tool | Vite | 7.3.1 |
| Styling | Tailwind CSS | 4.1.18 |
| Desktop | Electron | 40.4.1 |
| Database | SQLite (better-sqlite3) | 12.6.2 |
| Animations | Framer Motion | 12.34.0 |
| Packaging | electron-builder | 26.7.0 |

---

## Project Structure

```
kat_budget_planner/
├── electron/
│   ├── main.cjs           # Electron main process
│   └── preload.cjs        # Context bridge
├── src/
│   ├── components/        # React components
│   ├── hooks/            # useBudget context
│   ├── pages/            # Dashboard & Onboarding
│   └── utils/            # Tax calc, constants, storage
├── public/               # Static assets
├── dist/                 # Vite build output
└── release/              # electron-builder output
```

---

## Support & Contributing

For issues or feature requests, see the project repository.

Built with ❤️ and a little help from Dale 🐕
