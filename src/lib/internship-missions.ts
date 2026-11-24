import type { FinancialStatements, JournalEntryRecord, BankFeedItem } from './accounting-engine';

export interface MissionStep {
  id: string;
  order: number;
  title: string;
  workplaceTask: string;
  accaChapter: string;
  ifrsRef: string;
  targetTab: 'bank-feed' | 'invoices' | 'assets' | 'ledger' | 'statements' | 'exam';
  actionLabel: string;
  modelAnswer: string;
  examConnection: string;
  backOnTrackJournal?: {
    reference: string;
    date: string;
    description: string;
    lines: Array<{ accountCode: string; debit: number; credit: number }>;
  };
}

export interface CompanyInternshipMission {
  slug: string;
  roleTitle: string;
  managerName: string;
  managerTitle: string;
  emailSubject: string;
  emailDate: string;
  briefingParagraphs: string[];
  competencies: string[];
  steps: MissionStep[];
}

export interface LiveCompanySnapshot {
  slug: string;
  journals: JournalEntryRecord[];
  bankTransactions: BankFeedItem[];
  invoices: Array<{ status: string }>;
  fixedAssets: Array<{ lastDepYear?: number | null }>;
  statements: FinancialStatements;
  statementsReviewed: boolean;
}

export const INTERNSHIP_MISSIONS: Record<string, CompanyInternshipMission> = {
  'meridian-retail': {
    slug: 'meridian-retail',
    roleTitle: 'Junior Financial Accountant (Month-End Close Intern)',
    managerName: 'Elena Vance, FCCA',
    managerTitle: 'Financial Controller, Meridian Retail Ltd',
    emailSubject: 'Action Required: Year-End Close Pack — 31 Dec 2025 (Meridian Retail)',
    emailDate: '31 Dec 2025 · 09:05 AM',
    briefingParagraphs: [
      'Welcome to the Finance Team! Our external auditors arrive next week, and I need you to run the December year-end close for Meridian Retail Ltd.',
      'Please clear the bank feed, verify our year-end invoicing, run 2025 IAS 16 depreciation on our delivery fleet and store fixtures, post the December utilities accrual ($1,450), confirm the Trial Balance agrees, and review our draft IFRS 18 Statement of Profit or Loss.'
    ],
    competencies: [
      'Bank Feed Reconciliation (Ch. 13)',
      'Sales Tax & IFRS 15 Invoicing (Ch. 4 & 15)',
      'IAS 16 Fixed Asset Depreciation (Ch. 6)',
      'Accruals & Adjusting Journals (Ch. 9)',
      'Trial Balance & IFRS 18 Reporting (Ch. 14 & 15)'
    ],
    steps: [
      {
        id: 'ret-1',
        order: 1,
        title: 'Reconcile All Bank Feed Transactions',
        workplaceTask: 'Match incoming customer wires and supplier payments in the Bank Feed, and code the monthly merchant fee and insurance standing order.',
        accaChapter: 'Ch. 13 Bank Reconciliations',
        ifrsRef: 'Cash & Control Accounts',
        targetTab: 'bank-feed',
        actionLabel: 'Open Bank Feed',
        modelAnswer: 'Match INV-2025-401 (+$7,200 → Dr Bank / Cr Receivables) and BILL-882 (−$4,500 → Dr Payables / Cr Bank). Code BANK-FEE-DEC (−$145 → Dr 5500 Bank Charges) and SO-INS-DEC (−$480 → Dr 5200 Insurance).',
        examConnection: 'ACCA FA Section A frequently tests which bank statement items adjust the Cash Book (bank charges, standing orders, direct credits) vs. timing differences on the reconciliation statement.'
      },
      {
        id: 'ret-2',
        order: 2,
        title: 'Issue Year-End Credit Sales Invoice with 20% Sales Tax',
        workplaceTask: 'Record a final 30 Dec credit sale to a retail partner in Invoices & Bills (any net amount with 20% sales tax) so output tax hits Sales Tax Control (2110).',
        accaChapter: 'Ch. 4 Sales Tax & Ch. 15 Revenue',
        ifrsRef: 'IFRS 15',
        targetTab: 'invoices',
        actionLabel: 'Go to Invoices & Bills',
        modelAnswer: 'Dr Trade Receivables (1210) for Gross Total; Cr Retail Sales Revenue (4000) for Net; Cr Sales Tax Control (2110) for 20% Tax.',
        examConnection: 'Under IFRS 15, revenue is ALWAYS recorded net of sales tax. Mixing up gross vs. net sales tax is one of the top traps in 2-mark OTQs.'
      },
      {
        id: 'ret-3',
        order: 3,
        title: 'Run 2025 Annual Depreciation on Fixed Assets',
        workplaceTask: 'Open the Fixed Asset Register and post 2025 depreciation for at least one asset (Electric Delivery Van at 20% SL = $8,000, or Store POS at 20% RB = $4,000).',
        accaChapter: 'Ch. 6 Non-Current Assets',
        ifrsRef: 'IAS 16',
        targetTab: 'assets',
        actionLabel: 'Open Fixed Assets',
        modelAnswer: 'Delivery Van (SL): Dr Depreciation Expense (5400) $8,000 / Cr Accum. Depr - Vehicles (1110) $8,000. Store POS (RB): 20% × ($25,000 − $5,000) = $4,000.',
        examConnection: 'Remember: Straight-Line uses (Cost − Residual) / Life, while Reducing Balance applies the % to Carrying Amount (NBV) and ignores residual value in the annual formula.'
      },
      {
        id: 'ret-4',
        order: 4,
        title: 'Post December Utilities Accrual ($1,450)',
        workplaceTask: 'Post a manual adjusting journal for unbilled December store electricity of $1,450 (Dr 5300 Utilities / Cr 2120 Accruals).',
        accaChapter: 'Ch. 9 Accruals & Prepayments',
        ifrsRef: 'Conceptual Framework (Accruals)',
        targetTab: 'ledger',
        actionLabel: 'Post Adjusting Journal',
        modelAnswer: 'Dr Utilities & Store Ops (5300) $1,450 / Cr Accruals (2120) $1,450.',
        examConnection: 'Accruals increase both Expenses (reducing Net Profit) and Current Liabilities on the Statement of Financial Position.'
      ,
        backOnTrackJournal: {
          reference: 'ADJ-ACC-DEC',
          date: '2025-12-31',
          description: 'Year-end accrued December electricity bill',
          lines: [
            { accountCode: '5300', debit: 1450, credit: 0 },
            { accountCode: '2120', debit: 0, credit: 1450 }
          ]
        }
      },
      {
        id: 'ret-5',
        order: 5,
        title: 'Verify Trial Balance & Accounting Equation Agreement',
        workplaceTask: 'Confirm Total Debits equal Total Credits in the Trial Balance and Assets = Liabilities + Equity after all postings.',
        accaChapter: 'Ch. 14 Trial Balance & Errors',
        ifrsRef: 'Double-Entry Integrity',
        targetTab: 'ledger',
        actionLabel: 'Inspect Trial Balance',
        modelAnswer: 'Total Assets strictly equals Total Equity + Total Liabilities with $0 variance.',
        examConnection: 'A balanced Trial Balance proves arithmetical equality of debits and credits, though remember it will not catch errors of omission, commission, principle, or compensating errors.'
      },
      {
        id: 'ret-6',
        order: 6,
        title: 'Review Draft IFRS 18 Financial Statements & Sign Off',
        workplaceTask: 'Inspect the live Statement of Profit or Loss (toggling IAS 1 vs. IFRS 18 Operating/Investing/Financing subtotals) and Statement of Financial Position.',
        accaChapter: 'Ch. 15 & 18 Statements & Ratios',
        ifrsRef: 'IFRS 18 / IAS 1',
        targetTab: 'statements',
        actionLabel: 'Review Financial Statements',
        modelAnswer: 'Verify Gross Margin, Operating Profit (mandatory IFRS 18 subtotal), and Current Ratio before signing off the close pack.',
        examConnection: 'ACCA FA Section B Multi-Task Questions require preparing an adjusted Statement of Profit or Loss and Statement of Financial Position from a Trial Balance.'
      }
    ]
  },
  'cloudpulse-saas': {
    slug: 'cloudpulse-saas',
    roleTitle: 'SaaS Revenue & Reporting Intern',
    managerName: 'Marcus Chen, CPA',
    managerTitle: 'VP of Finance, CloudPulse SaaS Inc.',
    emailSubject: 'Q4 SaaS Close: Deferred Revenue Release & IAS 38 Amortisation',
    emailDate: '31 Dec 2025 · 09:30 AM',
    briefingParagraphs: [
      'Hi! Ahead of our Series B board pack, please complete the year-end close for CloudPulse SaaS Inc.',
      'Clear the Stripe payout and AWS direct debit in the Bank Feed, run 2025 amortisation on our capitalised IAS 38 analytics software, release $3,000 of earned Deferred Subscription Revenue (IFRS 15), and review our IFRS 18 margin profile.'
    ],
    competencies: [
      'SaaS Bank Feed & Stripe Reconciliation (Ch. 13)',
      'IFRS 15 Deferred Revenue Release (Ch. 15)',
      'IAS 38 Software Amortisation (Ch. 8)',
      'B2B Subscription Billing (Ch. 4)',
      'IFRS 18 SaaS Financial Reporting (Ch. 15 & 18)'
    ],
    steps: [
      {
        id: 'saas-1',
        order: 1,
        title: 'Reconcile Stripe Payout, AWS Bill & Treasury Interest',
        workplaceTask: 'Auto-match SUB-2025-901 (+$12,000) and AWS-DEC-25 (−$3,800) in the Bank Feed, and code Treasury Interest (+$320) to Account 4100.',
        accaChapter: 'Ch. 13 Bank Reconciliations',
        ifrsRef: 'Cash & Receivables',
        targetTab: 'bank-feed',
        actionLabel: 'Open Bank Feed',
        modelAnswer: 'Match SUB-2025-901 and AWS-DEC-25; code INT-DEC-25 (+$320) as Dr Bank (1200) / Cr Treasury Interest Income (4100).',
        examConnection: 'Interest earned on treasury cash belongs in the Investing category under IFRS 18, separate from core Operating Profit.'
      },
      {
        id: 'saas-2',
        order: 2,
        title: 'Issue Enterprise Renewal Invoice',
        workplaceTask: 'Record a new enterprise subscription invoice in Invoices & Bills to update Accounts Receivable and Subscription Revenue.',
        accaChapter: 'Ch. 15 Revenue Recognition',
        ifrsRef: 'IFRS 15',
        targetTab: 'invoices',
        actionLabel: 'Go to Invoices & Bills',
        modelAnswer: 'Dr Trade Receivables (1210) / Cr Subscription Revenue (4000) for earned enterprise billing.',
        examConnection: 'Under IFRS 15 Step 5, ongoing SaaS access is a performance obligation satisfied over time, not at a single point in time.'
      },
      {
        id: 'saas-3',
        order: 3,
        title: 'Run 2025 Software Amortisation & Server Depreciation',
        workplaceTask: 'Post 2025 amortisation on Core Analytics Engine v2 ($18,000 SL) or GPU Compute Cluster ($15,000 SL) in the Fixed Asset Register.',
        accaChapter: 'Ch. 8 Intangible Assets',
        ifrsRef: 'IAS 38 & IAS 16',
        targetTab: 'assets',
        actionLabel: 'Open Fixed Assets',
        modelAnswer: 'Dr Depreciation & Amortisation (5400) $18,000 / Cr Accum. Amort - Software (1130) $18,000.',
        examConnection: 'IAS 38 requires all research spend ($19k in account 5300) to be expensed immediately, while capitalised development is amortised over its useful life.'
      },
      {
        id: 'saas-4',
        order: 4,
        title: 'Release December Deferred Subscription Revenue ($3,000)',
        workplaceTask: 'Post an adjusting journal moving $3,000 from Deferred Subscription Revenue (2120) to Subscription Revenue (4000) for December service delivered.',
        accaChapter: 'Ch. 9 & 15 Deferred Income',
        ifrsRef: 'IFRS 15 Contract Liability',
        targetTab: 'ledger',
        actionLabel: 'Post Adjusting Journal',
        modelAnswer: 'Dr Deferred Subscription Revenue (2120) $3,000 / Cr Subscription Revenue (4000) $3,000.',
        examConnection: 'Upfront customer cash for future service creates a Contract Liability (Deferred Income), which is released to Revenue as each month is earned.',
        backOnTrackJournal: {
          reference: 'ADJ-DEF-REV',
          date: '2025-12-31',
          description: 'IFRS 15 December deferred subscription revenue release',
          lines: [
            { accountCode: '2120', debit: 3000, credit: 0 },
            { accountCode: '4000', debit: 0, credit: 3000 }
          ]
        }
      },
      {
        id: 'saas-5',
        order: 5,
        title: 'Verify Trial Balance Agreement',
        workplaceTask: 'Confirm the SaaS Trial Balance and Accounting Equation remain in strict balance after your adjustments.',
        accaChapter: 'Ch. 14 Trial Balance',
        ifrsRef: 'Double-Entry Integrity',
        targetTab: 'ledger',
        actionLabel: 'Inspect Trial Balance',
        modelAnswer: 'Debits = Credits and Assets = Liabilities + Equity ($0 difference).',
        examConnection: 'Always check that adjusting entries affect one Balance Sheet account and one P&L account when accruing or deferring.'
      },
      {
        id: 'saas-6',
        order: 6,
        title: 'Review IFRS 18 SaaS Statements & Margins',
        workplaceTask: 'Inspect Gross Margin, Operating Profit, and Treasury Interest under the IFRS 18 Operating / Investing / Financing view.',
        accaChapter: 'Ch. 18 Interpretation of Statements',
        ifrsRef: 'IFRS 18',
        targetTab: 'statements',
        actionLabel: 'Review Financial Statements',
        modelAnswer: 'SaaS companies exhibit high Gross Margins (>75%) compared to Retail/Manufacturing, making Operating Margin and ROCE key investor ratios.',
        examConnection: 'ACCA FA Chapter 18 tests interpreting margin differences across business models (e.g., high-margin SaaS vs. high-volume retail).'
      }
    ]
  },
  'atlas-manufacturing': {
    slug: 'atlas-manufacturing',
    roleTitle: 'Plant Accounting & Provisions Intern',
    managerName: 'Priya Nair, ACA',
    managerTitle: 'Plant Controller, Atlas Precision Manufacturing Co.',
    emailSubject: 'Year-End Factory Close: CNC Depreciation & IAS 37 Warranty Top-Up',
    emailDate: '31 Dec 2025 · 08:45 AM',
    briefingParagraphs: [
      'Good morning! We are closing FY2025 for Atlas Precision Manufacturing Co. and need all factory accounts reconciled before consolidation.',
      'Please clear the bank feed (SWIFT customer payment, alloy supplier wire, and factory power debit), run 2025 IAS 16 depreciation on our CNC line and assembly building, post a $3,500 IAS 37 warranty provision top-up, and review our Gearing and ROCE.'
    ],
    competencies: [
      'Industrial Bank & Supplier Reconciliation (Ch. 13)',
      'Heavy Plant Reducing-Balance Depreciation (Ch. 6)',
      'IAS 37 Warranty Provision Recognition (Ch. 11)',
      'Industrial AR/AP Tax Billing (Ch. 4)',
      'Capital Structure, Gearing & ROCE Analysis (Ch. 12 & 18)'
    ],
    steps: [
      {
        id: 'mfg-1',
        order: 1,
        title: 'Reconcile Industrial Bank Feed',
        workplaceTask: 'Match MFG-2025-312 (+$24,200) and STL-5501 (−$14,800) in the Bank Feed, and code the Factory Grid Utility debit (−$2,150) to Account 5300.',
        accaChapter: 'Ch. 13 Bank Reconciliations',
        ifrsRef: 'Cash & Payables',
        targetTab: 'bank-feed',
        actionLabel: 'Open Bank Feed',
        modelAnswer: 'Match MFG-2025-312 and STL-5501; code UTIL-DEC-25 (−$2,150) as Dr Factory Power & Utilities (5300) / Cr Cash at Bank (1200).',
        examConnection: 'Reconciling supplier control accounts and bank feeds ensures Trade Payables and Cash are neither understated nor overstated at year-end.'
      },
      {
        id: 'mfg-2',
        order: 2,
        title: 'Record Year-End Raw Materials Bill or Customer Invoice',
        workplaceTask: 'Create a year-end sales invoice or raw materials supplier bill in Invoices & Bills to verify automatic AR/AP posting.',
        accaChapter: 'Ch. 4 & 5 Purchases & Inventory',
        ifrsRef: 'IAS 2 & IFRS 15',
        targetTab: 'invoices',
        actionLabel: 'Go to Invoices & Bills',
        modelAnswer: 'Credit purchase posts Dr Cost of Goods Manufactured (5000) / Cr Trade Payables (2100).',
        examConnection: 'In manufacturing, direct raw materials and factory overheads form Cost of Sales (IAS 2), whereas admin salaries are operating expenses.'
      },
      {
        id: 'mfg-3',
        order: 3,
        title: 'Run 2025 Plant & Building Depreciation',
        workplaceTask: 'Run 2025 depreciation in Fixed Assets for the 5-Axis CNC Milling Line (20% RB = $28,800) or Assembly Plant Building (SL = $5,000).',
        accaChapter: 'Ch. 6 Non-Current Assets',
        ifrsRef: 'IAS 16',
        targetTab: 'assets',
        actionLabel: 'Open Fixed Assets',
        modelAnswer: 'CNC Line (20% RB): 20% × ($180,000 − $36,000) = $28,800. Building (SL): ($220,000 − $20,000) / 40 yrs = $5,000.',
        examConnection: 'Notice how the CNC Line uses Reducing Balance (higher charge in early years) while the Building uses Straight-Line over 40 years.'
      },
      {
        id: 'mfg-4',
        order: 4,
        title: 'Post IAS 37 Warranty Provision Top-Up ($3,500)',
        workplaceTask: 'Quality control estimates $3,500 of additional probable warranty claims on 2025 shipments. Post Dr 5500 Warranty Expense / Cr 2200 Warranty Provisions.',
        accaChapter: 'Ch. 11 Provisions & Contingencies',
        ifrsRef: 'IAS 37',
        targetTab: 'ledger',
        actionLabel: 'Post Adjusting Journal',
        modelAnswer: 'Dr Warranty & Bank Expense (5500) $3,500 / Cr Warranty Provisions (2200) $3,500.',
        examConnection: 'IAS 37 requires recognising a provision when there is a present obligation from a past event, probable outflow (>50%), and reliable estimate.',
        backOnTrackJournal: {
          reference: 'ADJ-IAS37-WAR',
          date: '2025-12-31',
          description: 'IAS 37 year-end product warranty provision top-up',
          lines: [
            { accountCode: '5500', debit: 3500, credit: 0 },
            { accountCode: '2200', debit: 0, credit: 3500 }
          ]
        }
      },
      {
        id: 'mfg-5',
        order: 5,
        title: 'Verify Trial Balance Agreement',
        workplaceTask: 'Confirm the Manufacturing Trial Balance and Accounting Equation balance to $0 after all adjustments.',
        accaChapter: 'Ch. 14 Trial Balance',
        ifrsRef: 'Double-Entry Integrity',
        targetTab: 'ledger',
        actionLabel: 'Inspect Trial Balance',
        modelAnswer: 'Total Debits = Total Credits; Assets = Liabilities + Equity.',
        examConnection: 'Clean Trial Balance agreement is the mandatory gate before preparing statutory financial statements.'
      },
      {
        id: 'mfg-6',
        order: 6,
        title: 'Review IFRS 18 Statements, ROCE & Gearing',
        workplaceTask: 'Inspect the Statement of Financial Position and verify how the $100,000 Industrial Term Loan impacts Gearing and Finance Costs.',
        accaChapter: 'Ch. 12 & 18 Capital Structure & Ratios',
        ifrsRef: 'IFRS 18 & IAS 1',
        targetTab: 'statements',
        actionLabel: 'Review Financial Statements',
        modelAnswer: 'Review Gearing = Non-Current Liabilities / (Equity + Non-Current Liabilities) and ROCE = Operating Profit / Capital Employed.',
        examConnection: 'ACCA FA Chapter 18 frequently compares capital-intensive manufacturers (higher gearing & NCA) with asset-light service/SaaS firms.'
      }
    ]
  }
};

