import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/taxCalculator';

export default function BudgetCard({ catInfo, category, budget, spent, status, onClick, isActive }) {
  const rawPercentage = budget > 0 ? Math.max(0, (spent / budget) * 100) : 0;
  // The bar is clamped so it can't overflow its track, but the badge shows the
  // true figure — otherwise going over budget still reads as a tidy "100%".
  const barWidth = Math.min(100, rawPercentage);

  // Status -> colour. Only 'over' is red; 'met' means you landed exactly on
  // budget, which is a win and gets the deeper success green.
  let barColor = 'bg-sage';
  let cardBg = 'bg-white';
  let cardBorder = 'border-sage-light/40';
  let badgeClass = 'bg-sage-light/30 text-sage-dark';

  if (status === 'warning') {
    barColor = 'bg-warning';
    cardBorder = 'border-warning/40';
  }
  if (status === 'met') {
    barColor = 'bg-sage-dark';
    cardBorder = 'border-sage-dark/50';
    badgeClass = 'bg-sage-dark/20 text-sage-dark';
  }
  if (status === 'over') {
    barColor = 'bg-danger';
    cardBg = 'bg-warm-rose-light/10';
    cardBorder = 'border-warm-rose/50';
    badgeClass = 'bg-warm-rose/20 text-danger';
  }

  // Active state overrides border and adds ring
  if (isActive) {
    cardBorder = 'border-teal ring-4 ring-teal/30';
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`${cardBg} p-6 rounded-[1.5rem] shadow-lg border-2 ${cardBorder} flex flex-col gap-4 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''} ${isActive ? 'shadow-2xl' : ''}`}
      onClick={onClick ? () => onClick(category) : undefined}
    >
      <div className="flex justify-between items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="emoji text-3xl drop-shadow-sm w-9 h-9">{catInfo?.emoji}</span>
          <h4 className="font-bold text-text text-base truncate leading-snug">{catInfo?.label}</h4>
        </div>
        <span className={`text-sm font-extrabold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0 tabular-nums ${badgeClass}`}>
          {status === 'met' ? 'On budget' : `${Math.round(rawPercentage)}%`}
        </span>
      </div>

      <div className="h-4 w-full bg-cream-dark/50 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className={`h-full ${barColor} shadow-sm`}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="flex justify-between items-end gap-3">
        <span className="text-sm font-bold text-text truncate min-w-0">
          {formatCurrency(spent)} <span className="font-normal text-text-light">/ {formatCurrency(budget)}</span>
        </span>
        <span className="text-[10px] uppercase tracking-wider text-text-lighter font-semibold whitespace-nowrap flex-shrink-0">Spent</span>
      </div>
    </motion.div>
  );
}
