const BASE = 'http://localhost:3000';

async function main() {
  const email = `node-${Date.now()}@example.com`;

  const reg = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Node Verify', email, password: 'password123' })
  });
  console.log('register        ->', reg.status, '(expect 201)');

  const setCookie = reg.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];
  console.log('cookie flags    ->', setCookie.includes('Secure') ? 'Secure' : 'no-Secure',
              setCookie.includes('HttpOnly') ? 'HttpOnly' : '');

  const H = { Cookie: cookie };

  const coRes = await fetch(`${BASE}/api/companies`, { headers: H });
  const { companies } = await coRes.json();
  const c = companies[0];
  console.log('companies       ->', coRes.status, `(expect 200) name=${c.name} accounts=${c.accounts.length}`);

  // money must arrive as numbers
  const amt = c.bankTransactions[0].amount;
  const opening = c.accounts[0].openingDr;
  console.log('money types     ->', `bank.amount=${typeof amt} (${amt})`, `openingDr=${typeof opening} (${opening})`, '(expect number)');

  const cid = c.id;
  const post = (path, body) => fetch(`${BASE}/api/companies/${cid}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...H }, body: JSON.stringify(body)
  }).then(async r => ({ status: r.status, body: await r.json().catch(() => null) }));

  // 1. ghost account rejected
  const ghost = await post('/journals', { reference: 'G', date: '2025-12-31', description: 'x',
    lines: [{ accountCode: '9999-NOPE', debit: 500, credit: 0 }, { accountCode: '2120', debit: 0, credit: 500 }] });
  console.log('ghost account   ->', ghost.status, `(expect 400) ${ghost.body?.error?.slice(0, 60)}`);

  // 2. bank amount mismatch rejected
  const tx = c.bankTransactions.find(t => t.amount > 0);
  const doc = c.invoices.find(d => Math.abs(Math.abs(d.totalAmount) - Math.abs(tx.amount)) >= 0.005);
  if (tx && doc) {
    const mm = await post('/bank-feed', { bankTxId: tx.id, mode: 'MATCH_DOC', docId: doc.id });
    console.log('amount mismatch ->', mm.status, `(expect 400) ${mm.body?.error?.slice(0, 70)}`);
  }

  // 3. double depreciation rejected
  const a = c.fixedAssets[0].id;
  const d1 = await post('/assets', { assetId: a, fiscalYear: 2025 });
  const d2 = await post('/assets', { assetId: a, fiscalYear: 2025 });
  console.log('dep #1 / #2     ->', d1.status, '/', d2.status, '(expect 200 / 409)');

  // 4. correct-amount bank match still works
  const txOk = c.bankTransactions.find(t => t.amount > 0);
  const docOk = c.invoices.find(d => d.type === 'INVOICE' && Math.abs(Math.abs(d.totalAmount) - Math.abs(txOk.amount)) < 0.005);
  if (txOk && docOk) {
    const ok = await post('/bank-feed', { bankTxId: txOk.id, mode: 'MATCH_DOC', docId: docOk.id });
    console.log('valid match     ->', ok.status, `(expect 200) doc=${docOk.number}`);
  } else {
    console.log('valid match     -> skipped (no exact pair in seed)');
  }

  // 5. exam: questions stripped, submit returns solutions
  const pq = await (await fetch(`${BASE}/api/exam/questions`)).json();
  const leaks = ['answer', 'expected', 'explanation', 'working'].filter(k => JSON.stringify(pq).includes(`"${k}"`));
  console.log('exam leak check ->', leaks.length ? `LEAK ${leaks}` : 'clean (no answer keys)', `questions=${pq.sectionA.length}`);

  const sub = await (await fetch(`${BASE}/api/exam/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answersA: { Q1: 1 }, answersB: {} })
  })).json();
  console.log('exam submit     ->', `score=${sub.totalScore}/${sub.maxScore}`, `solutions=${!!sub.solutions}`, '(expect solutions present)');

  // 6. logout invalidates the cookie
  await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: H });
  const after = await fetch(`${BASE}/api/companies`, { headers: H });
  console.log('after logout    ->', after.status, '(expect 401)');
}

main().catch(e => { console.error('FATAL', e); process.exit(1); });
