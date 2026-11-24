import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('All 3 multi-company scenarios have balanced opening Trial Balances', () => {
  const src = fs.readFileSync(new URL('../scenarios.ts', import.meta.url), 'utf8');
  const scenarioBlocks = src.split("slug: '").slice(1);
  assert.equal(scenarioBlocks.length, 3, 'Expected 3 company scenarios (Retail, SaaS, Manufacturing)');

  for (const block of scenarioBlocks) {
    const slug = block.split("'")[0];
    const drMatches = [...block.matchAll(/openingDr:\s*(\d+)/g)].map(m => Number(m[1]));
    const crMatches = [...block.matchAll(/openingCr:\s*(\d+)/g)].map(m => Number(m[1]));
    const sumDr = drMatches.reduce((a, b) => a + b, 0);
    const sumCr = crMatches.reduce((a, b) => a + b, 0);
    assert.ok(sumDr > 0, `${slug} should have positive opening debits`);
    assert.equal(sumDr, sumCr, `${slug} opening Trial Balance mismatch: Dr ${sumDr} !== Cr ${sumCr}`);
  }
});

test('IAS 16 Straight-Line and Reducing Balance depreciation formulas are accurate', () => {
  const calc = ({ cost, residualValue, usefulLifeYrs, method, ratePercent, accumulatedDep }) => {
    const nbv = Math.max(0, cost - accumulatedDep);
    if (nbv <= residualValue) return 0;
    const raw = method === 'STRAIGHT_LINE' ? (cost - residualValue) / usefulLifeYrs : nbv * (ratePercent / 100);
    return Math.round(Math.min(raw, nbv - residualValue) * 100) / 100;
  };
  assert.equal(calc({ cost: 40000, residualValue: 0, usefulLifeYrs: 5, method: 'STRAIGHT_LINE', ratePercent: 20, accumulatedDep: 8000 }), 8000);
  assert.equal(calc({ cost: 25000, residualValue: 0, usefulLifeYrs: 5, method: 'REDUCING_BALANCE', ratePercent: 20, accumulatedDep: 5000 }), 4000);
});

test('All 3 Virtual Internship Missions define 6 guided close steps with balanced Back-on-Track journals', () => {
  const src = fs.readFileSync(new URL('../internship-missions.ts', import.meta.url), 'utf8');
  for (const slug of ['meridian-retail', 'cloudpulse-saas', 'atlas-manufacturing']) {
    assert.ok(src.includes(`'${slug}':`), `Missing mission for ${slug}`);
  }
  const stepOrders = [...src.matchAll(/order:\s*(\d+)/g)].map(m => Number(m[1]));
  assert.equal(stepOrders.length, 18, 'Expected 6 close steps x 3 companies = 18 steps');

  const botBlocks = src.split('backOnTrackJournal:').slice(1);
  assert.equal(botBlocks.length, 3, 'Expected 1 Back-on-Track adjusting journal per company');
  for (const block of botBlocks) {
    const chunk = block.split('}')[0] + block.split('}')[1] + block.split('}')[2];
    const drs = [...chunk.matchAll(/debit:\s*(\d+)/g)].map(m => Number(m[1]));
    const crs = [...chunk.matchAll(/credit:\s*(\d+)/g)].map(m => Number(m[1]));
    const sumDr = drs.reduce((a, b) => a + b, 0);
    const sumCr = crs.reduce((a, b) => a + b, 0);
    assert.ok(sumDr > 0, 'Back-on-Track journal must have positive debits');
    assert.equal(sumDr, sumCr, `Back-on-Track journal out of balance: Dr ${sumDr} !== Cr ${sumCr}`);
  }
});
