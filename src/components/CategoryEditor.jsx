import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, RotateCcw, Smile } from 'lucide-react';
import { CATEGORY_TYPES, CATEGORY_TYPE_KEYS } from '../utils/constants';
import { rowId, makeDraftCategory } from '../utils/categories';
import EmojiPicker from './EmojiPicker';

function CategoryRow({ cat, budget, expenseCount, onChange, onBudgetChange, onDelete }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Emoji */}
      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={() => setPickerOpen((v) => !v)}
          title="Change emoji"
          className="h-11 w-11 flex items-center justify-center rounded-xl border-2 border-cream-dark bg-cream hover:border-sage hover:bg-sage-light/20 transition-all duration-200"
        >
          <span className="emoji text-2xl">{cat.emoji}</span>
        </button>
        <AnimatePresence>
          {pickerOpen && (
            <EmojiPicker
              value={cat.emoji}
              onSelect={(emoji) => onChange({ ...cat, emoji })}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Label */}
      <input
        type="text"
        value={cat.label}
        placeholder="Category name"
        onChange={(e) => onChange({ ...cat, label: e.target.value })}
        className="flex-1 min-w-0 px-3 py-2.5 text-sm font-semibold rounded-xl border-2 border-cream-dark bg-white focus:border-sage outline-none transition-all"
      />

      {/* Type */}
      <select
        value={cat.type}
        onChange={(e) => onChange({ ...cat, type: e.target.value })}
        className="w-[104px] flex-shrink-0 px-2 py-2.5 text-sm rounded-xl border-2 border-cream-dark bg-white focus:border-sage outline-none cursor-pointer transition-all"
      >
        {CATEGORY_TYPE_KEYS.map((t) => (
          <option key={t} value={t}>{CATEGORY_TYPES[t].label}</option>
        ))}
      </select>

      {/* Budget */}
      <div className="relative w-[110px] flex-shrink-0">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter text-sm pointer-events-none">$</span>
        <input
          type="number"
          min="0"
          step="10"
          value={budget}
          onChange={(e) => onBudgetChange(Number(e.target.value) || 0)}
          className="w-full pl-7 pr-2 py-2.5 text-sm rounded-xl border-2 border-cream-dark bg-white focus:border-sage outline-none transition-all"
        />
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        title={
          expenseCount > 0
            ? `Hide this category (${expenseCount} logged ${expenseCount === 1 ? 'expense' : 'expenses'} will be kept)`
            : 'Delete this category'
        }
        className="flex-shrink-0 p-2 text-text-lighter hover:text-danger hover:bg-warm-rose-light/30 rounded-lg transition-all duration-200 hover:scale-110"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

export default function CategoryEditor({
  categories,
  budgets,
  expenseCounts,
  onCategoriesChange,
  onBudgetChange,
}) {
  const active = categories.filter((c) => !c.archived);
  const archived = categories.filter((c) => c.archived);

  const replaceRow = (updated) =>
    onCategoriesChange(categories.map((c) => (rowId(c) === rowId(updated) ? updated : c)));

  /**
   * Delete policy: a category with logged expenses is *hidden*, not destroyed —
   * its label and emoji have to survive so old expenses still read correctly.
   * A category nothing has ever been logged to is removed outright, so trying
   * out a category and changing your mind doesn't leave permanent clutter.
   */
  const handleDelete = (cat) => {
    const count = cat.isNew ? 0 : expenseCounts[cat.key] || 0;
    if (count === 0) {
      onCategoriesChange(categories.filter((c) => rowId(c) !== rowId(cat)));
    } else {
      replaceRow({ ...cat, archived: true });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-extrabold text-text">Categories</h3>
        <button
          type="button"
          onClick={() => onCategoriesChange([...categories, makeDraftCategory()])}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold rounded-xl bg-sage-light/40 text-sage-dark hover:bg-sage-light/70 transition-all duration-200 hover:scale-[1.03]"
        >
          <Plus size={16} />
          <span>Add category</span>
        </button>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-text-lighter">
          <span className="w-11 flex-shrink-0" />
          <span className="flex-1 min-w-0">Name</span>
          <span className="w-[104px] flex-shrink-0">Group</span>
          <span className="w-[110px] flex-shrink-0">Monthly</span>
          <span className="w-[33px] flex-shrink-0" />
        </div>

        {active.length === 0 && (
          <p className="text-sm text-text-lighter italic text-center py-6">
            No categories yet — add one to start tracking.
          </p>
        )}

        <AnimatePresence initial={false}>
          {active.map((cat) => (
            <motion.div
              key={rowId(cat)}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.18 }}
            >
              <CategoryRow
                cat={cat}
                budget={budgets[rowId(cat)] ?? 0}
                expenseCount={cat.isNew ? 0 : expenseCounts[cat.key] || 0}
                onChange={replaceRow}
                onBudgetChange={(val) => onBudgetChange(rowId(cat), val)}
                onDelete={() => handleDelete(cat)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {archived.length > 0 && (
        <div className="mt-7 pt-5 border-t-2 border-cream-dark">
          <h4 className="flex items-center gap-2 text-sm font-bold text-text-light uppercase tracking-wider mb-1">
            <Smile size={15} />
            <span>Hidden categories</span>
          </h4>
          <p className="text-xs text-text-lighter mb-3">
            Removed from the dashboard, but their past expenses are kept and still count toward totals.
          </p>
          <div className="space-y-2">
            {archived.map((cat) => {
              const count = expenseCounts[cat.key] || 0;
              return (
                <div
                  key={rowId(cat)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-cream border-2 border-cream-dark"
                >
                  <span className="emoji text-xl w-6 h-6">{cat.emoji}</span>
                  <span className="flex-1 min-w-0 text-sm font-semibold text-text-light truncate">
                    {cat.label}
                  </span>
                  <span className="text-xs text-text-lighter flex-shrink-0 whitespace-nowrap">
                    {count} kept
                  </span>
                  <button
                    type="button"
                    onClick={() => replaceRow({ ...cat, archived: false })}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-sage-dark hover:bg-sage-light/40 transition-all duration-200 flex-shrink-0"
                  >
                    <RotateCcw size={13} />
                    <span>Restore</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
