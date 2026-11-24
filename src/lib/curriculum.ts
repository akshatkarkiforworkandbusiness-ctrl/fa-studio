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

//
// The ACCA FA exam question bank (questions, marking key and worked
// solutions) moved to ./exam-bank.ts so that answers are never bundled into
// the client. It reaches the browser (answers stripped) via
// GET /api/exam/questions and is graded server-side by POST /api/exam/submit.
