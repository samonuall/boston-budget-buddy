/**
 * Category data layer.
 *
 * In v1 categories were a hardcoded constant. In v2 they are user-editable data
 * persisted under the `categories` setting as a JSON array of:
 *
 *   { key, label, emoji, type, order, archived }
 *
 * `key` is a stable id referenced by every row in the `expenses` table, so it is
 * never rewritten once created. Renaming a category changes `label`, not `key`.
 */

import { DEFAULT_CATEGORIES, CATEGORY_TYPE_KEYS } from './constants';

export const CATEGORIES_SETTING_KEY = 'categories';

const FALLBACK_EMOJI = '🐾';
const DEFAULT_TYPE = 'wants';

/** Turn a snake_case key into a readable label: renters_insurance -> Renters Insurance */
function titleize(key) {
  return String(key)
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build a URL-safe, stable key from a user-typed label, avoiding collisions with
 * keys already in use (including archived ones — reusing an archived key would
 * silently adopt that category's old expenses).
 */
export function slugifyKey(label, takenKeys = []) {
  const base =
    String(label || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'category';

  const taken = new Set(takenKeys);
  if (!taken.has(base)) return base;

  let n = 2;
  while (taken.has(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

/**
 * Coerce an arbitrary array into well-formed category records: drop anything
 * without a usable key, drop duplicates, fill missing fields, and renumber
 * `order` sequentially so it is always 0..n-1.
 */
export function normalizeCategories(list) {
  const seen = new Set();
  const out = [];

  (Array.isArray(list) ? list : []).forEach((raw, i) => {
    if (!raw || typeof raw !== 'object') return;

    const key = typeof raw.key === 'string' ? raw.key.trim() : '';
    if (!key || seen.has(key)) return;
    seen.add(key);

    const label = typeof raw.label === 'string' && raw.label.trim() ? raw.label.trim() : titleize(key);
    const emoji = typeof raw.emoji === 'string' && raw.emoji.trim() ? raw.emoji.trim() : FALLBACK_EMOJI;

    out.push({
      key,
      label,
      emoji,
      type: CATEGORY_TYPE_KEYS.includes(raw.type) ? raw.type : DEFAULT_TYPE,
      archived: raw.archived === true,
      order: Number.isFinite(raw.order) ? raw.order : i,
    });
  });

  return out
    .sort((a, b) => a.order - b.order)
    .map((cat, i) => ({ ...cat, order: i }));
}

/** Parse the persisted `categories` setting. Returns [] on anything malformed. */
export function parseCategories(json) {
  if (!json) return [];
  try {
    return normalizeCategories(JSON.parse(json));
  } catch {
    return [];
  }
}

/**
 * One-time migration for existing installs.
 *
 * Runs only when no `categories` setting exists yet. It seeds from
 * DEFAULT_CATEGORIES and then backfills a definition for any key found in the
 * user's saved `category_budgets` that isn't already covered — so a v1 database
 * upgrades without losing a single category or expense. Nothing is deleted.
 */
export function buildInitialCategories(savedBudgets = {}) {
  const seeded = normalizeCategories(DEFAULT_CATEGORIES);
  const known = new Set(seeded.map((c) => c.key));

  const backfilled = Object.keys(savedBudgets || {})
    .filter((key) => key && !known.has(key))
    .map((key, i) => ({
      key,
      label: titleize(key),
      emoji: FALLBACK_EMOJI,
      type: DEFAULT_TYPE,
      archived: false,
      order: seeded.length + i,
    }));

  return normalizeCategories([...seeded, ...backfilled]);
}

/** key -> category record */
export function indexCategories(list) {
  return Object.fromEntries(list.map((cat) => [cat.key, cat]));
}

/**
 * A category record for a key that has no definition — e.g. an old expense whose
 * category was hard-deleted. Renders instead of crashing on `undefined.emoji`.
 */
export function fallbackCategory(key) {
  return {
    key,
    label: titleize(key) || 'Uncategorized',
    emoji: '❓',
    type: DEFAULT_TYPE,
    archived: true,
    order: Number.MAX_SAFE_INTEGER,
    missing: true,
  };
}

// --- Settings-editor helpers ----------------------------------------------

/**
 * Identify a row in the category editor. Rows the user just added have no real
 * key yet — that is deliberately deferred until Save so the key can be derived
 * from the final label instead of whatever was typed first.
 */
export const rowId = (cat) => cat.key || cat._tmpId;

let draftCounter = 0;

export function makeDraftCategory() {
  draftCounter += 1;
  return {
    _tmpId: `draft_${draftCounter}`,
    isNew: true,
    label: '',
    emoji: FALLBACK_EMOJI,
    type: DEFAULT_TYPE,
    archived: false,
  };
}

// --- Budget status ---------------------------------------------------------

/** Spending is "getting close" once it crosses this fraction of the budget. */
export const BUDGET_WARNING_THRESHOLD = 0.8;

/** Half a cent — absorbs float drift so 449.99999 still reads as exactly 450. */
const MONEY_EPSILON = 0.005;

/**
 * Classify a category's spending against its budget.
 *
 *   neutral — no budget set, nothing to measure against
 *   over    — spent MORE than the budget (the only red state)
 *   met     — landed exactly on budget. This is a win, not a failure: it shows
 *             green and is deliberately excluded from the over-budget count.
 *   warning — close to the limit but still under
 *   good    — comfortably under
 */
export function deriveCategoryStatus(spent, budget) {
  const b = Number(budget) || 0;
  const s = Number(spent) || 0;

  if (b <= 0) return 'neutral';
  if (s > b + MONEY_EPSILON) return 'over';
  if (s >= b - MONEY_EPSILON) return 'met';
  if (s / b >= BUDGET_WARNING_THRESHOLD) return 'warning';
  return 'good';
}
