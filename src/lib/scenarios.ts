import type { AccountDef } from './accounting-engine';

export interface ScenarioSeed {
  slug: string;
  name: string;
  industry: 'Retail' | 'SaaS' | 'Manufacturing';
  currency: string;
  fiscalYearEnd: string;
  description: string;
  accounts: AccountDef[];
  invoices: Array<{
    type: 'INVOICE' | 'BILL';
    number: string;
    counterparty: string;
    issueDate: string;
    dueDate: string;
    netAmount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    accountCode: string;
    status: 'OPEN' | 'PAID';
  }>;
  bankTransactions: Array<{
    date: string;
    description: string;
    reference: string;
    amount: number;
    status: 'UNMATCHED' | 'RECONCILED';
  }>;
  fixedAssets: Array<{
    assetTag: string;
    name: string;
    assetClass: string;
    costAccount: string;
    accumAccount: string;
    purchaseDate: string;
    cost: number;
    residualValue: number;
    usefulLifeYrs: number;
    method: 'STRAIGHT_LINE' | 'REDUCING_BALANCE';
    ratePercent: number;
    accumulatedDep: number;
  }>;
}

export const MULTI_COMPANY_SCENARIOS: ScenarioSeed[] = [
  {
    slug: 'meridian-retail',
    name: 'Meridian Retail Ltd',
    industry: 'Retail',
    currency: 'USD',
    fiscalYearEnd: '2025-12-31',
    description: 'Omnichannel consumer retail business. Practice IAS 2 inventory NRV write-downs, 20% sales tax invoicing, bank feed AR/AP matching, and IAS 16 vehicle depreciation.',
    accounts: [
      { code: '1100', name: 'Delivery Vehicles - Cost', category: 'Asset', subtype: 'NCA', normalSide: 'Dr', openingDr: 40000, openingCr: 0 },
      { code: '1110', name: 'Accum. Depr - Vehicles', category: 'Asset', subtype: 'NCA_Contra', normalSide: 'Cr', openingDr: 0, openingCr: 8000 },
      { code: '1120', name: 'Store Fixtures & POS - Cost', category: 'Asset', subtype: 'NCA', normalSide: 'Dr', openingDr: 25000, openingCr: 0 },
      { code: '1130', name: 'Accum. Depr - Fixtures', category: 'Asset', subtype: 'NCA_Contra', normalSide: 'Cr', openingDr: 0, openingCr: 5000 },
      { code: '1200', name: 'Cash at Bank', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 23530, openingCr: 0 },
      { code: '1210', name: 'Trade Receivables', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 18400, openingCr: 0 },
      { code: '1220', name: 'Inventory', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 14200, openingCr: 0 },
      { code: '1230', name: 'Prepayments', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 0, openingCr: 0 },
      { code: '2100', name: 'Trade Payables', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 14600 },
      { code: '2110', name: 'Sales Tax Control', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 2400 },
      { code: '2120', name: 'Accruals', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 1200 },
      { code: '2200', name: 'Provisions (Warranty)', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 0 },
      { code: '2300', name: 'Bank Loan (6% Long-Term)', category: 'Liability', subtype: 'NCL', normalSide: 'Cr', openingDr: 0, openingCr: 30000 },
      { code: '3000', name: 'Ordinary Share Capital', category: 'Equity', subtype: 'EQ', normalSide: 'Cr', openingDr: 0, openingCr: 50000 },
      { code: '3100', name: 'Retained Earnings b/f', category: 'Equity', subtype: 'EQ', normalSide: 'Cr', openingDr: 0, openingCr: 18230 },
      { code: '4000', name: 'Retail Sales Revenue', category: 'Income', subtype: 'OP_INC', normalSide: 'Cr', openingDr: 0, openingCr: 84500 },
      { code: '4100', name: 'Investment Income', category: 'Income', subtype: 'INV_INC', normalSide: 'Cr', openingDr: 0, openingCr: 500 },
      { code: '5000', name: 'Cost of Sales', category: 'Expense', subtype: 'COS', normalSide: 'Dr', openingDr: 62000, openingCr: 0 },
      { code: '5100', name: 'Salaries & Wages', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 24000, openingCr: 0 },
      { code: '5200', name: 'Insurance Expense', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 2400, openingCr: 0 },
      { code: '5300', name: 'Utilities & Store Ops', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 3100, openingCr: 0 },
      { code: '5400', name: 'Depreciation Expense', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 0, openingCr: 0 },
      { code: '5500', name: 'Bank Charges & Bad Debts', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 0, openingCr: 0 },
      { code: '5700', name: 'Finance Costs', category: 'Expense', subtype: 'FIN', normalSide: 'Dr', openingDr: 1800, openingCr: 0 }
    ],
    invoices: [
      { type: 'INVOICE', number: 'INV-2025-401', counterparty: 'Horizon Retail Partners', issueDate: '2025-12-15', dueDate: '2026-01-14', netAmount: 6000, taxRate: 20, taxAmount: 1200, totalAmount: 7200, accountCode: '4000', status: 'OPEN' },
      { type: 'BILL', number: 'BILL-882', counterparty: 'Summit Wholesale Supply', issueDate: '2025-12-18', dueDate: '2026-01-17', netAmount: 4500, taxRate: 0, taxAmount: 0, totalAmount: 4500, accountCode: '5000', status: 'OPEN' }
    ],
    bankTransactions: [
      { date: '2025-12-28', description: 'Wire Receipt — Horizon Retail Partners', reference: 'INV-2025-401', amount: 7200, status: 'UNMATCHED' },
      { date: '2025-12-29', description: 'ACH Payment — Summit Wholesale Supply', reference: 'BILL-882', amount: -4500, status: 'UNMATCHED' },
      { date: '2025-12-30', description: 'Monthly Merchant Bank Fee', reference: 'BANK-FEE-DEC', amount: -145, status: 'UNMATCHED' },
      { date: '2025-12-31', description: 'Standing Order — Commercial Insurance', reference: 'SO-INS-DEC', amount: -480, status: 'UNMATCHED' }
    ],
    fixedAssets: [
      { assetTag: 'FA-VEH-01', name: 'Electric Delivery Van #1', assetClass: 'Vehicles', costAccount: '1100', accumAccount: '1110', purchaseDate: '2024-01-01', cost: 40000, residualValue: 0, usefulLifeYrs: 5, method: 'STRAIGHT_LINE', ratePercent: 20, accumulatedDep: 8000 },
      { assetTag: 'FA-POS-02', name: 'Store POS & Shelving Suite', assetClass: 'Fixtures', costAccount: '1120', accumAccount: '1130', purchaseDate: '2024-01-01', cost: 25000, residualValue: 0, usefulLifeYrs: 5, method: 'REDUCING_BALANCE', ratePercent: 20, accumulatedDep: 5000 }
    ]
  },
  {
    slug: 'cloudpulse-saas',
    name: 'CloudPulse SaaS Inc.',
    industry: 'SaaS',
    currency: 'USD',
    fiscalYearEnd: '2025-12-31',
    description: 'B2B subscription software company. Practice IFRS 15 deferred revenue recognition, IAS 38 software development capitalisation & amortisation, and recurring SaaS billing.',
    accounts: [
      { code: '1100', name: 'Server Hardware - Cost', category: 'Asset', subtype: 'NCA', normalSide: 'Dr', openingDr: 60000, openingCr: 0 },
      { code: '1110', name: 'Accum. Depr - Servers', category: 'Asset', subtype: 'NCA_Contra', normalSide: 'Cr', openingDr: 0, openingCr: 15000 },
      { code: '1120', name: 'Capitalised Software (IAS 38) - Cost', category: 'Asset', subtype: 'NCA', normalSide: 'Dr', openingDr: 90000, openingCr: 0 },
      { code: '1130', name: 'Accum. Amort - Software', category: 'Asset', subtype: 'NCA_Contra', normalSide: 'Cr', openingDr: 0, openingCr: 18000 },
      { code: '1200', name: 'Cash at Bank', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 74500, openingCr: 0 },
      { code: '1210', name: 'Trade Receivables', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 28000, openingCr: 0 },
      { code: '1230', name: 'Prepaid Cloud Credits', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 4500, openingCr: 0 },
      { code: '2100', name: 'Trade Payables', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 11000 },
      { code: '2110', name: 'Sales Tax Control', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 0 },
      { code: '2120', name: 'Deferred Subscription Revenue (IFRS 15)', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 36000 },
      { code: '2300', name: 'Venture Debt (5% Facility)', category: 'Liability', subtype: 'NCL', normalSide: 'Cr', openingDr: 0, openingCr: 40000 },
      { code: '3000', name: 'Ordinary Share Capital', category: 'Equity', subtype: 'EQ', normalSide: 'Cr', openingDr: 0, openingCr: 100000 },
      { code: '3100', name: 'Retained Earnings b/f', category: 'Equity', subtype: 'EQ', normalSide: 'Cr', openingDr: 0, openingCr: 24000 },
      { code: '4000', name: 'Subscription Revenue', category: 'Income', subtype: 'OP_INC', normalSide: 'Cr', openingDr: 0, openingCr: 151500 },
      { code: '4100', name: 'Treasury Interest Income', category: 'Income', subtype: 'INV_INC', normalSide: 'Cr', openingDr: 0, openingCr: 1500 },
      { code: '5000', name: 'Cloud Hosting & Support COS', category: 'Expense', subtype: 'COS', normalSide: 'Dr', openingDr: 31000, openingCr: 0 },
      { code: '5100', name: 'Engineering & GTM Salaries', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 88000, openingCr: 0 },
      { code: '5300', name: 'R&D Research Expense (IAS 38)', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 19000, openingCr: 0 },
      { code: '5400', name: 'Depreciation & Amortisation', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 0, openingCr: 0 },
      { code: '5500', name: 'Payment Gateway & Bank Fees', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 0, openingCr: 0 },
      { code: '5700', name: 'Finance Costs', category: 'Expense', subtype: 'FIN', normalSide: 'Dr', openingDr: 2000, openingCr: 0 }
    ],
    invoices: [
      { type: 'INVOICE', number: 'SUB-2025-901', counterparty: 'Northstar FinTech Corp', issueDate: '2025-12-10', dueDate: '2026-01-09', netAmount: 12000, taxRate: 0, taxAmount: 0, totalAmount: 12000, accountCode: '4000', status: 'OPEN' },
      { type: 'BILL', number: 'AWS-DEC-25', counterparty: 'CloudScale Infrastructure', issueDate: '2025-12-20', dueDate: '2026-01-19', netAmount: 3800, taxRate: 0, taxAmount: 0, totalAmount: 3800, accountCode: '5000', status: 'OPEN' }
    ],
    bankTransactions: [
      { date: '2025-12-27', description: 'Stripe Payout — Northstar FinTech Corp', reference: 'SUB-2025-901', amount: 12000, status: 'UNMATCHED' },
      { date: '2025-12-29', description: 'Direct Debit — CloudScale Infrastructure', reference: 'AWS-DEC-25', amount: -3800, status: 'UNMATCHED' },
      { date: '2025-12-31', description: 'Treasury Money Market Interest', reference: 'INT-DEC-25', amount: 320, status: 'UNMATCHED' }
    ],
    fixedAssets: [
      { assetTag: 'SAAS-SRV-01', name: 'GPU Compute Cluster', assetClass: 'Hardware', costAccount: '1100', accumAccount: '1110', purchaseDate: '2024-01-01', cost: 60000, residualValue: 0, usefulLifeYrs: 4, method: 'STRAIGHT_LINE', ratePercent: 25, accumulatedDep: 15000 },
      { assetTag: 'SAAS-INT-02', name: 'Core Analytics Engine v2 (IAS 38)', assetClass: 'Intangibles', costAccount: '1120', accumAccount: '1130', purchaseDate: '2024-01-01', cost: 90000, residualValue: 0, usefulLifeYrs: 5, method: 'STRAIGHT_LINE', ratePercent: 20, accumulatedDep: 18000 }
    ]
  },
  {
    slug: 'atlas-manufacturing',
    name: 'Atlas Precision Manufacturing Co.',
    industry: 'Manufacturing',
    currency: 'USD',
    fiscalYearEnd: '2025-12-31',
    description: 'Industrial precision components manufacturer. Practice heavy IAS 16 plant depreciation, raw materials & WIP inventory, IAS 37 warranty provisions, and industrial receivables.',
    accounts: [
      { code: '1100', name: 'Factory Machinery - Cost', category: 'Asset', subtype: 'NCA', normalSide: 'Dr', openingDr: 180000, openingCr: 0 },
      { code: '1110', name: 'Accum. Depr - Machinery', category: 'Asset', subtype: 'NCA_Contra', normalSide: 'Cr', openingDr: 0, openingCr: 36000 },
      { code: '1120', name: 'Factory Building - Cost', category: 'Asset', subtype: 'NCA', normalSide: 'Dr', openingDr: 220000, openingCr: 0 },
      { code: '1130', name: 'Accum. Depr - Building', category: 'Asset', subtype: 'NCA_Contra', normalSide: 'Cr', openingDr: 0, openingCr: 22000 },
      { code: '1200', name: 'Cash at Bank', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 41200, openingCr: 0 },
      { code: '1210', name: 'Trade Receivables', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 52800, openingCr: 0 },
      { code: '1220', name: 'Inventory (Raw Materials & WIP)', category: 'Asset', subtype: 'CA', normalSide: 'Dr', openingDr: 64000, openingCr: 0 },
      { code: '2100', name: 'Trade Payables', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 48000 },
      { code: '2110', name: 'Sales Tax Control', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 0 },
      { code: '2200', name: 'Warranty Provisions (IAS 37)', category: 'Liability', subtype: 'CL', normalSide: 'Cr', openingDr: 0, openingCr: 12000 },
      { code: '2300', name: 'Industrial Term Loan (7%)', category: 'Liability', subtype: 'NCL', normalSide: 'Cr', openingDr: 0, openingCr: 100000 },
      { code: '3000', name: 'Ordinary Share Capital', category: 'Equity', subtype: 'EQ', normalSide: 'Cr', openingDr: 0, openingCr: 250000 },
      { code: '3100', name: 'Retained Earnings b/f', category: 'Equity', subtype: 'EQ', normalSide: 'Cr', openingDr: 0, openingCr: 71000 },
      { code: '4000', name: 'Industrial Sales Revenue', category: 'Income', subtype: 'OP_INC', normalSide: 'Cr', openingDr: 0, openingCr: 301000 },
      { code: '4100', name: 'Investment Income', category: 'Income', subtype: 'INV_INC', normalSide: 'Cr', openingDr: 0, openingCr: 2000 },
      { code: '5000', name: 'Cost of Goods Manufactured', category: 'Expense', subtype: 'COS', normalSide: 'Dr', openingDr: 195000, openingCr: 0 },
      { code: '5100', name: 'Factory & Admin Salaries', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 68000, openingCr: 0 },
      { code: '5300', name: 'Factory Power & Utilities', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 14000, openingCr: 0 },
      { code: '5400', name: 'Depreciation Expense', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 0, openingCr: 0 },
      { code: '5500', name: 'Warranty & Bank Expense', category: 'Expense', subtype: 'OPEX', normalSide: 'Dr', openingDr: 0, openingCr: 0 },
      { code: '5700', name: 'Finance Costs', category: 'Expense', subtype: 'FIN', normalSide: 'Dr', openingDr: 7000, openingCr: 0 }
    ],
    invoices: [
      { type: 'INVOICE', number: 'MFG-2025-312', counterparty: 'Apex Automotive Systems', issueDate: '2025-12-12', dueDate: '2026-01-11', netAmount: 22000, taxRate: 10, taxAmount: 2200, totalAmount: 24200, accountCode: '4000', status: 'OPEN' },
      { type: 'BILL', number: 'STL-5501', counterparty: 'Vanguard Alloy Metals', issueDate: '2025-12-19', dueDate: '2026-01-18', netAmount: 14800, taxRate: 0, taxAmount: 0, totalAmount: 14800, accountCode: '5000', status: 'OPEN' }
    ],
    bankTransactions: [
      { date: '2025-12-28', description: 'SWIFT Transfer — Apex Automotive Systems', reference: 'MFG-2025-312', amount: 24200, status: 'UNMATCHED' },
      { date: '2025-12-30', description: 'Wire Out — Vanguard Alloy Metals', reference: 'STL-5501', amount: -14800, status: 'UNMATCHED' },
      { date: '2025-12-31', description: 'Factory Grid Utility Direct Debit', reference: 'UTIL-DEC-25', amount: -2150, status: 'UNMATCHED' }
    ],
    fixedAssets: [
      { assetTag: 'MFG-CNC-01', name: '5-Axis CNC Milling Line', assetClass: 'Machinery', costAccount: '1100', accumAccount: '1110', purchaseDate: '2023-01-01', cost: 180000, residualValue: 10000, usefulLifeYrs: 10, method: 'REDUCING_BALANCE', ratePercent: 20, accumulatedDep: 36000 },
      { assetTag: 'MFG-BLD-02', name: 'Assembly Plant Building', assetClass: 'Buildings', costAccount: '1120', accumAccount: '1130', purchaseDate: '2021-01-01', cost: 220000, residualValue: 20000, usefulLifeYrs: 40, method: 'STRAIGHT_LINE', ratePercent: 2.5, accumulatedDep: 22000 }
    ]
  }
];
