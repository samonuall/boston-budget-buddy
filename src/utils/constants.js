export const CATEGORIES = {
  rent: { label: 'Rent', emoji: '🏠', type: 'needs', fixed: true },
  food: { label: 'Food', emoji: '🍕', type: 'needs' },
  gym: { label: 'Gym', emoji: '💪', type: 'wants' },
  roth_ira: { label: 'Roth IRA', emoji: '📈', type: 'savings' },
  fun: { label: 'Fun', emoji: '🎮', type: 'wants' },
  social: { label: 'Social', emoji: '🎉', type: 'wants' },
  utilities: { label: 'Utilities', emoji: '💡', type: 'needs' },
  transportation: { label: 'Transportation', emoji: '🚇', type: 'needs' },
  renters_insurance: { label: "Renter's Insurance", emoji: '🛡️', type: 'needs' },
  personal_care: { label: 'Personal Care', emoji: '✨', type: 'needs' },
  savings: { label: 'Savings', emoji: '🐖', type: 'savings' },
};

export const CATEGORY_KEYS = Object.keys(CATEGORIES);

export const SPLURGE_TYPES = {
  needs: { label: 'Needs', color: '#8fb8a0' },
  wants: { label: 'Wants', color: '#b8a0c8' },
  treats: { label: 'Treats', color: '#d4a0a0' },
  savings: { label: 'Savings', color: '#a0b8d4' },
};

export const NEEDS_CATEGORIES = CATEGORY_KEYS.filter(k => CATEGORIES[k].type === 'needs');
export const WANTS_CATEGORIES = CATEGORY_KEYS.filter(k => CATEGORIES[k].type === 'wants');
export const SAVINGS_CATEGORIES = CATEGORY_KEYS.filter(k => CATEGORIES[k].type === 'savings');

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

export const DALE_QUOTES = {
  happy: [
    "You're doing great! 🐾",
    "Saving is fetching! 🦴",
    "Good human! Keep it up!",
    "Woof! That's some smart spending!",
    "Tail wags for budget wins!",
  ],
  nervous: [
    "Maybe think twice about that one...",
    "Ruff... that category is getting tight!",
    "I'm getting a little nervous over here...",
    "Social spending is getting close to the limit. Maybe a cozy night in?",
    "Careful there, friend...",
  ],
  alarmed: [
    "Don't worry, tomorrow is a new day!",
    "We can adjust the plan together!",
    "Uh oh... let's figure this out!",
    "Over budget, but it's okay — we've got this!",
    "*hides behind couch*",
  ],
  sleeping: [
    "Zzz... budget looks good... zzz...",
    "*dreaming of treats*",
    "Zzz... 💤",
  ],
  greeting: [
    "Welcome back! Let's check your budget!",
    "Hey there! Ready to be money-smart?",
    "Woof! Glad to see you!",
  ],
};
