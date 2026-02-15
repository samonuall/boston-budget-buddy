/**
 * Tax calculator for Boston, MA single filer
 * Uses 2024/2025 tax brackets
 */

// 2024 Federal Income Tax Brackets (Single Filer)
const FEDERAL_BRACKETS = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

// 2024 Standard Deduction for Single Filer
const STANDARD_DEDUCTION = 14600;

// Massachusetts flat income tax rate
const MA_STATE_TAX_RATE = 0.05;

// FICA rates
const SOCIAL_SECURITY_RATE = 0.062;
const SOCIAL_SECURITY_WAGE_BASE = 168600; // 2024
const MEDICARE_RATE = 0.0145;

/**
 * Calculate federal income tax using progressive brackets
 */
function calculateFederalTax(taxableIncome) {
  let tax = 0;
  for (const bracket of FEDERAL_BRACKETS) {
    if (taxableIncome <= bracket.min) break;
    const taxableInBracket = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxableInBracket * bracket.rate;
  }
  return tax;
}

/**
 * Calculate all taxes and take-home pay
 * @param {number} grossSalary - Annual gross salary
 * @param {number} bonus - Annual bonus
 * @param {number} four01kPercent - 401k contribution percentage (0-100)
 * @returns {object} Full tax breakdown
 */
export function calculateTakeHome(grossSalary, bonus, four01kPercent) {
  const totalGross = grossSalary + bonus;

  // Pre-tax deductions
  const four01kContribution = totalGross * (four01kPercent / 100);
  const four01kMonthly = four01kContribution / 12;

  // Taxable income after 401k and standard deduction
  const afterPreTax = totalGross - four01kContribution;
  const federalTaxableIncome = Math.max(0, afterPreTax - STANDARD_DEDUCTION);

  // Federal income tax
  const federalTax = calculateFederalTax(federalTaxableIncome);

  // Massachusetts state income tax (flat 5% on income after 401k)
  const stateTaxableIncome = afterPreTax; // MA doesn't use federal standard deduction the same way
  const stateTax = stateTaxableIncome * MA_STATE_TAX_RATE;

  // FICA (calculated on gross, not reduced by 401k for Social Security/Medicare)
  const socialSecurity = Math.min(totalGross, SOCIAL_SECURITY_WAGE_BASE) * SOCIAL_SECURITY_RATE;
  const medicare = totalGross * MEDICARE_RATE;
  const ficaTotal = socialSecurity + medicare;

  // Total annual taxes
  const totalTaxes = federalTax + stateTax + ficaTotal;

  // Annual take-home (after taxes and 401k)
  const annualTakeHome = totalGross - four01kContribution - totalTaxes;
  const monthlyTakeHome = annualTakeHome / 12;

  return {
    totalGross,
    four01kContribution,
    four01kMonthly: Math.round(four01kMonthly * 100) / 100,
    federalTax: Math.round(federalTax * 100) / 100,
    stateTax: Math.round(stateTax * 100) / 100,
    socialSecurity: Math.round(socialSecurity * 100) / 100,
    medicare: Math.round(medicare * 100) / 100,
    ficaTotal: Math.round(ficaTotal * 100) / 100,
    totalTaxes: Math.round(totalTaxes * 100) / 100,
    annualTakeHome: Math.round(annualTakeHome * 100) / 100,
    monthlyTakeHome: Math.round(monthlyTakeHome * 100) / 100,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency with cents
 */
export function formatCurrencyExact(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
