export interface AccountDef {
  code: string;
  name: string;
  category: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  subtype: string;
  normalSide: 'Dr' | 'Cr';
  openingDr: number;
  openingCr: number;
}

export interface JournalLineInput {
  accountCode: string;
  debit: number;
  credit: number;
}

export interface JournalEntryRecord {
  id: string;
  reference: string;
  date: string;
  description: string;
  sourceType: string;
  lines: JournalLineInput[];
}

export interface ComputedAccount extends AccountDef {
  entries: Array<{ reference: string; date: string; description: string; debit: number; credit: number }>;
  totalDr: number;
  totalCr: number;
  closingDr: number;
  closingCr: number;
  balance: number;
}

export interface FinancialStatements {
  revenue: number;
  cos: number;
  grossProfit: number;
  operatingExpenses: Array<{ code: string; name: string; amount: number }>;
  totalOpex: number;
  operatingProfit: number;
  investIncome: number;
  profitBeforeFinancing: number;
  financeCosts: number;
  netProfit: number;
  nonCurrentAssets: Array<{ name: string; cost: number; accumDep: number; nbv: number }>;
  totalNCA: number;
  currentAssets: Array<{ code: string; name: string; amount: number }>;
  totalCA: number;
  totalAssets: number;
  shareCapital: number;
  retainedEarningsOpen: number;
  retainedEarningsClose: number;
  totalEquity: number;
  nonCurrentLiabilities: Array<{ code: string; name: string; amount: number }>;
  totalNCL: number;
  currentLiabilities: Array<{ code: string; name: string; amount: number }>;
  totalCL: number;
  totalLiabilities: number;
  totalEquityAndLiabilities: number;
  isBalanced: boolean;
  ratios: {
    grossMargin: number;
    operatingMargin: number;
    roce: number;
    currentRatio: number;
    quickRatio: number;
    gearing: number;
  };
}

export interface BankFeedItem {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  status: 'UNMATCHED' | 'RECONCILED';
  matchedDocId?: string | null;
  matchedAccount?: string | null;
}

export interface OpenDocCandidate {
  id: string;
  type: 'INVOICE' | 'BILL';
  number: string;
  counterparty: string;
  totalAmount: number;
  status: 'OPEN' | 'PAID';
}

export interface AutoMatchSuggestion {
  bankTxId: string;
  docId: string;
  docNumber: string;
  docType: 'INVOICE' | 'BILL';
  counterparty: string;
  confidence: 'EXACT' | 'HIGH';
  reason: string;
}

export function validateJournalBalance(lines: JournalLineInput[]): { valid: boolean; totalDr: number; totalCr: number; error?: string } {
  const cleaned = lines.filter(l => (l.debit || 0) > 0 || (l.credit || 0) > 0);
  if (cleaned.length < 2) {
    return { valid: false, totalDr: 0, totalCr: 0, error: 'A double-entry journal requires at least 2 active lines.' };
  }
  const totalDr = Math.round(cleaned.reduce((s, l) => s + Number(l.debit || 0), 0) * 100) / 100;
  const totalCr = Math.round(cleaned.reduce((s, l) => s + Number(l.credit || 0), 0) * 100) / 100;
  if (Math.abs(totalDr - totalCr) > 0.005) {
    return { valid: false, totalDr, totalCr, error: `Debits ($${totalDr.toFixed(2)}) must equal Credits ($${totalCr.toFixed(2)}).` };
  }
  return { valid: true, totalDr, totalCr };
}

