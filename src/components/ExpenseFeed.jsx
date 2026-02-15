import { useBudget } from '../hooks/useBudget';
import { CATEGORIES } from '../utils/constants';
import { formatCurrency } from '../utils/taxCalculator';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ExpenseFeed() {
  const { expenses, removeExpense } = useBudget();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-text px-1">Recent Expenses</h3>
      <div className="space-y-2 h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-sage-light scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {expenses.length === 0 ? (
            <p className="text-text-lighter text-center py-8 italic">No expenses yet this month.</p>
          ) : (
            expenses.map((expense) => {
              const cat = CATEGORIES[expense.category] || { label: 'Unknown', emoji: '❓' };
              const dateObj = new Date(expense.date);
              const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  className="group flex items-center justify-between bg-white p-3 rounded-xl border border-cream-dark shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-cream rounded-full text-lg">
                      {cat.emoji}
                    </div>
                    <div>
                      <p className="font-medium text-text text-sm">{cat.label}</p>
                      <p className="text-xs text-text-lighter">{dateStr} {expense.note && `• ${expense.note}`}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-text-dark">{formatCurrency(expense.amount)}</span>
                    <button
                      onClick={() => removeExpense(expense.id)}
                      className="p-1.5 text-text-lighter hover:text-danger hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      aria-label="Delete expense"
                    >
                      <X size={14} />
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
