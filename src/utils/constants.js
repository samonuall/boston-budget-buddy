// Category "type" is now only a grouping label for the settings/onboarding UI.
// (The Needs/Wants/Treats splurge meter was removed in v2.)
export const CATEGORY_TYPES = {
  needs: { label: 'Needs', color: '#8fb8a0' },
  wants: { label: 'Wants', color: '#b8a0c8' },
  savings: { label: 'Savings', color: '#a0b8d4' },
};

export const CATEGORY_TYPE_KEYS = ['needs', 'wants', 'savings'];

/**
 * Seed data only. Categories are persisted in the `categories` setting and are
 * editable at runtime — see src/utils/categories.js. This list is used the very
 * first time the app runs, and to backfill definitions for any category key that
 * exists in a saved budget but has no saved definition.
 */
export const DEFAULT_CATEGORIES = [
  { key: 'rent', label: 'Rent', emoji: '🏠', type: 'needs' },
  { key: 'food', label: 'Food', emoji: '🍕', type: 'needs' },
  { key: 'gym', label: 'Gym', emoji: '💪', type: 'wants' },
  { key: 'roth_ira', label: 'Roth IRA', emoji: '📈', type: 'savings' },
  { key: 'fun', label: 'Fun', emoji: '🎮', type: 'wants' },
  { key: 'social', label: 'Social', emoji: '🎉', type: 'wants' },
  { key: 'utilities', label: 'Utilities', emoji: '💡', type: 'needs' },
  { key: 'transportation', label: 'Transportation', emoji: '🚇', type: 'needs' },
  { key: 'renters_insurance', label: "Renter's Insurance", emoji: '🛡️', type: 'needs' },
  { key: 'personal_care', label: 'Personal Care', emoji: '✨', type: 'needs' },
  { key: 'savings', label: 'Savings', emoji: '🐖', type: 'savings' },
];

export const DEFAULT_BUDGETS = {
  rent: 3000,
  food: 450,
  gym: 50,
  roth_ira: 583,
  fun: 120,
  social: 150,
  utilities: 200,
  transportation: 90,
  renters_insurance: 30,
  personal_care: 60,
  savings: 500,
};

/**
 * Hats Dale can wear, anchored to his head.
 *
 * dale.png is a square image with his head centred at ~35% across and the top
 * of his skull at ~15% down. HAT_ANCHOR places a hat there; each hat then nudges
 * itself because emoji glyphs sit differently inside their own em box.
 * All values are percentages of Dale's rendered width/height.
 */
export const HAT_ANCHOR = { left: 35, top: 8, size: 30 };

export const DALE_HATS = [
  { id: 'top_hat', label: 'Top hat', emoji: '🎩', dx: 0, dy: -2, scale: 1.0, rotate: -10 },
  { id: 'cap', label: 'Ball cap', emoji: '🧢', dx: -1, dy: 2, scale: 1.05, rotate: -8 },
  { id: 'crown', label: 'Crown', emoji: '👑', dx: 0, dy: 3, scale: 0.9, rotate: -6 },
  { id: 'grad', label: 'Graduate', emoji: '🎓', dx: 0, dy: 1, scale: 1.05, rotate: -8 },
  { id: 'sun_hat', label: 'Sun hat', emoji: '👒', dx: 0, dy: 1, scale: 1.05, rotate: -8 },
  { id: 'helmet', label: 'Hard hat', emoji: '⛑️', dx: 0, dy: 2, scale: 1.0, rotate: -8 },
  { id: 'bow', label: 'Bow', emoji: '🎀', dx: 6, dy: 6, scale: 0.7, rotate: 8 },
  { id: 'army', label: 'Helmet', emoji: '🪖', dx: 0, dy: 2, scale: 1.0, rotate: -8 },
];

/** Said when you drag Dale a treat. He is very enthusiastic about treats. */
export const DALE_TREAT_QUOTES = [
  'Nom nom nom! 🦴',
  'Best human ever!',
  '*happy tail thumping*',
  'Mmmm. Worth every penny.',
  'You remembered! 🐾',
  '*crunch* ...more?',
];

/**
 * Dale is a good dog. He only ever says nice things — no scolding, no guilt,
 * no matter what the numbers look like. Keep it that way when adding quotes.
 *
 * One flat pool, picked from at random on every click. Keep quotes
 * time-agnostic: a random pick can land at any hour, so nothing here should
 * assume it is morning or night.
 */
export const DALE_QUOTES = [
  "You're doing great! 🐾",
  'Saving is fetching! 🦴',
  'Good human! Keep it up!',
  'Woof! Every expense you log is a win.',
  'Tail wags for you today!',
  'Tracking it is the hard part, and you did it!',
  "However this month goes, I'm proud of you.",
  "Money comes and goes. You're still the best human.",
  'Tomorrow is always a fresh bowl!',
  "We'll figure it out together — we always do.",
  "Coffee first, budgeting second. I don't judge. ☕",
  "You showed up. That's the whole trick.",
  "Stretch, snack, spend wisely. That's my routine.",
  'Clean slate whenever you want one.',
  '*happy tail thumping*',
  "You're doing better than you think.",
  'Every little bit you set aside counts. 🦴',
  'Budgets are just plans, and plans can change.',
  "I'd share my treats with you. That's how much I like you.",
  'Look at you, being all responsible!',
  "No notes. You're a great human.",
  '*flops over for belly rubs*',
];
