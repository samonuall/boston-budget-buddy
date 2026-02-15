import { useBudget } from '../hooks/useBudget';
import BudgetCard from './BudgetCard';
import { CATEGORY_KEYS } from '../utils/constants';
import { formatCurrency } from '../utils/taxCalculator';

export default function BudgetOverview({ onCategoryClick, selectedCategory }) {
  const { categoryBudgets, spendingByCategory, getCategoryStatus, remainingTotal } = useBudget();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
        {CATEGORY_KEYS.map((key) => (
          <BudgetCard
            key={key}
            category={key}
            budget={categoryBudgets[key] || 0}
            spent={spendingByCategory[key] || 0}
            status={getCategoryStatus(key)}
            onClick={onCategoryClick}
            isActive={selectedCategory === key}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-sage-dark to-teal text-white p-10 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center text-center border-4 border-sage-light/30">
        <h2 className="text-5xl font-extrabold mb-3 drop-shadow-lg">{formatCurrency(remainingTotal)}</h2>
        <p className="text-base opacity-90 uppercase tracking-widest font-bold">Left to spend this month</p>
      </div>
    </div>
  );
}
