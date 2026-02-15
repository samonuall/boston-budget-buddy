import { useState } from 'react';
import { useBudget } from '../hooks/useBudget';
import { CATEGORIES } from '../utils/constants';

export default function ExpenseForm() {
  const { logExpense } = useBudget();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(Object.keys(CATEGORIES)[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;
    
    await logExpense(amount, category, note, date);
    
    // Reset form
    setAmount('');
    setNote('');
    // Keep category and date for easier multiple entry
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-cream-dark">
      <h3 className="text-lg font-bold text-text mb-4">Add Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-text-lighter">$</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage-light/50 outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage-light/50 outline-none bg-white transition-all"
          >
            {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
              <option key={key} value={key}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage-light/50 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-light mb-1">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-cream-dark focus:border-sage focus:ring-2 focus:ring-sage-light/50 outline-none transition-all"
            placeholder="What was this for?"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-sage-dark text-white font-semibold py-2.5 rounded-xl hover:bg-sage transition-colors shadow-sm active:scale-[0.98]"
        >
          Log Expense
        </button>
      </form>
    </div>
  );
}
