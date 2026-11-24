export interface StandardRef {
  code: string;
  title: string;
  chapter: string;
  category: 'Assets' | 'Statements' | 'Liabilities' | 'Groups';
  summary: string;
  practicalTip: string;
  examTip: string;
  url: string;
  extraUrl?: string;
  extraLabel?: string;
}

export const IFRS_STANDARDS: StandardRef[] = [
  {
    code: 'IFRS 18',
    title: 'Presentation and Disclosure in Financial Statements',
    chapter: 'Ch. 15 & Future Standard',
    category: 'Statements',
    summary: 'Issued April 2024 and effective 1 January 2027 (replaces IAS 1). Requires defined Operating, Investing, and Financing categories in the Statement of Profit or Loss, mandatory Operating Profit subtotal, and MPM disclosures.',
    practicalTip: 'Map your Chart of Accounts into Operating, Investing, and Financing buckets early so comparative reporting is seamless.',
    examTip: 'IFRS 18 changes presentation and disclosure—not how profit or assets are measured. Toggle the IFRS 18 view in Financial Statements!',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-18-presentation-and-disclosure-in-financial-statements/',
    extraUrl: 'https://www.accaglobal.com/gb/en/student/exam-support-resources/fundamentals-exams-study-resources/f7/technical-articles/ifrs-18.html',
    extraLabel: 'ACCA IFRS 18 Technical Article'
  },
  {
    code: 'IAS 2',
    title: 'Inventories',
    chapter: 'Ch. 5 (Inventory)',
    category: 'Assets',
    summary: 'Measure inventory at the lower of Cost and Net Realisable Value (NRV). Permitted cost formulas are FIFO and Weighted Average Cost; LIFO is prohibited.',
    practicalTip: 'Review slow-moving or damaged SKUs line-by-line at stocktake rather than in aggregate to capture NRV write-downs.',
    examTip: 'Include carriage inwards in inventory cost; expense carriage outwards as a distribution cost.',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-2-inventories/'
  },
  {
    code: 'IAS 16',
    title: 'Property, Plant and Equipment',
    chapter: 'Ch. 6 & 7 (Non-Current Assets)',
    category: 'Assets',
    summary: 'Capitalise purchase price plus directly attributable costs (delivery, installation, testing). Depreciate systematically over useful life using Straight-Line or Reducing Balance.',
    practicalTip: 'Maintain a Fixed Asset Register linking each asset tag to cost, accumulated depreciation, useful life, and carrying amount.',
    examTip: 'Revaluation surpluses go to Other Comprehensive Income (Equity), not Profit or Loss.',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-16-property-plant-and-equipment/'
  },
  {
    code: 'IAS 38',
    title: 'Intangible Assets',
    chapter: 'Ch. 8 (Intangibles)',
    category: 'Assets',
    summary: 'Expense all research costs as incurred. Capitalise development costs once all 6 technical & commercial feasibility criteria are met, then amortise over useful life.',
    practicalTip: 'In SaaS companies, track sprint hours separately for research vs. capitalisable product development.',
    examTip: 'Internally generated goodwill and brands are never capitalised.',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-38-intangible-assets/'
  },
  {
    code: 'IFRS 15',
    title: 'Revenue from Contracts with Customers',
    chapter: 'Ch. 15 (Revenue)',
    category: 'Statements',
    summary: 'Five-step model: identify contract, identify performance obligations, determine transaction price, allocate price, and recognise revenue as control transfers.',
    practicalTip: 'For annual SaaS subscriptions paid upfront, record Deferred Revenue (Contract Liability) and release 1/12th monthly.',
    examTip: 'Always exclude sales tax collected on behalf of tax authorities from revenue.',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-15-revenue-from-contracts-with-customers/'
  },
  {
    code: 'IAS 7',
    title: 'Statement of Cash Flows',
    chapter: 'Ch. 17 (Cash Flows)',
    category: 'Statements',
    summary: 'Splits cash flows into Operating, Investing, and Financing activities. Indirect method adjusts Operating Profit for non-cash items and working capital movements.',
    practicalTip: 'Monitor Operating Cash Flow alongside net profit to spot working-capital cash crunches early.',
    examTip: 'Increase in Receivables or Inventory = Cash Outflow (−); Increase in Payables = Cash Inflow (+).',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-7-statement-of-cash-flows/'
  },
  {
    code: 'IAS 37',
    title: 'Provisions, Contingent Liabilities & Contingent Assets',
    chapter: 'Ch. 11 (Provisions)',
    category: 'Liabilities',
    summary: 'Recognise a provision when there is a present obligation from a past event, probable outflow (>50%), and reliable estimate. Disclose possible obligations (≤50%) as contingent liabilities.',
    practicalTip: 'Review warranty claim rates and legal letters each quarter to update best estimates.',
    examTip: 'Never recognise contingent assets unless virtually certain.',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-37-provisions-contingent-liabilities-and-contingent-assets/'
  },
  {
    code: 'IAS 10',
    title: 'Events after the Reporting Period',
    chapter: 'Ch. 15 (Post-Year-End)',
    category: 'Liabilities',
    summary: 'Adjusting events confirm conditions existing at the reporting date (e.g., customer insolvency); non-adjusting events arise afterwards and are disclosed if material.',
    practicalTip: 'Maintain a post-balance-sheet review log until the Board authorises financial statements for issue.',
    examTip: 'Dividends proposed after year-end are non-adjusting events.',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ias-10-events-after-the-reporting-period/'
  },
  {
    code: 'IFRS 3 & IFRS 10',
    title: 'Business Combinations & Consolidated Financial Statements',
    chapter: 'Ch. 19 & 20 (Groups)',
    category: 'Groups',
    summary: 'IFRS 10 requires consolidating controlled subsidiaries line-by-line; IFRS 3 governs Goodwill = Consideration + NCI − Fair Value of Net Assets Acquired.',
    practicalTip: 'Eliminate 100% of intra-group balances and unrealised profit in inventory (PURP).',
    examTip: 'Check who sold the goods for PURP: Parent → Sub reduces Group RE only; Sub → Parent splits across Group RE and NCI.',
    url: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-10-consolidated-financial-statements/',
    extraUrl: 'https://www.ifrs.org/issued-standards/list-of-standards/ifrs-3-business-combinations/',
    extraLabel: 'IFRS 3 Standard'
  }
];

