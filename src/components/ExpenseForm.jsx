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
    <div className="bg-white p-7 rounded-[1.5rem] shadow-lg border-2 border-dusty-purple-light/40">
      <h3 className="text-xl font-extrabold text-text mb-5">Add Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-text-light mb-1.5">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-base text-text-lighter">$</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 text-base rounded-xl border-2 border-cream-dark focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none transition-all"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-text-light mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 text-base rounded-xl border-2 border-cream-dark focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none bg-white transition-all"
          >
            {Object.entries(CATEGORIES).map(([key, { label, emoji }]) => (
              <option key={key} value={key}>
                {emoji} {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-text-light mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 text-base rounded-xl border-2 border-cream-dark focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-text-light mb-1.5">Note (Optional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 text-base rounded-xl border-2 border-cream-dark focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none transition-all"
            placeholder="What was this for?"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sage-dark to-sage text-white font-bold text-base py-3 rounded-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          Log Expense
        </button>
      </form>
    </div>
  );
}
