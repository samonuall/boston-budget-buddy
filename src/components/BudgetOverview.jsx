import { useBudget } from '../hooks/useBudget';
import BudgetCard from './BudgetCard';
import DaleZone from './DaleZone';
import { formatCurrency } from '../utils/taxCalculator';

export default function BudgetOverview({ onCategoryClick, selectedCategory }) {
  const { categories, categoryBudgets, spendingByCategory, getCategoryStatus, remainingTotal } = useBudget();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <BudgetCard
            key={cat.key}
            catInfo={cat}
            category={cat.key}
            budget={categoryBudgets[cat.key] || 0}
            spent={spendingByCategory[cat.key] || 0}
            status={getCategoryStatus(cat.key)}
            onClick={onCategoryClick}
            isActive={selectedCategory === cat.key}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-sage-dark to-teal text-white p-10 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center text-center border-4 border-sage-light/30">
        <h2 className="text-5xl font-extrabold mb-3 drop-shadow-lg tabular-nums">{formatCurrency(remainingTotal)}</h2>
        <p className="text-base opacity-90 uppercase tracking-widest font-bold">Left to spend this month</p>
      </div>

      {/* Dale lives here now, in the page flow, rather than floating over it. */}
      <DaleZone />
    </div>
  );
}