export const ACCA_EXAM_SECTION_A = [
  { id: 'Q1', topic: 'IAS 2 Inventory', q: 'An entity holds 500 units purchased at $18 each. They can now be sold for $19 each after $3/unit repackaging. What is the IAS 2 inventory value?', options: ['$9,000', '$8,000', '$9,500', '$7,500'], answer: 1, explanation: 'NRV = $19 − $3 = $16. Lower of Cost ($18) and NRV ($16) × 500 = $8,000.' },
  { id: 'Q2', topic: 'IAS 16 Depreciation', q: 'A machine cost $60,000 on 1 Jan 2024 (residual $6,000). At 25% reducing balance, what is the depreciation charge for 2025?', options: ['$15,000', '$11,250', '$10,125', '$10,800'], answer: 1, explanation: '2024 = 25% × $60,000 = $15,000 (NBV $45,000). 2025 = 25% × $45,000 = $11,250.' },
  { id: 'Q3', topic: 'Accruals', q: 'Opening electricity accrual $900, cash paid $7,400, closing accrual $1,150. What is the 2025 expense?', options: ['$7,150', '$7,650', '$9,450', '$7,400'], answer: 1, explanation: '$7,400 − $900 + $1,150 = $7,650.' },
  { id: 'Q4', topic: 'IAS 38 Intangibles', q: 'Research spend $120,000 + Development spend $250,000 ($180,000 incurred after criteria met). How much is expensed to P&L?', options: ['$120,000', '$190,000', '$370,000', '$70,000'], answer: 1, explanation: 'All research ($120k) + pre-criteria development ($70k) = $190,000 expensed.' },
  { id: 'Q5', topic: 'IAS 37 Provisions', q: 'A company faces a $100,000 lawsuit with a 35% probability of losing. How is it treated under IAS 37?', options: ['Recognise $100,000 provision', 'Recognise $35,000 provision', 'Disclose as contingent liability', 'Ignore completely'], answer: 2, explanation: '35% is possible (not probable >50%) → disclose as a contingent liability.' },
  { id: 'Q6', topic: 'Bank Reconciliation', q: 'Bank statement is $3,200 overdrawn; unpresented cheques $1,400; outstanding lodgements $2,100. Reconciled Cash Book balance?', options: ['$2,500 overdrawn', '$3,900 overdrawn', '$2,500 positive', '$6,700 overdrawn'], answer: 0, explanation: '−$3,200 + $2,100 − $1,400 = −$2,500 ($2,500 overdrawn).' },
  { id: 'Q7', topic: 'Suspense Accounts', q: 'A $225 credit purchase of stationery was debited to BOTH Stationery and Trade Payables. What journal clears Suspense?', options: ['Dr Suspense $450 / Cr Trade Payables $450', 'Dr Trade Payables $450 / Cr Suspense $450', 'Dr Suspense $225 / Cr Trade Payables $225', 'Dr Stationery $225 / Cr Payables $225'], answer: 0, explanation: 'Debiting Payables instead of crediting created a $450 Cr shortfall → Dr Suspense $450, Cr Payables $450.' },
  { id: 'Q8', topic: 'IAS 10 Events', q: 'Which post-year-end event is an ADJUSTING event under IAS 10?', options: ['Warehouse fire on 18 Jan', 'Customer owing $40k at year-end declared bankrupt on 20 Jan', 'Final dividend proposed on 15 Feb', 'Restructuring announced on 1 Feb'], answer: 1, explanation: 'Customer insolvency confirms the receivable was already impaired at year-end.' },
  { id: 'Q9', topic: 'IAS 7 Cash Flows', q: 'Operating Profit $95,000, Depreciation $18,000, Inventory increase $12,000, Payables increase $7,000. Cash generated from operations?', options: ['$108,000', '$118,000', '$94,000', '$132,000'], answer: 0, explanation: '$95k + $18k − $12k + $7k = $108,000.' },
  { id: 'Q10', topic: 'Ratios (Ch. 18)', q: 'Revenue $400,000, Gross Margin 30%, Closing Inventory $42,000. Inventory holding period (365 days)?', options: ['38.3 days', '54.8 days', '127.8 days', '46.5 days'], answer: 1, explanation: 'COS = $280,000. ($42,000 / $280,000) × 365 = 54.8 days.' }
];

export const ACCA_EXAM_SECTION_B = [
  { id: 'MTQ-1', label: '1. Goodwill at Acquisition (1 Jan 2025, Full Goodwill Method)', expected: 115000, marks: 3, working: '$420,000 + $95,000 − ($200,000 + $150,000 + $50,000) = $115,000.' },
  { id: 'MTQ-2', label: '2. Provision for Unrealised Profit (PURP) in Closing Inventory', expected: 4000, marks: 3, working: '50% × (25/125 × $40,000) = $4,000.' },
  { id: 'MTQ-3', label: '3. Non-Controlling Interest (NCI) as at 31 December 2025', expected: 111000, marks: 3, working: '$95,000 + 20% × $80,000 = $111,000.' },
  { id: 'MTQ-4', label: '4. Consolidated Group Retained Earnings as at 31 December 2025', expected: 370000, marks: 3, working: '$310,000 + 80% × $80,000 − $4,000 = $370,000.' },
  { id: 'MTQ-5', label: '5. Consolidated Trade Receivables as at 31 December 2025', expected: 135000, marks: 3, working: '$90,000 + $60,000 − $15,000 = $135,000.' }
];
