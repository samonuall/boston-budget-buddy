import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBudget } from '../hooks/useBudget'
import { CATEGORIES, CATEGORY_KEYS, DEFAULT_BUDGETS } from '../utils/constants'
import { calculateTakeHome, formatCurrency } from '../utils/taxCalculator'

const pageVariants = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  exit: { opacity: 0, x: -60, transition: { duration: 0.3, ease: 'easeIn' } },
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: 'easeOut' },
  }),
}

function CurrencyInput({ label, value, onChange, prefix = '$' }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-text-light">{label}</label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-lighter font-medium text-sm">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`w-full rounded-xl border border-cream-dark bg-white px-3 py-2.5 text-text font-medium
            focus:border-sage focus:ring-2 focus:ring-sage/30 transition-all duration-200
            ${prefix ? 'pl-7' : ''}`}
        />
      </div>
    </div>
  )
}

function PercentInput({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-text-light">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          max={100}
          value={value}
          onChange={(e) => onChange(Math.min(100, Math.max(0, Number(e.target.value) || 0)))}
          className="w-full rounded-xl border border-cream-dark bg-white px-3 py-2.5 text-text font-medium
            focus:border-sage focus:ring-2 focus:ring-sage/30 transition-all duration-200 pr-8"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-lighter font-medium text-sm">
          %
        </span>
      </div>
    </div>
  )
}

