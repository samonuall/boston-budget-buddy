/**
 * Storage abstraction layer
 * Uses Electron IPC when available, falls back to localStorage for browser dev
 */

const isElectron = typeof window !== 'undefined' && window.electronAPI;

// --- Settings ---

export async function getSetting(key) {
  if (isElectron) {
    return window.electronAPI.getSetting(key);
  }
  return localStorage.getItem(`bbb_${key}`);
}

export async function setSetting(key, value) {
  if (isElectron) {
    return window.electronAPI.setSetting(key, value);
  }
  localStorage.setItem(`bbb_${key}`, value);
  return true;
}

export async function getAllSettings() {
  if (isElectron) {
    return window.electronAPI.getAllSettings();
  }
  const settings = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('bbb_')) {
      settings[key.replace('bbb_', '')] = localStorage.getItem(key);
    }
  }
  return settings;
}

// --- Expenses ---

export async function addExpense(expense) {
  if (isElectron) {
    return window.electronAPI.addExpense(expense);
  }
  const expenses = JSON.parse(localStorage.getItem('bbb_expenses') || '[]');
  expenses.push(expense);
  localStorage.setItem('bbb_expenses', JSON.stringify(expenses));
  return true;
}

export async function getExpenses(month, year) {
  if (isElectron) {
    return window.electronAPI.getExpenses(month, year);
  }
  const expenses = JSON.parse(localStorage.getItem('bbb_expenses') || '[]');
  return expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function deleteExpense(id) {
  if (isElectron) {
    return window.electronAPI.deleteExpense(id);
  }
  const expenses = JSON.parse(localStorage.getItem('bbb_expenses') || '[]');
  const filtered = expenses.filter((e) => e.id !== id);
  localStorage.setItem('bbb_expenses', JSON.stringify(filtered));
  return true;
}

export async function updateExpense(expense) {
  if (isElectron) {
    return window.electronAPI.updateExpense(expense);
  }
  const expenses = JSON.parse(localStorage.getItem('bbb_expenses') || '[]');
  const idx = expenses.findIndex((e) => e.id === expense.id);
  if (idx !== -1) {
    expenses[idx] = { ...expenses[idx], ...expense };
    localStorage.setItem('bbb_expenses', JSON.stringify(expenses));
  }
  return true;
}

// --- Initialize defaults for localStorage ---
export function initializeDefaults() {
  if (!isElectron) {
    if (!localStorage.getItem('bbb_gross_salary')) {
      localStorage.setItem('bbb_gross_salary', '75000');
    }
    if (!localStorage.getItem('bbb_bonus')) {
      localStorage.setItem('bbb_bonus', '7000');
    }
    if (!localStorage.getItem('bbb_four01k_percent')) {
      localStorage.setItem('bbb_four01k_percent', '10');
    }
    if (!localStorage.getItem('bbb_onboarding_complete')) {
      localStorage.setItem('bbb_onboarding_complete', 'false');
    }
    if (!localStorage.getItem('bbb_category_budgets')) {
      localStorage.setItem(
        'bbb_category_budgets',
        JSON.stringify({
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
        })
      );
    }
  }
}
