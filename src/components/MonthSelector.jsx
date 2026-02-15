import { useBudget } from '../hooks/useBudget';
import { Lock } from 'lucide-react';

export default function MonthSelector() {
  const { selectedMonth, selectedYear, setSelectedMonth, setSelectedYear } = useBudget();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-xl shadow-lg border-2 border-sage-light/40 w-fit hover:shadow-xl transition-all duration-300">
      <Lock size={20} className="text-sage-dark flex-shrink-0" />
      <div className="flex gap-3 items-center">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="font-extrabold text-base text-text bg-transparent outline-none cursor-pointer hover:text-sage-dark transition-colors appearance-none"
        >
          {months.map((m, idx) => (
            <option key={idx} value={idx + 1}>{m}</option>
          ))}
        </select>

        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="font-extrabold text-base text-text bg-transparent outline-none cursor-pointer hover:text-sage-dark transition-colors appearance-none"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
