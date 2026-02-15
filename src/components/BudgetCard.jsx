import { motion } from 'framer-motion';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/taxCalculator';

export default function BudgetCard({ category, budget, spent, status }) {
  const catInfo = CATEGORIES[category];
  const percentage = Math.min(100, Math.max(0, (spent / budget) * 100));
  
  // Determine color based on status
  let barColor = 'bg-sage';
  if (status === 'warning') barColor = 'bg-warning';
  if (status === 'over') barColor = 'bg-danger';

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-cream-dark flex flex-col gap-2">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">{catInfo?.emoji}</span>
          <h4 className="font-bold text-text capitalize">{catInfo?.label}</h4>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status === 'over' ? 'bg-red-100 text-danger' : 'bg-cream text-text-light'}`}>
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-3 w-full bg-cream-dark/30 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${barColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-end mt-1">
        <span className="text-xs font-semibold text-text-lighter">
          {formatCurrency(spent)} <span className="font-normal">/ {formatCurrency(budget)}</span>
        </span>
        <span className="text-[10px] uppercase tracking-wider text-text-lighter font-medium">Spent</span>
      </div>
    </div>
  );
}
