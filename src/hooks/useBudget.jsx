import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getAllSettings, setSetting, getExpenses, addExpense, deleteExpense, updateExpense, countExpensesByCategory, initializeDefaults } from '../utils/storage';
import { calculateTakeHome } from '../utils/taxCalculator';
import { DEFAULT_BUDGETS, CATEGORY_TYPE_KEYS } from '../utils/constants';
import {
  CATEGORIES_SETTING_KEY,
  parseCategories,
  buildInitialCategories,
  normalizeCategories,
  indexCategories,
  fallbackCategory,
  slugifyKey,
  deriveCategoryStatus,
} from '../utils/categories';
import { v4 as uuidv4 } from 'uuid';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [grossSalary, setGrossSalary] = useState(75000);
  const [bonus, setBonus] = useState(7000);
  const [four01kPercent, setFour01kPercent] = useState(10);
  const [categoryBudgets, setCategoryBudgets] = useState(DEFAULT_BUDGETS);
  const [allCategories, setAllCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [expenseCounts, setExpenseCounts] = useState({});
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [daleHat, setDaleHat] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const takeHome = calculateTakeHome(grossSalary, bonus, four01kPercent);

  // Load settings on mount
  useEffect(() => {
    async function load() {
      initializeDefaults();
      const settings = await getAllSettings();

      if (settings.gross_salary) setGrossSalary(Number(settings.gross_salary));
      if (settings.bonus) setBonus(Number(settings.bonus));
      if (settings.four01k_percent) setFour01kPercent(Number(settings.four01k_percent));
      if (settings.onboarding_complete) setOnboardingComplete(settings.onboarding_complete === 'true');
      if (settings.dale_hat) setDaleHat(settings.dale_hat === 'none' ? null : settings.dale_hat);

      let budgets = DEFAULT_BUDGETS;
      if (settings.category_budgets) {
        try {
          budgets = JSON.parse(settings.category_budgets);
        } catch {
          // Corrupt JSON — fall back to defaults rather than wiping the setting.
        }
      }
      setCategoryBudgets(budgets);

      // v1 -> v2 migration: seed editable categories from the hardcoded defaults
      // plus whatever the user already had budgets for. Written once, then owned
      // by the user. Existing expenses are never touched.
      let cats = parseCategories(settings[CATEGORIES_SETTING_KEY]);
      if (cats.length === 0) {
        cats = buildInitialCategories(budgets);
        await setSetting(CATEGORIES_SETTING_KEY, JSON.stringify(cats));
      }
      setAllCategories(cats);
      setExpenseCounts(await countExpensesByCategory());

      setLoading(false);
    }
    load();
  }, []);

  /** All-time expense counts per category — recomputed after any expense change. */
  const refreshExpenseCounts = useCallback(async () => {
    setExpenseCounts(await countExpensesByCategory());
  }, []);

  // Load expenses when month/year changes
  useEffect(() => {
    async function loadExpenses() {
      const data = await getExpenses(selectedMonth, selectedYear);
      setExpenses(data);
    }
    if (!loading) loadExpenses();
  }, [selectedMonth, selectedYear, loading]);

  // Save settings helpers
  const updateGrossSalary = useCallback(async (val) => {
    setGrossSalary(val);
    await setSetting('gross_salary', String(val));
  }, []);

  const updateBonus = useCallback(async (val) => {
    setBonus(val);
    await setSetting('bonus', String(val));
  }, []);

  const update401kPercent = useCallback(async (val) => {
    setFour01kPercent(val);
    await setSetting('four01k_percent', String(val));
  }, []);

  const updateCategoryBudgets = useCallback(async (budgets) => {
    setCategoryBudgets(budgets);
    await setSetting('category_budgets', JSON.stringify(budgets));
  }, []);

  /** Clicking the hat Dale already wears takes it off again. */
  const updateDaleHat = useCallback(async (hatId) => {
    setDaleHat((prev) => {
      const next = prev === hatId ? null : hatId;
      setSetting('dale_hat', next || 'none');
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await setSetting('onboarding_complete', 'true');
  }, []);

  // --- Category CRUD -------------------------------------------------------

  const persistCategories = useCallback(async (next) => {
    const normalized = normalizeCategories(next);
    setAllCategories(normalized);
    await setSetting(CATEGORIES_SETTING_KEY, JSON.stringify(normalized));
    return normalized;
  }, []);

  /**
   * Create a category. The key is derived from the label and must not collide
   * with any existing key — including archived ones, which still own expenses.
   */
  const createCategory = useCallback(
    async ({ label, emoji, type = 'wants', budget = 0 } = {}) => {
      const takenKeys = allCategories.map((c) => c.key);
      const key = slugifyKey(label, takenKeys);

      const category = {
        key,
        label: (label || '').trim() || key,
        emoji: emoji || '🐾',
        type: CATEGORY_TYPE_KEYS.includes(type) ? type : 'wants',
        archived: false,
        order: allCategories.length,
      };

      await persistCategories([...allCategories, category]);

      const amount = Number(budget) || 0;
      await updateCategoryBudgets({ ...categoryBudgets, [key]: amount });

      return category;
    },
    [allCategories, categoryBudgets, persistCategories, updateCategoryBudgets]
  );

  /** Replace the whole list in one write — used by the settings editor on Save. */
  const saveCategories = useCallback((list) => persistCategories(list), [persistCategories]);

  /** Edit label / emoji / type. The key is immutable so expenses stay attached. */
  const updateCategory = useCallback(
    async (key, patch = {}) => {
      const { key: _ignored, ...safe } = patch;
      return persistCategories(
        allCategories.map((cat) => (cat.key === key ? { ...cat, ...safe } : cat))
      );
    },
    [allCategories, persistCategories]
  );

  /**
   * Archive a category: it disappears from the dashboard, the expense form and
   * the budget totals, but its record survives so historical expenses keep their
   * label and emoji. Nothing in the expenses table is modified.
   */
  const deleteCategory = useCallback(
    (key) => updateCategory(key, { archived: true }),
    [updateCategory]
  );

  const restoreCategory = useCallback(
    (key) => updateCategory(key, { archived: false }),
    [updateCategory]
  );

  /**
   * Permanently drop the definition and its budget line. Expense rows are still
   * not deleted — they render via fallbackCategory() as "❓". Only offer this for
   * categories with no history.
   */
  const purgeCategory = useCallback(
    async (key) => {
      await persistCategories(allCategories.filter((cat) => cat.key !== key));
      const { [key]: _removed, ...rest } = categoryBudgets;
      await updateCategoryBudgets(rest);
    },
    [allCategories, categoryBudgets, persistCategories, updateCategoryBudgets]
  );

  // --- Expenses ------------------------------------------------------------

  const logExpense = useCallback(async (amount, category, note, date) => {
    const expense = {
      id: uuidv4(),
      amount: Number(amount),
      category,
      note: note || null,
      date: date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    await addExpense(expense);
    setExpenses((prev) => [expense, ...prev]);
    await refreshExpenseCounts();
    return expense;
  }, [refreshExpenseCounts]);

  const removeExpense = useCallback(async (id) => {
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await refreshExpenseCounts();
  }, [refreshExpenseCounts]);

  const editExpense = useCallback(async (expense) => {
    await updateExpense(expense);
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, ...expense } : e)));
    await refreshExpenseCounts();
  }, [refreshExpenseCounts]);

  // --- Derived category views ----------------------------------------------

  const categories = useMemo(() => allCategories.filter((c) => !c.archived), [allCategories]);
  const archivedCategories = useMemo(() => allCategories.filter((c) => c.archived), [allCategories]);
  const categoryKeys = useMemo(() => categories.map((c) => c.key), [categories]);
  const categoryMap = useMemo(() => indexCategories(allCategories), [allCategories]);

  /** Always returns a renderable record, even for an unknown key. */
  const getCategory = useCallback(
    (key) => categoryMap[key] || fallbackCategory(key),
    [categoryMap]
  );

  const categoriesByType = useMemo(
    () =>
      Object.fromEntries(
        CATEGORY_TYPE_KEYS.map((type) => [type, categories.filter((c) => c.type === type)])
      ),
    [categories]
  );

  // --- Computed spending ---------------------------------------------------

  const spendingByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const totalBudget = categoryKeys.reduce((sum, k) => sum + (categoryBudgets[k] || 0), 0);
  const totalSpent = Object.values(spendingByCategory).reduce((sum, v) => sum + v, 0);
  const remainingTotal = takeHome.monthlyTakeHome - totalSpent;

  const getCategoryStatus = useCallback(
    (key) => deriveCategoryStatus(spendingByCategory[key] || 0, categoryBudgets[key] || 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [expenses, categoryBudgets]
  );

  // Hitting the budget exactly counts as a win — 'met' is deliberately not 'over'.
  const overBudgetCategories = categoryKeys.filter((k) => getCategoryStatus(k) === 'over');
  const warningCategories = categoryKeys.filter((k) => getCategoryStatus(k) === 'warning');

  // Dale's mood drives his expression only — every quote pool is kind.
  const daleMood = expenses.length === 0 ? 'sleeping' : 'happy';

  const value = {
    loading,
    grossSalary,
    bonus,
    four01kPercent,
    categoryBudgets,
    expenses,
    onboardingComplete,
    selectedMonth,
    selectedYear,
    takeHome,
    spendingByCategory,
    totalBudget,
    totalSpent,
    remainingTotal,
    daleMood,
    daleHat,
    updateDaleHat,
    overBudgetCategories,
    warningCategories,
    // categories
    categories,
    allCategories,
    archivedCategories,
    categoryKeys,
    categoryMap,
    categoriesByType,
    expenseCounts,
    getCategory,
    saveCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    purgeCategory,
    // setters
    setSelectedMonth,
    setSelectedYear,
    updateGrossSalary,
    updateBonus,
    update401kPercent,
    updateCategoryBudgets,
    completeOnboarding,
    logExpense,
    removeExpense,
    editExpense,
    getCategoryStatus,
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudget must be used within a BudgetProvider');
  return ctx;
}
