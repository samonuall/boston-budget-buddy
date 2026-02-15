import { useBudget } from '../hooks/useBudget';
import BudgetCard from './BudgetCard';
import { CATEGORY_KEYS } from '../utils/constants';
import { formatCurrency } from '../utils/taxCalculator';

export default function BudgetOverview() {
  const { categoryBudgets, spendingByCategory, getCategoryStatus, remainingTotal } = useBudget();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORY_KEYS.map((key) => (
          <BudgetCard 
            key={key}
            category={key}
            budget={categoryBudgets[key] || 0}
            spent={spendingByCategory[key] || 0}
            status={getCategoryStatus(key)}
          />
        ))}
      </div>

      <div className="bg-[#3d3d3d] text-cream p-6 rounded-2xl shadow-lg mt-8 flex flex-col items-center justify-center text-center">
        <h2 className="text-3xl font-bold mb-2">{formatCurrency(remainingTotal)}</h2>
        <p className="text-sm opacity-80 uppercase tracking-wide font-medium">Left to spend this month</p>
      </div>
    </div>
  );
}