function TaxLineItem({ label, amount, highlighted = false }) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 ${
        highlighted
          ? 'border-t-2 border-sage/40 pt-4 mt-2'
          : 'border-b border-cream-dark/60'
      }`}
    >
      <span
        className={`text-sm ${
          highlighted ? 'font-bold text-text text-base' : 'font-medium text-text-light'
        }`}
      >
        {label}
      </span>
      <span
        className={`font-semibold ${
          highlighted ? 'text-sage-dark text-lg' : 'text-text text-sm'
        }`}
      >
        {highlighted ? formatCurrency(amount) : `-${formatCurrency(amount)}`}
      </span>
    </div>
  )
}

function IncomeStep({ grossSalary, bonus, four01kPercent, onGrossSalaryChange, onBonusChange, on401kChange, takeHome, onNext }) {
  return (
    <motion.div
      key="step-income"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl font-bold text-text mb-2"
        >
          Let's set up your budget!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="text-text-light text-sm"
        >
          Boston Budget Buddy will calculate your take-home pay and help you plan every dollar.
        </motion.p>
      </div>

      {/* Income Inputs Card */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        custom={0}
        className="bg-white rounded-2xl shadow-sm border border-cream-dark/50 p-6 mb-5"
      >
        <h2 className="text-lg font-bold text-text mb-4">Income Details</h2>
        <div className="grid grid-cols-1 gap-4">
          <CurrencyInput
            label="Gross Annual Salary"
            value={grossSalary}
            onChange={onGrossSalaryChange}
          />
          <CurrencyInput
            label="Annual Bonus"
            value={bonus}
            onChange={onBonusChange}
          />
          <PercentInput
            label="401(k) Contribution"
            value={four01kPercent}
            onChange={on401kChange}
          />
        </div>
      </motion.div>

      {/* Tax Breakdown Card */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        custom={1}
        className="bg-white rounded-2xl shadow-sm border border-cream-dark/50 p-6 mb-5"
      >
        <h2 className="text-lg font-bold text-text mb-3">Tax Breakdown</h2>
        <p className="text-xs text-text-lighter mb-3">
          Based on {formatCurrency(takeHome.totalGross)} total gross income (single filer, MA)
        </p>
        <div className="flex flex-col">
          <TaxLineItem label="Federal Income Tax" amount={takeHome.federalTax} />
          <TaxLineItem label="MA State Tax (5%)" amount={takeHome.stateTax} />
          <TaxLineItem label="Social Security" amount={takeHome.socialSecurity} />
          <TaxLineItem label="Medicare" amount={takeHome.medicare} />
          <TaxLineItem label="401(k) Contribution" amount={takeHome.four01kContribution} />
          <TaxLineItem label="Monthly Take-Home Pay" amount={takeHome.monthlyTakeHome} highlighted />
        </div>
      </motion.div>

      {/* Monthly Take-Home Highlight */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        custom={2}
        className="bg-sage/10 rounded-2xl border border-sage/30 p-5 mb-6 text-center"
      >
        <p className="text-sm font-medium text-sage-dark mb-1">Your Monthly Take-Home</p>
        <p className="text-3xl font-extrabold text-sage-dark">{formatCurrency(takeHome.monthlyTakeHome)}</p>
        <p className="text-xs text-text-lighter mt-1">
          {formatCurrency(takeHome.annualTakeHome)} / year after taxes & 401(k)
        </p>
      </motion.div>

      {/* Next Button */}
      <motion.button
        variants={cardVariants}
        initial="initial"
        animate="animate"
        custom={3}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNext}
        className="w-full py-3.5 rounded-2xl bg-sage text-white font-bold text-base shadow-md
          hover:bg-sage-dark transition-colors duration-200 cursor-pointer"
      >
        Next
      </motion.button>
    </motion.div>
  )
}

function BudgetStep({ monthlyTakeHome, budgets, onBudgetChange, onSave }) {
  const totalAllocated = Object.values(budgets).reduce((sum, v) => sum + v, 0)
  const remaining = monthlyTakeHome - totalAllocated
  const allocationPercent = monthlyTakeHome > 0 ? Math.min(100, (totalAllocated / monthlyTakeHome) * 100) : 0
  const isOverBudget = totalAllocated > monthlyTakeHome

  return (
    <motion.div
      key="step-budget"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-lg mx-auto"
    >
      <div className="text-center mb-6">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl font-bold text-text mb-2"
        >
          Allocate Your Monthly Budget
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-text-light text-sm"
        >
          Divide your <span className="font-bold text-sage-dark">{formatCurrency(monthlyTakeHome)}</span> take-home across categories.
        </motion.p>
      </div>

      {/* Allocation Summary Bar */}
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        custom={0}
        className="bg-white rounded-2xl shadow-sm border border-cream-dark/50 p-5 mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-text-light uppercase tracking-wide">Allocated</p>
            <p className={`text-xl font-bold ${isOverBudget ? 'text-danger' : 'text-text'}`}>
              {formatCurrency(totalAllocated)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-text-light uppercase tracking-wide">Remaining</p>
            <p className={`text-xl font-bold ${isOverBudget ? 'text-danger' : remaining > 0 ? 'text-sage-dark' : 'text-text'}`}>
              {isOverBudget ? `-${formatCurrency(Math.abs(remaining))}` : formatCurrency(remaining)}
            </p>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full h-3 bg-cream-dark rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-colors duration-300 ${
              isOverBudget ? 'bg-danger' : allocationPercent >= 95 ? 'bg-sage-dark' : 'bg-sage'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, allocationPercent)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-text-lighter mt-2 text-center">
          {Math.round(allocationPercent)}% of take-home allocated
        </p>
      </motion.div>

      {/* Category Budget Cards */}
      <div className="flex flex-col gap-3 mb-6">
        {CATEGORY_KEYS.map((key, index) => {
          const cat = CATEGORIES[key]
          const amount = budgets[key] || 0
          const categoryPercent = monthlyTakeHome > 0 ? (amount / monthlyTakeHome) * 100 : 0

          return (
            <motion.div
              key={key}
              variants={cardVariants}
              initial="initial"
              animate="animate"
              custom={index + 1}
              className="bg-white rounded-2xl shadow-sm border border-cream-dark/50 p-4 flex items-center gap-4"
            >
              {/* Emoji + Label */}
              <div className="flex items-center gap-2.5 min-w-[140px]">
                <span className="text-xl">{cat.emoji}</span>
                <span className="text-sm font-semibold text-text">{cat.label}</span>
              </div>

              {/* Input */}
              <div className="relative flex-1 max-w-[130px]">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-lighter text-xs font-medium">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  value={amount}
                  onChange={(e) => onBudgetChange(key, Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-cream-dark bg-cream/50 pl-6 pr-2 py-2 text-sm text-text font-medium
                    focus:border-sage focus:ring-2 focus:ring-sage/30 transition-all duration-200"
                />
              </div>

              {/* Mini Progress Indicator */}
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-cream-dark rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      cat.type === 'needs'
                        ? 'bg-sage'
                        : cat.type === 'savings'
                        ? 'bg-teal'
                        : 'bg-dusty-purple'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, categoryPercent)}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
                <span className="text-xs text-text-lighter font-medium w-[38px] text-right">
                  {categoryPercent.toFixed(0)}%
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Save & Start Button */}
      <motion.button
        variants={cardVariants}
        initial="initial"
        animate="animate"
        custom={CATEGORY_KEYS.length + 2}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSave}
        className={`w-full py-3.5 rounded-2xl font-bold text-base shadow-md transition-colors duration-200 cursor-pointer
          ${isOverBudget
            ? 'bg-cream-dark text-text-light cursor-not-allowed'
            : 'bg-dusty-purple text-white hover:bg-dusty-purple-dark'
          }`}
        disabled={isOverBudget}
      >
        {isOverBudget ? 'Budget exceeds take-home' : 'Save & Start'}
      </motion.button>

      {isOverBudget && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-danger text-center mt-2"
        >
          Your budget is {formatCurrency(Math.abs(remaining))} over your take-home. Adjust categories to continue.
        </motion.p>
      )}
    </motion.div>
  )
}

export default function Onboarding() {
  const {
    grossSalary,
    bonus,
    four01kPercent,
    updateGrossSalary,
    updateBonus,
    update401kPercent,
    updateCategoryBudgets,
    completeOnboarding,
    takeHome,
  } = useBudget()

  const [step, setStep] = useState(1)
  const [budgets, setBudgets] = useState({ ...DEFAULT_BUDGETS })

  const handleBudgetChange = (key, value) => {
    setBudgets((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    await updateCategoryBudgets(budgets)
    await completeOnboarding()
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-start py-12 px-4">
      {/* Step Indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
            step === 1
              ? 'bg-sage text-white shadow-md'
              : 'bg-sage/20 text-sage-dark'
          }`}
        >
          1
        </div>
        <div className="w-10 h-0.5 bg-cream-dark rounded-full" />
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300 ${
            step === 2
              ? 'bg-dusty-purple text-white shadow-md'
              : 'bg-dusty-purple/20 text-dusty-purple-dark'
          }`}
        >
          2
        </div>
      </div>

      {/* Animated Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <IncomeStep
            grossSalary={grossSalary}
            bonus={bonus}
            four01kPercent={four01kPercent}
            onGrossSalaryChange={updateGrossSalary}
            onBonusChange={updateBonus}
            on401kChange={update401kPercent}
            takeHome={takeHome}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <BudgetStep
            monthlyTakeHome={takeHome.monthlyTakeHome}
            budgets={budgets}
            onBudgetChange={handleBudgetChange}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