export function computeGeneralLedger(accounts: AccountDef[], journals: JournalEntryRecord[]): Record<string, ComputedAccount> {
  const map: Record<string, ComputedAccount> = {};

  for (const acc of accounts) {
    const entries: ComputedAccount['entries'] = [];
    if (acc.openingDr > 0) {
      entries.push({ reference: 'OPEN', date: '2025-01-01', description: 'Opening Balance b/f', debit: acc.openingDr, credit: 0 });
    }
    if (acc.openingCr > 0) {
      entries.push({ reference: 'OPEN', date: '2025-01-01', description: 'Opening Balance b/f', debit: 0, credit: acc.openingCr });
    }
    map[acc.code] = {
      ...acc,
      entries,
      totalDr: acc.openingDr,
      totalCr: acc.openingCr,
      closingDr: 0,
      closingCr: 0,
      balance: 0
    };
  }

  for (const j of journals) {
    for (const line of j.lines) {
      const target = map[line.accountCode];
      if (!target) continue;
      const dr = Number(line.debit || 0);
      const cr = Number(line.credit || 0);
      target.totalDr += dr;
      target.totalCr += cr;
      target.entries.push({ reference: j.reference, date: j.date, description: j.description, debit: dr, credit: cr });
    }
  }

  for (const acc of Object.values(map)) {
    const net = Math.round((acc.totalDr - acc.totalCr) * 100) / 100;
    acc.closingDr = net > 0 ? net : 0;
    acc.closingCr = net < 0 ? Math.abs(net) : 0;
    acc.balance = acc.normalSide === 'Dr' ? net : -net;
  }

  return map;
}

export function computeFinancialStatements(ledger: Record<string, ComputedAccount>): FinancialStatements {
  const all = Object.values(ledger);

  const revenue = all.filter(a => a.subtype === 'OP_INC').reduce((s, a) => s + a.balance, 0);
  const cos = all.filter(a => a.subtype === 'COS').reduce((s, a) => s + a.balance, 0);
  const grossProfit = revenue - cos;

  const operatingExpenses = all
    .filter(a => a.subtype === 'OPEX')
    .map(a => ({ code: a.code, name: a.name, amount: a.balance }));
  const totalOpex = operatingExpenses.reduce((s, e) => s + e.amount, 0);

  const operatingProfit = grossProfit - totalOpex;
  const investIncome = all.filter(a => a.subtype === 'INV_INC').reduce((s, a) => s + a.balance, 0);
  const profitBeforeFinancing = operatingProfit + investIncome;
  const financeCosts = all.filter(a => a.subtype === 'FIN').reduce((s, a) => s + a.balance, 0);
  const netProfit = profitBeforeFinancing - financeCosts;

  // Pair NCA Cost accounts (1100 -> 1110, 1120 -> 1130)
  const ncaCosts = all.filter(a => a.subtype === 'NCA');
  const nonCurrentAssets = ncaCosts.map(costAcc => {
    const accumCode = String(Number(costAcc.code) + 10);
    const accumAcc = ledger[accumCode];
    const accumDep = accumAcc ? accumAcc.balance : 0;
    return {
      name: costAcc.name.replace(/\s*-\s*Cost$/i, ''),
      cost: costAcc.balance,
      accumDep,
      nbv: costAcc.balance - accumDep
    };
  });
  const totalNCA = nonCurrentAssets.reduce((s, a) => s + a.nbv, 0);

  const currentAssets = all
    .filter(a => a.subtype === 'CA')
    .map(a => ({ code: a.code, name: a.name, amount: a.balance }));
  const totalCA = currentAssets.reduce((s, a) => s + a.amount, 0);
  const totalAssets = totalNCA + totalCA;

  const shareCapital = ledger['3000']?.balance ?? 0;
  const retainedEarningsOpen = ledger['3100']?.balance ?? 0;
  const retainedEarningsClose = retainedEarningsOpen + netProfit;
  const totalEquity = shareCapital + retainedEarningsClose;

  const nonCurrentLiabilities = all
    .filter(a => a.subtype === 'NCL')
    .map(a => ({ code: a.code, name: a.name, amount: a.balance }));
  const totalNCL = nonCurrentLiabilities.reduce((s, l) => s + l.amount, 0);

  const currentLiabilities = all
    .filter(a => a.subtype === 'CL')
    .map(a => ({ code: a.code, name: a.name, amount: a.balance }));
  const totalCL = currentLiabilities.reduce((s, l) => s + l.amount, 0);

  const totalLiabilities = totalNCL + totalCL;
  const totalEquityAndLiabilities = totalEquity + totalLiabilities;
  const isBalanced = Math.abs(totalAssets - totalEquityAndLiabilities) < 0.01;

  const inventory = ledger['1220']?.balance ?? 0;
  const capEmployed = totalEquity + totalNCL;

  return {
    revenue,
    cos,
    grossProfit,
    operatingExpenses,
    totalOpex,
    operatingProfit,
    investIncome,
    profitBeforeFinancing,
    financeCosts,
    netProfit,
    nonCurrentAssets,
    totalNCA,
    currentAssets,
    totalCA,
    totalAssets,
    shareCapital,
    retainedEarningsOpen,
    retainedEarningsClose,
    totalEquity,
    nonCurrentLiabilities,
    totalNCL,
    currentLiabilities,
    totalCL,
    totalLiabilities,
    totalEquityAndLiabilities,
    isBalanced,
    ratios: {
      grossMargin: revenue > 0 ? (grossProfit / revenue) * 100 : 0,
      operatingMargin: revenue > 0 ? (operatingProfit / revenue) * 100 : 0,
      roce: capEmployed > 0 ? (operatingProfit / capEmployed) * 100 : 0,
      currentRatio: totalCL > 0 ? totalCA / totalCL : 0,
      quickRatio: totalCL > 0 ? (totalCA - inventory) / totalCL : 0,
      gearing: capEmployed > 0 ? (totalNCL / capEmployed) * 100 : 0
    }
  };
}

