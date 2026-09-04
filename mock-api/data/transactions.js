const { getScheme } = require("./schemes");

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

function seededRandom(seed) {
  let s = seed % 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function addMonths(dateStr, months) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function navOnOrBefore(scheme, dateStr) {
  if (!scheme?.navHistory?.length) return 50;
  const target = new Date(dateStr);
  let best = scheme.navHistory[0];
  for (const point of scheme.navHistory) {
    if (new Date(point.date) <= target) best = point;
    else break;
  }
  return best.nav;
}

/**
 * Build a deterministic fake ledger for a holding:
 * initial purchase + monthly SIPs + occasional redemption.
 */
function transactionsForHolding(holding) {
  const rand = seededRandom(hashString(holding.id || holding.schemeCode || holding.schemeName));
  const scheme = holding.schemeCode ? getScheme(holding.schemeCode) : null;
  const startYear = 2023 + Math.floor(rand() * 2);
  const startMonth = 1 + Math.floor(rand() * 6);
  const startDate = `${startYear}-${String(startMonth).padStart(2, "0")}-05`;
  const sipAmount = Math.max(2000, Math.round((holding.investedValue / 24) / 500) * 500);
  const purchaseAmount = Math.max(sipAmount * 3, Math.round(holding.investedValue * 0.35));

  const txns = [];
  const push = (partial) => {
    const nav = navOnOrBefore(scheme, partial.date);
    const units = Number((partial.amount / nav).toFixed(3));
    txns.push({
      id: `${holding.id}-${partial.type}-${partial.date}-${txns.length}`,
      userId: holding.userId,
      holdingId: holding.id,
      schemeCode: holding.schemeCode,
      schemeName: holding.schemeName,
      amcName: holding.amcName,
      folioNumber: holding.folioNumber,
      type: partial.type,
      amount: Number(partial.amount.toFixed(2)),
      units,
      nav: Number(nav.toFixed(4)),
      date: partial.date,
      notes: partial.notes,
    });
  };

  push({
    type: "PURCHASE",
    amount: purchaseAmount,
    date: startDate,
    notes: "Initial lump-sum",
  });

  const sipMonths = 8 + Math.floor(rand() * 10);
  for (let i = 1; i <= sipMonths; i++) {
    push({
      type: "SIP",
      amount: sipAmount,
      date: addMonths(startDate, i),
      notes: "Monthly SIP instalment",
    });
  }

  if (rand() > 0.55) {
    push({
      type: "REDEMPTION",
      amount: sipAmount * (1 + Math.floor(rand() * 3)),
      date: addMonths(startDate, sipMonths - 1),
      notes: "Partial redemption",
    });
  }

  if (rand() > 0.75) {
    push({
      type: "SWITCH_OUT",
      amount: sipAmount,
      date: addMonths(startDate, Math.max(3, sipMonths - 3)),
      notes: "Switch out",
    });
    push({
      type: "SWITCH_IN",
      amount: sipAmount,
      date: addMonths(startDate, Math.max(3, sipMonths - 3)),
      notes: "Switch in (paired)",
    });
  }

  return txns;
}

function buildTransactionsForPortfolios(portfolios) {
  const all = [];
  for (const holding of portfolios) {
    all.push(...transactionsForHolding(holding));
  }
  return all.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

module.exports = {
  transactionsForHolding,
  buildTransactionsForPortfolios,
};
