import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useBudget } from '../hooks/useBudget'
import { formatCurrency } from '../utils/taxCalculator'
import { CATEGORIES, NEEDS_CATEGORIES, WANTS_CATEGORIES, SAVINGS_CATEGORIES } from '../utils/constants'
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null)

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
    statusMessage = `Ready to track your spending for this month!`
    statusColor = 'bg-[#5a5a5a]'
  } else {
    statusMessage = `Great job tracking your expenses this month!`
    statusColor = 'bg-[#5a5a5a]'
  }

  return (
    <div className="min-h-screen bg-cream pb-48 px-16 md:px-24 lg:px-32 xl:px-40">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-cream/90 backdrop-blur-xl border-b-2 border-sage-light/30 -mx-16 md:-mx-24 lg:-mx-32 xl:-mx-40 px-16 md:px-24 lg:px-32 xl:px-40">
        <div className="max-w-[1600px] mx-auto py-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-text tracking-tight truncate">Boston Budget Buddy</h1>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <MonthSelector />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-3 rounded-2xl hover:bg-sage-light/20 transition-all duration-300 hover:scale-105"
            >
              <Settings size={24} className="text-sage-dark" />
            </button>
          </div>
        </div>
      </div>

      {/* Splurge Meter */}
      <div className="max-w-[1600px] mx-auto mt-10">
        <SplurgeMeter />
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10">
          {/* Left: Budget Overview */}
          <div>
            <BudgetOverview
              onCategoryClick={setSelectedCategoryFilter}
              selectedCategory={selectedCategoryFilter}
            />

            {/* Status Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${statusColor} rounded-[2rem] p-6 mt-6 text-white shadow-lg`}
            >
              <p className="text-lg md:text-xl font-bold text-center">{statusMessage}</p>
            </motion.div>
          </div>

          {/* Right: Expense Form + Feed */}
          <div className="space-y-6">
            <ExpenseForm />
            <ExpenseFeed
              categoryFilter={selectedCategoryFilter}
              onClearFilter={() => setSelectedCategoryFilter(null)}
            />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}

// Helper component for grouped category budget inputs
function CategoryGroup({ title, categories, budgets, onBudgetChange }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-text-light uppercase tracking-wider mb-3">{title}</h4>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((key) => {
          const cat = CATEGORIES[key]
          return (
            <div key={key}>
              <label className="block text-xs font-bold text-text-light mb-1.5 flex items-center gap-1.5">
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </label>
              <input
                type="number"
                value={budgets[key] || 0}
                onChange={(e) => onBudgetChange(key, e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-cream-dark bg-cream focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none transition-all"
                min="0"
                step="10"
              />
            </div>
          )
        })}
      </div>
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
      className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-10 border-4 border-sage-light/30"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-3xl font-extrabold text-text mb-8">Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-base font-bold text-text-light mb-2">Gross Salary</label>
            <input
              type="number"
              value={localSalary}
              onChange={(e) => setLocalSalary(e.target.value)}
              className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-cream-dark bg-cream focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-text-light mb-2">Annual Bonus</label>
            <input
              type="number"
              value={localBonus}
              onChange={(e) => setLocalBonus(e.target.value)}
              className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-cream-dark bg-cream focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-base font-bold text-text-light mb-2">401k %</label>
            <input
              type="number"
              value={local401k}
              onChange={(e) => setLocal401k(e.target.value)}
              className="w-full px-5 py-4 text-lg rounded-2xl border-2 border-cream-dark bg-cream focus:border-sage focus:ring-4 focus:ring-sage-light/30 outline-none transition-all"
              min="0"
              max="100"
            />
          </div>

          {/* Category Budgets Section */}
          <div className="pt-6 border-t-2 border-sage-light/30 mt-8">
            <h3 className="text-xl font-extrabold text-text mb-4">Category Budgets</h3>

            <div className="space-y-6">
              <CategoryGroup
                title="Needs"
                categories={NEEDS_CATEGORIES}
                budgets={localBudgets}
                onBudgetChange={(key, value) => setLocalBudgets({ ...localBudgets, [key]: Number(value) || 0 })}
              />
              <CategoryGroup
                title="Wants"
                categories={WANTS_CATEGORIES}
                budgets={localBudgets}
                onBudgetChange={(key, value) => setLocalBudgets({ ...localBudgets, [key]: Number(value) || 0 })}
              />
              <CategoryGroup
                title="Savings"
                categories={SAVINGS_CATEGORIES}
                budgets={localBudgets}
                onBudgetChange={(key, value) => setLocalBudgets({ ...localBudgets, [key]: Number(value) || 0 })}
              />
            </div>
          </div>

          {/* Allocation Summary */}
          <div className="pt-4 border-t-2 border-sage-light/30 mt-8 bg-cream/50 -mx-10 px-10 py-5 rounded-2xl">
            <p className="text-base font-bold text-text-light mb-2">
              Monthly Take-Home: <span className="text-sage-dark font-extrabold text-xl">{formatCurrency(takeHome.monthlyTakeHome)}</span>
            </p>
            <p className="text-base font-bold text-text-light">
              Total Allocated: <span className={`font-extrabold text-xl ${Object.values(localBudgets).reduce((sum, val) => sum + (Number(val) || 0), 0) > takeHome.monthlyTakeHome ? 'text-danger' : 'text-sage-dark'}`}>
                {formatCurrency(Object.values(localBudgets).reduce((sum, val) => sum + (Number(val) || 0), 0))}
              </span>
            </p>
            {Object.values(localBudgets).reduce((sum, val) => sum + (Number(val) || 0), 0) > takeHome.monthlyTakeHome && (
              <p className="text-sm text-danger font-bold mt-2">⚠️ Total allocated exceeds monthly take-home</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-lg rounded-2xl border-2 border-cream-dark text-text-light hover:bg-cream-dark transition-all duration-300 font-bold hover:scale-[1.02]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-4 text-lg rounded-2xl bg-gradient-to-r from-sage-dark to-sage text-white font-bold hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
