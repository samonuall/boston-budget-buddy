import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useBudget } from '../hooks/useBudget'
import { formatCurrency } from '../utils/taxCalculator'
import MonthSelector from '../components/MonthSelector'
import SplurgeMeter from '../components/SplurgeMeter'
import BudgetOverview from '../components/BudgetOverview'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseFeed from '../components/ExpenseFeed'

export default function Dashboard() {
  const {
    takeHome,
    totalSpent,
    remainingTotal,
    needsSpent,
    wantsSpent,
    treatsSpent,
    daleMood,
    overBudgetCategories,
    warningCategories,
  } = useBudget()

  const [showSettings, setShowSettings] = useState(false)

  // Generate an encouraging message based on budget state
  let statusMessage = ''
  let statusColor = 'bg-sage-dark'
  if (overBudgetCategories.length > 0) {
    statusMessage = `You're over budget in ${overBudgetCategories.length} ${overBudgetCategories.length === 1 ? 'category' : 'categories'}. Let's adjust!`
    statusColor = 'bg-[#5a5a5a]'
  } else if (warningCategories.length > 0) {
    statusMessage = `Getting close in ${warningCategories.length} ${warningCategories.length === 1 ? 'category' : 'categories'} — keep an eye on it!`
    statusColor = 'bg-[#5a5a5a]'
  } else if (totalSpent === 0) {
    statusMessage = `You have ${formatCurrency(takeHome.monthlyTakeHome)} to budget this month`
    statusColor = 'bg-[#5a5a5a]'
  } else {
    statusMessage = `You have ${formatCurrency(remainingTotal)} left to spend this month`
    statusColor = 'bg-[#5a5a5a]'
  }

  return (
    <div className="min-h-screen bg-cream pb-40">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-cream/80 backdrop-blur-md border-b border-cream-dark">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-text">Boston Budget Buddy</h1>
          </div>
          <div className="flex items-center gap-3">
            <MonthSelector />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-xl hover:bg-cream-dark transition-colors"
            >
              <Settings size={20} className="text-text-light" />
            </button>
          </div>
        </div>
      </div>

      {/* Splurge Meter */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <SplurgeMeter />
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Budget Overview */}
          <div className="lg:col-span-2">
            <BudgetOverview />

            {/* Status Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${statusColor} rounded-2xl p-5 mt-6 text-white`}
            >
              <p className="text-lg font-bold">{statusMessage}</p>
            </motion.div>
          </div>

          {/* Right: Expense Form + Feed */}
          <div className="space-y-6">
            <ExpenseForm />
            <ExpenseFeed />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

function SettingsModal({ onClose }) {
  const {
    grossSalary,
    bonus,
    four01kPercent,
    categoryBudgets,
    takeHome,
    updateGrossSalary,
    updateBonus,
    update401kPercent,
    updateCategoryBudgets,
  } = useBudget()

  const [localSalary, setLocalSalary] = useState(grossSalary)
  const [localBonus, setLocalBonus] = useState(bonus)
  const [local401k, setLocal401k] = useState(four01kPercent)
  const [localBudgets, setLocalBudgets] = useState({ ...categoryBudgets })

  const handleSave = async () => {
    await updateGrossSalary(Number(localSalary))
    await updateBonus(Number(localBonus))
    await update401kPercent(Number(local401k))
    await updateCategoryBudgets(localBudgets)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-text mb-4">Settings</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-light mb-1">Gross Salary</label>
            <input
              type="number"
              value={localSalary}
              onChange={(e) => setLocalSalary(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-cream-dark bg-cream focus:border-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-light mb-1">Annual Bonus</label>
            <input
              type="number"
              value={localBonus}
              onChange={(e) => setLocalBonus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-cream-dark bg-cream focus:border-sage"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text-light mb-1">401k %</label>
            <input
              type="number"
              value={local401k}
              onChange={(e) => setLocal401k(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-cream-dark bg-cream focus:border-sage"
              min="0"
              max="100"
            />
          </div>

          <div className="pt-2 border-t border-cream-dark">
            <p className="text-sm font-semibold text-text-light mb-1">
              Monthly Take-Home: <span className="text-sage-dark font-bold">{formatCurrency(takeHome.monthlyTakeHome)}</span>
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-cream-dark text-text-light hover:bg-cream-dark transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-xl bg-sage-dark text-white font-semibold hover:bg-sage transition-colors"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
