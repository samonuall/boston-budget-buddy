import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BudgetProvider } from './hooks/useBudget.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BudgetProvider>
      <App />
    </BudgetProvider>
  </StrictMode>,
)
