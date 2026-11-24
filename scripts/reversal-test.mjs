/**
 * Verifies journal reversal semantics against a running server.
 * Run: node scripts/reversal-test.mjs   (server must be up on :3000)
 */
const BASE = 'http://localhost:3000';
let failures = 0;

function check(label, actual, expected) {
  const ok = String(actual) === String(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} -> ${actual}${ok ? '' : ` (expected ${expected})`}`);
}

async function main() {
  const email = `rev-${Date.now()}@example.com`;
  const reg = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Reversal Test', email, password: 'password123' })
  });
  check('register', reg.status, 201);
  const H = {
    'Content-Type': 'application/json',
    Cookie: (reg.headers.get('set-cookie') || '').split(';')[0]
  };

  const { companies } = await (await fetch(`${BASE}/api/companies`, { headers: H })).json();
  const c = companies[0];
  const cid = c.id;

  const post = async (path, body) => {
    const r = await fetch(`${BASE}/api/companies/${cid}${path}`, {
      method: 'POST', headers: H, body: JSON.stringify(body)
    });
    return { status: r.status, body: await r.json().catch(() => null) };
  };

  // ── 1. Manual journal, then reverse it ────────────────────────────
  const j = await post('/journals', {
    reference: 'ADJ-1', date: '2025-12-31', description: 'accrual',
    lines: [
      { accountCode: '5300', debit: 1450, credit: 0 },
      { accountCode: '2120', debit: 0, credit: 1450 }
    ]
  });
  check('post manual journal', j.status, 201);
  const jid = j.body.journal.id;

  const r1 = await post('/journals/reverse', { journalId: jid });
  check('reverse it', r1.status, 200);
  check('original now carries reversedBy', !!r1.body.original.reversedBy, 'true');
  check('contra carries reversalOf', r1.body.reversal.reversalOf, jid);
  check('contra sourceType', r1.body.reversal.sourceType, 'REVERSAL');

  // contra lines must be the exact swap
  const orig = j.body.journal.lines;
  const contra = r1.body.reversal.lines;
  const swapped = orig.every((l, i) =>
    Number(contra[i].debit) === Number(l.credit) && Number(contra[i].credit) === Number(l.debit)
  );
  check('contra is exact swap of original', swapped, 'true');

  // ── 2. Reversal is idempotent / not chainable ─────────────────────
  const r2 = await post('/journals/reverse', { journalId: jid });
  check('reverse same entry twice', r2.status, 409);

  const r3 = await post('/journals/reverse', { journalId: r1.body.reversal.id });
  check('reverse a reversal', r3.status, 409);

  // ── 3. Original is still visible (no hole in the audit trail) ─────
  const after = await (await fetch(`${BASE}/api/companies/${cid}`, { headers: H })).json();
  const refs = after.company.journals.map(x => x.reference);
  check('original still present', refs.includes('ADJ-1'), 'true');
  check('contra present', refs.includes('REV-ADJ-1'), 'true');

  // ledger must net to zero for those two entries
  const net = after.company.journals
    .filter(x => x.reference === 'ADJ-1' || x.reference === 'REV-ADJ-1')
    .flatMap(x => x.lines)
    .reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0);
  check('original + contra net to zero', net, 0);

  // ── 4. DELETE on journals must be gone ────────────────────────────
  const del = await fetch(`${BASE}/api/companies/${cid}/journals?journalId=${jid}`, {
    method: 'DELETE', headers: H
  });
  check('DELETE /journals removed (405/404)', [404, 405].includes(del.status) ? 'yes' : del.status, 'yes');

  // ── 5. Depreciation reversal restores the asset register ──────────
  const asset = c.fixedAssets[0];
  const depBefore = Number(asset.accumulatedDep);
  const d1 = await post('/assets', { assetId: asset.id, fiscalYear: 2025 });
  check('run depreciation', d1.status, 200);
  const charge = Number(d1.body.charge);

  const mid = await (await fetch(`${BASE}/api/companies/${cid}`, { headers: H })).json();
  const depJournal = mid.company.journals.find(x => x.reference === `DEP-${asset.assetTag}`);
  const dRev = await post('/journals/reverse', { journalId: depJournal.id });
  check('reverse depreciation', dRev.status, 200);

  const end = await (await fetch(`${BASE}/api/companies/${cid}`, { headers: H })).json();
  const assetAfter = end.company.fixedAssets.find(x => x.id === asset.id);
  check('accumulatedDep restored', Number(assetAfter.accumulatedDep), depBefore);
  check('lastDepYear cleared', assetAfter.lastDepYear, 'null');
  check('re-posting the same year works again',
    (await post('/assets', { assetId: asset.id, fiscalYear: 2025 })).status, 200);

  // ── 6. Invoice reversal puts the invoice back to OPEN ─────────────
  const inv = c.invoices.find(x => x.type === 'INVOICE' && x.status === 'OPEN');
  if (inv) {
    const created = await post('/invoices', {
      type: 'INVOICE', number: 'REV-T-1', counterparty: 'Reversal Corp',
      issueDate: '2025-12-30', dueDate: '2026-01-29',
      netAmount: 1000, taxRate: 20, accountCode: '4000'
    });
    check('create invoice', created.status, 201);

    const invJournal = (await (await fetch(`${BASE}/api/companies/${cid}`, { headers: H })).json())
      .company.journals.find(x => x.reference === 'REV-T-1');
    const iRev = await post('/journals/reverse', { journalId: invJournal.id });
    check('reverse invoice journal', iRev.status, 200);

    const docs = (await (await fetch(`${BASE}/api/companies/${cid}`, { headers: H })).json()).company.invoices;
    const doc = docs.find(x => x.number === 'REV-T-1');
    check('invoice status back to OPEN', doc.status, 'OPEN');
  }

  // ── 7. Cross-user reversal must be blocked ────────────────────────
  const reg2 = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Other', email: `other-${Date.now()}@example.com`, password: 'password123' })
  });
  const H2 = {
    'Content-Type': 'application/json',
    Cookie: (reg2.headers.get('set-cookie') || '').split(';')[0]
  };
  const cross = await fetch(`${BASE}/api/companies/${cid}/journals/reverse`, {
    method: 'POST', headers: H2, body: JSON.stringify({ journalId: jid })
  });
  check('cross-user reversal blocked', cross.status, 404);

  console.log(failures === 0 ? '\nALL REVERSAL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