export function calculateAnnualDepreciation(asset: {
  cost: number;
  residualValue: number;
  usefulLifeYrs: number;
  method: 'STRAIGHT_LINE' | 'REDUCING_BALANCE';
  ratePercent: number;
  accumulatedDep: number;
}): number {
  const nbv = Math.max(0, asset.cost - asset.accumulatedDep);
  if (nbv <= asset.residualValue) return 0;

  let charge = 0;
  if (asset.method === 'STRAIGHT_LINE') {
    charge = (asset.cost - asset.residualValue) / Math.max(1, asset.usefulLifeYrs);
  } else {
    charge = nbv * (asset.ratePercent / 100);
  }
  const capped = Math.min(charge, nbv - asset.residualValue);
  return Math.round(capped * 100) / 100;
}

export function suggestBankFeedMatches(
  bankTransactions: BankFeedItem[],
  openDocs: OpenDocCandidate[]
): Record<string, AutoMatchSuggestion> {
  const suggestions: Record<string, AutoMatchSuggestion> = {};
  const openOnly = openDocs.filter(d => d.status === 'OPEN');

  for (const tx of bankTransactions) {
    if (tx.status === 'RECONCILED') continue;
    const isInflow = tx.amount > 0;
    const absAmt = Math.abs(tx.amount);

    const match = openOnly.find(doc => {
      const sideMatches = (isInflow && doc.type === 'INVOICE') || (!isInflow && doc.type === 'BILL');
      const amtMatches = Math.abs(doc.totalAmount - absAmt) < 0.01;
      return sideMatches && amtMatches;
    });

    if (match) {
      const refMention =
        tx.reference.toLowerCase().includes(match.number.toLowerCase()) ||
        tx.description.toLowerCase().includes(match.counterparty.toLowerCase().split(' ')[0]);
      suggestions[tx.id] = {
        bankTxId: tx.id,
        docId: match.id,
        docNumber: match.number,
        docType: match.type,
        counterparty: match.counterparty,
        confidence: refMention ? 'EXACT' : 'HIGH',
        reason: refMention
          ? `Exact amount ($${absAmt.toLocaleString()}) & reference match to ${match.number}`
          : `Matching ${match.type.toLowerCase()} amount ($${absAmt.toLocaleString()}) for ${match.counterparty}`
      };
    }
  }
  return suggestions;
}
