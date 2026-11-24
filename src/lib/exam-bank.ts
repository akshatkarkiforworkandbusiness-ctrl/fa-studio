/**
 * Server-only ACCA FA question bank.
 *
 * Contains the marking key (`answer`, `expected`) and the worked solutions
 * (`explanation`, `working`). NONE of these may reach the browser — they are
 * served only through `/api/exam/questions`, which strips them, and consumed
 * by `/api/exam/submit` for grading.
 *
 * Keep this module out of client components: importing it anywhere in the
 * client graph would bundle the answers into the page source.
 */

export interface SectionAQuestion {
  id: string;
  topic: string;
  q: string;
  options: string[];
  /** Index of the correct option. Server-side only. */
  answer: number;
  /** Worked solution. Reveal only after submission. Server-side only. */
  explanation: string;
}

export interface SectionBTask {
  id: string;
  label: string;
  /** Mark value awarded for a correct figure. */
  marks: number;
  /** Correct figure. Server-side only. */
  expected: number;
  /** Worked solution. Reveal only after submission. Server-side only. */
  working: string;
}

/** Shape returned to the browser: no answers, no worked solutions. */
export interface PublicSectionAQuestion {
  id: string;
  topic: string;
  q: string;
  options: string[];
}

export interface PublicSectionBTask {
  id: string;
  label: string;
  marks: number;
}

export const ACCA_EXAM_SECTION_A: SectionAQuestion[] = [
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

export const ACCA_EXAM_SECTION_B: SectionBTask[] = [
  { id: 'MTQ-1', label: '1. Goodwill at Acquisition (1 Jan 2025, Full Goodwill Method)', expected: 115000, marks: 3, working: '$420,000 + $95,000 − ($200,000 + $150,000 + $50,000) = $115,000.' },
  { id: 'MTQ-2', label: '2. Provision for Unrealised Profit (PURP) in Closing Inventory', expected: 4000, marks: 3, working: '50% × (25/125 × $40,000) = $4,000.' },
  { id: 'MTQ-3', label: '3. Non-Controlling Interest (NCI) as at 31 December 2025', expected: 111000, marks: 3, working: '$95,000 + 20% × $80,000 = $111,000.' },
  { id: 'MTQ-4', label: '4. Consolidated Group Retained Earnings as at 31 December 2025', expected: 370000, marks: 3, working: '$310,000 + 80% × $80,000 − $4,000 = $370,000.' },
  { id: 'MTQ-5', label: '5. Consolidated Trade Receivables as at 31 December 2025', expected: 135000, marks: 3, working: '$90,000 + $60,000 − $15,000 = $135,000.' }
];

/** Max score for the full paper: 10 × 2-mark OTQs + 5 × 3-mark MTQ tasks. */
export const EXAM_MAX_SCORE = 35;
export const EXAM_PASS_MARK = 0.5;

/** Questions with the marking key and solutions removed — safe to send to a browser. */
export function publicExamQuestions() {
  return {
    sectionA: ACCA_EXAM_SECTION_A.map(({ answer: _a, explanation: _e, ...q }) => q),
    sectionB: ACCA_EXAM_SECTION_B.map(({ expected: _x, working: _w, ...t }) => t),
    maxScore: EXAM_MAX_SCORE,
    passMark: EXAM_PASS_MARK
  };
}