export function evaluateMissionSteps(snapshot: LiveCompanySnapshot): Record<string, boolean> {
  const mission = INTERNSHIP_MISSIONS[snapshot.slug];
  if (!mission) return {};

  const allBankReconciled =
    snapshot.bankTransactions.length > 0 &&
    snapshot.bankTransactions.every(tx => tx.status === 'RECONCILED');
  const hasNewInvoiceOrBill = snapshot.journals.some(j => j.sourceType === 'INVOICE' || j.sourceType === 'BILL');
  const hasDepreciationRun =
    snapshot.fixedAssets.some(a => a.lastDepYear === 2025) ||
    snapshot.journals.some(j => j.sourceType === 'DEPRECIATION');
  const hasManualAdjustment = snapshot.journals.some(j => j.sourceType === 'MANUAL');
  const isBalanced = snapshot.statements.isBalanced;

  const status: Record<string, boolean> = {};
  for (const step of mission.steps) {
    if (step.order === 1) status[step.id] = allBankReconciled;
    else if (step.order === 2) status[step.id] = hasNewInvoiceOrBill;
    else if (step.order === 3) status[step.id] = hasDepreciationRun;
    else if (step.order === 4) status[step.id] = hasManualAdjustment;
    else if (step.order === 5) status[step.id] = isBalanced && (allBankReconciled || hasDepreciationRun || hasManualAdjustment);
    else if (step.order === 6) status[step.id] = snapshot.statementsReviewed;
  }
  return status;
}
