/**
 * Central registry of the control-account codes shared by all three
 * company scenarios (Retail / SaaS / Manufacturing).
 *
 * Every scenario's chart of accounts uses the same code for these roles, so
 * the posting logic must reference them through this module rather than
 * scattering bare string literals across routes and components.
 *
 * If you add a scenario with different codes, extend ScenarioSeed with an
 * explicit mapping instead of editing call sites.
 */
export const ACCT = {
  /** Cash at Bank — the contra side of every bank-feed posting. */
  CASH: '1200',
  /** Trade Receivables — debit side of a sales invoice. */
  RECEIVABLES: '1210',
  /** Inventory — used as the quick-ratio deduction. */
  INVENTORY: '1220',
  /** Trade Payables — credit side of a supplier bill. */
  PAYABLES: '2100',
  /** Sales Tax Control — output/input tax clearing. */
  SALES_TAX: '2110',
  /** Ordinary Share Capital. */
  SHARE_CAPITAL: '3000',
  /** Retained Earnings b/f — the opening balance for closing RE. */
  RETAINED_EARNINGS: '3100',
  /** Investment / interest income (IFRS 18 "Investing" category). */
  INVESTMENT_INCOME: '4100',
  /** Depreciation & amortisation expense. */
  DEPRECIATION_EXPENSE: '5400',
  /** Default expense code for uncoded bank debits. */
  BANK_CHARGES: '5500',
  /** Default income code for uncoded bank credits. */
  DEFAULT_INCOME: '4100'
} as const;

export type AccountCode = (typeof ACCT)[keyof typeof ACCT];

/**
 * Codes that must exist in a company's chart of accounts before any
 * automatic posting can succeed. Checked server-side so a malformed or
 * partially-provisioned scenario fails loudly instead of silently dropping
 * journal lines.
 */
export const REQUIRED_CONTROL_CODES: readonly string[] = [
  ACCT.CASH,
  ACCT.RECEIVABLES,
  ACCT.PAYABLES,
  ACCT.SALES_TAX,
  ACCT.SHARE_CAPITAL,
  ACCT.RETAINED_EARNINGS,
  ACCT.DEPRECIATION_EXPENSE
];
