import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAllSettings, setSetting, getExpenses, addExpense, deleteExpense, updateExpense, initializeDefaults } from '../utils/storage';
import { calculateTakeHome } from '../utils/taxCalculator';
import { DEFAULT_BUDGETS, CATEGORIES, NEEDS_CATEGORIES, WANTS_CATEGORIES } from '../utils/constants';
import { v4 as uuidv4 } from 'uuid';

const BudgetContext = createContext(null);

export function BudgetProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [grossSalary, setGrossSalary] = useState(75000);
  const [bonus, setBonus] = useState(7000);
  const [four01kPercent, setFour01kPercent] = useState(10);
  const [categoryBudgets, setCategoryBudgets] = useState(DEFAULT_BUDGETS);
  const [expenses, setExpenses] = useState([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
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
      if (settings.category_budgets) {
        try {
          setCategoryBudgets(JSON.parse(settings.category_budgets));
        } catch {}
      }
      setLoading(false);
    }
    load();
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

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await setSetting('onboarding_complete', 'true');
  }, []);

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
    return expense;
  }, []);

  const removeExpense = useCallback(async (id) => {
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const editExpense = useCallback(async (expense) => {
    await updateExpense(expense);
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? { ...e, ...expense } : e)));
  }, []);

  // Computed values
  const spendingByCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});

  const totalBudget = Object.values(categoryBudgets).reduce((sum, v) => sum + v, 0);
  const totalSpent = Object.values(spendingByCategory).reduce((sum, v) => sum + v, 0);
  const remainingTotal = takeHome.monthlyTakeHome - totalSpent;

  // Splurge meter calculations
  const needsSpent = NEEDS_CATEGORIES.reduce((sum, k) => sum + (spendingByCategory[k] || 0), 0);
  const wantsSpent = WANTS_CATEGORIES.reduce((sum, k) => sum + (spendingByCategory[k] || 0), 0);
  const treatsSpent = Math.max(0, wantsSpent * 0.3); // treats = ~30% of wants spending
  const adjustedWants = wantsSpent - treatsSpent;

  // Dale's mood
  const getCategoryStatus = (category) => {
    const budget = categoryBudgets[category] || 0;
    const spent = spendingByCategory[category] || 0;
    if (budget === 0) return 'neutral';
    const pct = spent / budget;
    if (pct >= 1) return 'over';
    if (pct >= 0.8) return 'warning';
    return 'good';
  };

  const overBudgetCategories = Object.keys(categoryBudgets).filter(
    (k) => getCategoryStatus(k) === 'over'
  );
  const warningCategories = Object.keys(categoryBudgets).filter(
    (k) => getCategoryStatus(k) === 'warning'
  );

  let daleMood = 'happy';
  if (overBudgetCategories.length > 0) daleMood = 'alarmed';
  else if (warningCategories.length > 0) daleMood = 'nervous';

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
    needsSpent,
    wantsSpent: adjustedWants,
    treatsSpent,
    daleMood,
    overBudgetCategories,
    warningCategories,
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
