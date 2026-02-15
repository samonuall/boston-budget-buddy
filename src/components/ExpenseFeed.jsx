import { useBudget } from '../hooks/useBudget';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/taxCalculator';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpenseFeed({ categoryFilter, onClearFilter }) {
  const { expenses, removeExpense } = useBudget();

  // Filter expenses if a category is selected
  const filteredExpenses = categoryFilter
    ? expenses.filter((e) => e.category === categoryFilter)
    : expenses;

  // Get category info for header
  const categoryInfo = categoryFilter ? CATEGORIES[categoryFilter] : null;

  return (
    <div className="space-y-4 bg-white p-7 rounded-[1.5rem] shadow-lg border-2 border-teal-light/40">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-extrabold text-text">
          {categoryFilter ? (
            <span className="flex items-center gap-2">
              <span>{categoryInfo?.emoji}</span>
              <span>{categoryInfo?.label} Expenses</span>
            </span>
          ) : (
            'Recent Expenses'
          )}
        </h3>
        {categoryFilter && (
          <button
            onClick={onClearFilter}
            className="text-sm font-bold text-sage-dark hover:bg-sage-light/20 px-3 py-1.5 rounded-lg transition-all duration-300"
          >
            Clear Filter
          </button>
        )}
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {filteredExpenses.length === 0 ? (
            <p className="text-text-lighter text-center py-8 italic text-sm">
              {categoryFilter
                ? `No ${categoryInfo?.label.toLowerCase()} expenses yet this month.`
                : 'No expenses yet this month.'}
            </p>
          ) : (
            filteredExpenses.map((expense) => {
              const cat = CATEGORIES[expense.category] || { label: 'Unknown', emoji: '❓' };
              const dateObj = new Date(expense.date);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  className="group flex items-center justify-between bg-gradient-to-r from-cream to-cream-dark/30 p-5 rounded-xl border-2 border-sage-light/30 shadow-sm hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl text-xl shadow-sm border-2 border-sage-light/20 flex-shrink-0">
                      {cat.emoji}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-text text-sm truncate">{cat.label}</p>
                      <p className="text-xs text-text-lighter font-medium truncate">{dateStr} {expense.note && `• ${expense.note}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-extrabold text-text text-sm whitespace-nowrap">{formatCurrency(expense.amount)}</span>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="p-1.5 text-text-lighter hover:text-danger hover:bg-warm-rose-light/30 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                      aria-label="Delete expense"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
