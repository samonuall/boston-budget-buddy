import { useBudget } from './hooks/useBudget'
import Dashboard from './pages/Dashboard'
import Onboarding from './pages/Onboarding'
import { AnimatePresence, motion } from 'framer-motion'

function App() {
  const { loading, onboardingComplete } = useBudget()

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-text font-[Nunito]">Boston Budget Buddy</p>
          <p className="text-text-light mt-2">Loading your budget...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream relative">
      <AnimatePresence mode="wait">
        {!onboardingComplete ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Onboarding />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Dashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
