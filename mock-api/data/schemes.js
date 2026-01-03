/**
 * Substantial fake Indian mutual fund catalog (~50 schemes)
 * with deterministic NAV history and period performance series.
 */

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Generate NAV history from inception to today.
 */
function generateNavHistory(schemeId, baseNav, annualReturnPct, inceptionYear) {
  const rand = seededRandom(hashString(schemeId));
  const inception = new Date(`${inceptionYear}-01-15T00:00:00Z`);
  const end = new Date("2026-09-01T00:00:00Z");
  const points = [];
  let nav = baseNav;
  let current = new Date(inception);

  while (current <= end) {
    points.push({ date: formatDate(current), nav: Number(nav.toFixed(4)) });
    const weeklyDrift = annualReturnPct / 100 / 52;
    const noise = (rand() - 0.48) * 0.015;
    nav = Math.max(1, nav * (1 + weeklyDrift + noise));
    current = addDays(current, 7);
  }
  return points;
}

function slicePerformance(navHistory, period) {
  if (!navHistory.length) return [];
  const end = new Date(navHistory[navHistory.length - 1].date);
  const daysMap = {
    "1M": 30,
    "3M": 90,
    "1Y": 365,
    "3Y": 365 * 3,
    "5Y": 365 * 5,
    SI: Infinity,
  };
  const days = daysMap[period] ?? Infinity;
  const start =
    days === Infinity
      ? new Date(navHistory[0].date)
      : addDays(end, -days);

  let sliced = navHistory.filter((p) => new Date(p.date) >= start);
  if (sliced.length < 2) return sliced.map((p) => ({ date: p.date, value: 100 }));

  // Downsample long series for chart readability
  const maxPoints = 120;
  if (sliced.length > maxPoints) {
    const step = Math.ceil(sliced.length / maxPoints);
    sliced = sliced.filter((_, i) => i % step === 0 || i === sliced.length - 1);
  }

  const base = sliced[0].nav;
  return sliced.map((p) => ({
    date: p.date,
    value: Number(((p.nav / base) * 100).toFixed(2)),
  }));
}

function computeReturns(navHistory) {
  const last = navHistory[navHistory.length - 1]?.nav ?? 1;
  const findAgo = (years) => {
    const target = addDays(new Date(navHistory[navHistory.length - 1].date), -365 * years);
    let best = navHistory[0];
    for (const p of navHistory) {
      if (new Date(p.date) <= target) best = p;
    }
    return best.nav;
  };
  const pct = (from) => Number((((last - from) / from) * 100).toFixed(2));
  return {
    oneYear: pct(findAgo(1)),
    threeYear: pct(findAgo(3)),
    fiveYear: pct(findAgo(5)),
  };
}

const RAW_SCHEMES = [
  // HDFC
  { schemeId: "HDFC001", schemeName: "HDFC Flexi Cap Fund - Direct Growth", amcName: "HDFC Mutual Fund", category: "Equity", tradingsymbol: "HDFCFLEXI", baseNav: 45.2, annualReturn: 14, inceptionYear: 2013, aumCr: 52000, expenseRatio: 0.75, riskLevel: "Very High" },
  { schemeId: "HDFC002", schemeName: "HDFC Mid-Cap Opportunities Fund - Direct Growth", amcName: "HDFC Mutual Fund", category: "Equity", tradingsymbol: "HDFCMID", baseNav: 28.5, annualReturn: 16, inceptionYear: 2014, aumCr: 58000, expenseRatio: 0.82, riskLevel: "Very High" },
  { schemeId: "HDFC003", schemeName: "HDFC Top 100 Fund - Direct Growth", amcName: "HDFC Mutual Fund", category: "Equity", tradingsymbol: "HDFCTOP100", baseNav: 82.1, annualReturn: 12, inceptionYear: 2012, aumCr: 31000, expenseRatio: 0.95, riskLevel: "High" },
  { schemeId: "HDFC004", schemeName: "HDFC Corporate Bond Fund - Direct Growth", amcName: "HDFC Mutual Fund", category: "Debt", tradingsymbol: "HDFCCORP", baseNav: 22.4, annualReturn: 6.5, inceptionYear: 2015, aumCr: 28000, expenseRatio: 0.35, riskLevel: "Low to Moderate" },
  { schemeId: "HDFC005", schemeName: "HDFC Balanced Advantage Fund - Direct Growth", amcName: "HDFC Mutual Fund", category: "Hybrid", tradingsymbol: "HDFCBAF", baseNav: 38.9, annualReturn: 11, inceptionYear: 2014, aumCr: 85000, expenseRatio: 0.78, riskLevel: "High" },
  { schemeId: "HDFC006", schemeName: "HDFC Index Fund Nifty 50 - Direct Plan", amcName: "HDFC Mutual Fund", category: "Index", tradingsymbol: "HDFCNIFTY", baseNav: 185.3, annualReturn: 11.5, inceptionYear: 2013, aumCr: 12000, expenseRatio: 0.2, riskLevel: "High" },
  // ICICI
  { schemeId: "ICICI001", schemeName: "ICICI Prudential Bluechip Fund - Direct Growth", amcName: "ICICI Prudential Mutual Fund", category: "Equity", tradingsymbol: "ICICIBLUE", baseNav: 72.4, annualReturn: 13, inceptionYear: 2013, aumCr: 48000, expenseRatio: 0.88, riskLevel: "High" },
  { schemeId: "ICICI002", schemeName: "ICICI Prudential Value Discovery Fund - Direct Growth", amcName: "ICICI Prudential Mutual Fund", category: "Equity", tradingsymbol: "ICICIVALUE", baseNav: 55.6, annualReturn: 14.5, inceptionYear: 2012, aumCr: 42000, expenseRatio: 0.92, riskLevel: "Very High" },
  { schemeId: "ICICI003", schemeName: "ICICI Prudential Technology Fund - Direct Growth", amcName: "ICICI Prudential Mutual Fund", category: "Equity", tradingsymbol: "ICICITECH", baseNav: 145.2, annualReturn: 18, inceptionYear: 2015, aumCr: 11000, expenseRatio: 0.95, riskLevel: "Very High" },
  { schemeId: "ICICI004", schemeName: "ICICI Prudential Short Term Fund - Direct Growth", amcName: "ICICI Prudential Mutual Fund", category: "Debt", tradingsymbol: "ICICIST", baseNav: 48.7, annualReturn: 6.8, inceptionYear: 2014, aumCr: 19000, expenseRatio: 0.4, riskLevel: "Low to Moderate" },
  { schemeId: "ICICI005", schemeName: "ICICI Prudential Equity & Debt Fund - Direct Growth", amcName: "ICICI Prudential Mutual Fund", category: "Hybrid", tradingsymbol: "ICICIENED", baseNav: 98.3, annualReturn: 12.5, inceptionYear: 2013, aumCr: 32000, expenseRatio: 0.85, riskLevel: "High" },
  { schemeId: "ICICI006", schemeName: "ICICI Prudential Nifty Next 50 Index Fund - Direct Growth", amcName: "ICICI Prudential Mutual Fund", category: "Index", tradingsymbol: "ICICINN50", baseNav: 52.1, annualReturn: 13, inceptionYear: 2016, aumCr: 5500, expenseRatio: 0.25, riskLevel: "Very High" },
  // SBI
  { schemeId: "SBI001", schemeName: "SBI Bluechip Fund - Direct Growth", amcName: "SBI Mutual Fund", category: "Equity", tradingsymbol: "SBIBLUE", baseNav: 68.9, annualReturn: 12.8, inceptionYear: 2013, aumCr: 45000, expenseRatio: 0.9, riskLevel: "High" },
  { schemeId: "SBI002", schemeName: "SBI Small Cap Fund - Direct Growth", amcName: "SBI Mutual Fund", category: "Equity", tradingsymbol: "SBISMALL", baseNav: 125.4, annualReturn: 17, inceptionYear: 2014, aumCr: 28000, expenseRatio: 0.78, riskLevel: "Very High" },
  { schemeId: "SBI003", schemeName: "SBI Magnum Midcap Fund - Direct Growth", amcName: "SBI Mutual Fund", category: "Equity", tradingsymbol: "SBIMID", baseNav: 95.2, annualReturn: 15.5, inceptionYear: 2013, aumCr: 18000, expenseRatio: 0.85, riskLevel: "Very High" },
  { schemeId: "SBI004", schemeName: "SBI Magnum Gilt Fund - Direct Growth", amcName: "SBI Mutual Fund", category: "Debt", tradingsymbol: "SBIGILT", baseNav: 55.8, annualReturn: 7.2, inceptionYear: 2014, aumCr: 8500, expenseRatio: 0.45, riskLevel: "Moderate" },
  { schemeId: "SBI005", schemeName: "SBI Equity Hybrid Fund - Direct Growth", amcName: "SBI Mutual Fund", category: "Hybrid", tradingsymbol: "SBIEHF", baseNav: 210.5, annualReturn: 11.8, inceptionYear: 2012, aumCr: 65000, expenseRatio: 0.8, riskLevel: "High" },
  { schemeId: "SBI006", schemeName: "SBI Nifty Index Fund - Direct Growth", amcName: "SBI Mutual Fund", category: "Index", tradingsymbol: "SBINIFTY", baseNav: 178.2, annualReturn: 11.4, inceptionYear: 2013, aumCr: 7200, expenseRatio: 0.18, riskLevel: "High" },
  // Axis
  { schemeId: "AXIS001", schemeName: "Axis Bluechip Fund - Direct Growth", amcName: "Axis Mutual Fund", category: "Equity", tradingsymbol: "AXISBLUE", baseNav: 48.6, annualReturn: 12.2, inceptionYear: 2014, aumCr: 34000, expenseRatio: 0.72, riskLevel: "High" },
  { schemeId: "AXIS002", schemeName: "Axis Midcap Fund - Direct Growth", amcName: "Axis Mutual Fund", category: "Equity", tradingsymbol: "AXISMID", baseNav: 82.3, annualReturn: 15.8, inceptionYear: 2014, aumCr: 26000, expenseRatio: 0.55, riskLevel: "Very High" },
  { schemeId: "AXIS003", schemeName: "Axis Small Cap Fund - Direct Growth", amcName: "Axis Mutual Fund", category: "Equity", tradingsymbol: "AXISSMALL", baseNav: 78.9, annualReturn: 18.5, inceptionYear: 2015, aumCr: 22000, expenseRatio: 0.52, riskLevel: "Very High" },
  { schemeId: "AXIS004", schemeName: "Axis Banking & PSU Debt Fund - Direct Growth", amcName: "Axis Mutual Fund", category: "Debt", tradingsymbol: "AXISBPSU", baseNav: 22.1, annualReturn: 6.4, inceptionYear: 2016, aumCr: 14000, expenseRatio: 0.32, riskLevel: "Low to Moderate" },
  { schemeId: "AXIS005", schemeName: "Axis Aggressive Hybrid Fund - Direct Growth", amcName: "Axis Mutual Fund", category: "Hybrid", tradingsymbol: "AXISAHF", baseNav: 24.8, annualReturn: 11.2, inceptionYear: 2017, aumCr: 1800, expenseRatio: 0.85, riskLevel: "High" },
  { schemeId: "AXIS006", schemeName: "Axis Nifty 100 Index Fund - Direct Growth", amcName: "Axis Mutual Fund", category: "Index", tradingsymbol: "AXISN100", baseNav: 18.5, annualReturn: 11.6, inceptionYear: 2019, aumCr: 1400, expenseRatio: 0.2, riskLevel: "High" },
  // Nippon
  { schemeId: "NIPP001", schemeName: "Nippon India Large Cap Fund - Direct Growth", amcName: "Nippon India Mutual Fund", category: "Equity", tradingsymbol: "NIPPLARGE", baseNav: 72.5, annualReturn: 13.2, inceptionYear: 2013, aumCr: 28000, expenseRatio: 0.78, riskLevel: "High" },
  { schemeId: "NIPP002", schemeName: "Nippon India Small Cap Fund - Direct Growth", amcName: "Nippon India Mutual Fund", category: "Equity", tradingsymbol: "NIPPSMALL", baseNav: 135.8, annualReturn: 19, inceptionYear: 2014, aumCr: 48000, expenseRatio: 0.72, riskLevel: "Very High" },
  { schemeId: "NIPP003", schemeName: "Nippon India Growth Fund - Direct Growth", amcName: "Nippon India Mutual Fund", category: "Equity", tradingsymbol: "NIPPGROWTH", baseNav: 285.4, annualReturn: 15, inceptionYear: 2012, aumCr: 30000, expenseRatio: 0.8, riskLevel: "Very High" },
  { schemeId: "NIPP004", schemeName: "Nippon India Liquid Fund - Direct Growth", amcName: "Nippon India Mutual Fund", category: "Debt", tradingsymbol: "NIPPLIQ", baseNav: 5200.1, annualReturn: 6.2, inceptionYear: 2013, aumCr: 35000, expenseRatio: 0.2, riskLevel: "Low" },
  { schemeId: "NIPP005", schemeName: "Nippon India Balanced Advantage Fund - Direct Growth", amcName: "Nippon India Mutual Fund", category: "Hybrid", tradingsymbol: "NIPPBAF", baseNav: 145.2, annualReturn: 11, inceptionYear: 2014, aumCr: 8500, expenseRatio: 0.55, riskLevel: "High" },
  // Mirae
  { schemeId: "MIRAE001", schemeName: "Mirae Asset Large Cap Fund - Direct Growth", amcName: "Mirae Asset Mutual Fund", category: "Equity", tradingsymbol: "MIRAELARGE", baseNav: 92.4, annualReturn: 13.5, inceptionYear: 2013, aumCr: 38000, expenseRatio: 0.55, riskLevel: "High" },
  { schemeId: "MIRAE002", schemeName: "Mirae Asset Emerging Bluechip Fund - Direct Growth", amcName: "Mirae Asset Mutual Fund", category: "Equity", tradingsymbol: "MIRAEEMERG", baseNav: 112.8, annualReturn: 16.2, inceptionYear: 2014, aumCr: 36000, expenseRatio: 0.6, riskLevel: "Very High" },
  { schemeId: "MIRAE003", schemeName: "Mirae Asset Midcap Fund - Direct Growth", amcName: "Mirae Asset Mutual Fund", category: "Equity", tradingsymbol: "MIRAEMID", baseNav: 28.5, annualReturn: 17.5, inceptionYear: 2018, aumCr: 15000, expenseRatio: 0.58, riskLevel: "Very High" },
  { schemeId: "MIRAE004", schemeName: "Mirae Asset Tax Saver Fund - Direct Growth", amcName: "Mirae Asset Mutual Fund", category: "Equity", tradingsymbol: "MIRAETAX", baseNav: 38.9, annualReturn: 14.8, inceptionYear: 2016, aumCr: 22000, expenseRatio: 0.58, riskLevel: "Very High" },
  { schemeId: "MIRAE005", schemeName: "Mirae Asset NYSE FANG+ ETF Fund of Fund - Direct Growth", amcName: "Mirae Asset Mutual Fund", category: "Equity", tradingsymbol: "MIRAEFANG", baseNav: 22.4, annualReturn: 20, inceptionYear: 2021, aumCr: 1800, expenseRatio: 0.55, riskLevel: "Very High" },
  // Parag Parikh
  { schemeId: "PPFAS001", schemeName: "Parag Parikh Flexi Cap Fund - Direct Growth", amcName: "PPFAS Mutual Fund", category: "Equity", tradingsymbol: "PPFASFLEXI", baseNav: 65.2, annualReturn: 16.5, inceptionYear: 2013, aumCr: 72000, expenseRatio: 0.62, riskLevel: "Very High" },
  { schemeId: "PPFAS002", schemeName: "Parag Parikh Conservative Hybrid Fund - Direct Growth", amcName: "PPFAS Mutual Fund", category: "Hybrid", tradingsymbol: "PPFASCHY", baseNav: 14.8, annualReturn: 8.5, inceptionYear: 2021, aumCr: 2200, expenseRatio: 0.45, riskLevel: "Moderate" },
  { schemeId: "PPFAS003", schemeName: "Parag Parikh ELSS Tax Saver Fund - Direct Growth", amcName: "PPFAS Mutual Fund", category: "Equity", tradingsymbol: "PPFASTAX", baseNav: 28.5, annualReturn: 15.2, inceptionYear: 2019, aumCr: 8500, expenseRatio: 0.65, riskLevel: "Very High" },
  // UTI
  { schemeId: "UTI001", schemeName: "UTI Nifty 50 Index Fund - Direct Growth", amcName: "UTI Mutual Fund", category: "Index", tradingsymbol: "UTINIFTY", baseNav: 145.6, annualReturn: 11.4, inceptionYear: 2015, aumCr: 16000, expenseRatio: 0.2, riskLevel: "High" },
  { schemeId: "UTI002", schemeName: "UTI Flexi Cap Fund - Direct Growth", amcName: "UTI Mutual Fund", category: "Equity", tradingsymbol: "UTIFLEXI", baseNav: 285.2, annualReturn: 12.5, inceptionYear: 2013, aumCr: 25000, expenseRatio: 0.85, riskLevel: "Very High" },
  { schemeId: "UTI003", schemeName: "UTI Mid Cap Fund - Direct Growth", amcName: "UTI Mutual Fund", category: "Equity", tradingsymbol: "UTIMID", baseNav: 195.4, annualReturn: 14.8, inceptionYear: 2014, aumCr: 11000, expenseRatio: 0.9, riskLevel: "Very High" },
  { schemeId: "UTI004", schemeName: "UTI Money Market Fund - Direct Growth", amcName: "UTI Mutual Fund", category: "Debt", tradingsymbol: "UTIMM", baseNav: 2650.3, annualReturn: 6.5, inceptionYear: 2014, aumCr: 14000, expenseRatio: 0.22, riskLevel: "Low to Moderate" },
  // Kotak
  { schemeId: "KOTAK001", schemeName: "Kotak Emerging Equity Fund - Direct Growth", amcName: "Kotak Mahindra Mutual Fund", category: "Equity", tradingsymbol: "KOTAKEMERG", baseNav: 98.5, annualReturn: 16.8, inceptionYear: 2014, aumCr: 42000, expenseRatio: 0.45, riskLevel: "Very High" },
  { schemeId: "KOTAK002", schemeName: "Kotak Flexicap Fund - Direct Growth", amcName: "Kotak Mahindra Mutual Fund", category: "Equity", tradingsymbol: "KOTAKFLEXI", baseNav: 72.8, annualReturn: 13.8, inceptionYear: 2013, aumCr: 48000, expenseRatio: 0.6, riskLevel: "Very High" },
  { schemeId: "KOTAK003", schemeName: "Kotak Equity Opportunities Fund - Direct Growth", amcName: "Kotak Mahindra Mutual Fund", category: "Equity", tradingsymbol: "KOTAKEOF", baseNav: 285.1, annualReturn: 14.2, inceptionYear: 2012, aumCr: 22000, expenseRatio: 0.55, riskLevel: "Very High" },
  { schemeId: "KOTAK004", schemeName: "Kotak Bond Short Term Fund - Direct Growth", amcName: "Kotak Mahindra Mutual Fund", category: "Debt", tradingsymbol: "KOTAKST", baseNav: 42.5, annualReturn: 6.6, inceptionYear: 2015, aumCr: 16000, expenseRatio: 0.35, riskLevel: "Low to Moderate" },
  { schemeId: "KOTAK005", schemeName: "Kotak Equity Hybrid Fund - Direct Growth", amcName: "Kotak Mahindra Mutual Fund", category: "Hybrid", tradingsymbol: "KOTAKEHF", baseNav: 52.8, annualReturn: 12, inceptionYear: 2015, aumCr: 5500, expenseRatio: 0.5, riskLevel: "High" },
  // Quant / Motilal / DSP
  { schemeId: "QUANT001", schemeName: "Quant Small Cap Fund - Direct Growth", amcName: "Quant Mutual Fund", category: "Equity", tradingsymbol: "QUANTSMALL", baseNav: 215.4, annualReturn: 22, inceptionYear: 2018, aumCr: 22000, expenseRatio: 0.65, riskLevel: "Very High" },
  { schemeId: "QUANT002", schemeName: "Quant Active Fund - Direct Growth", amcName: "Quant Mutual Fund", category: "Equity", tradingsymbol: "QUANTACTIVE", baseNav: 580.2, annualReturn: 19.5, inceptionYear: 2015, aumCr: 9500, expenseRatio: 0.7, riskLevel: "Very High" },
  { schemeId: "MOTIL001", schemeName: "Motilal Oswal Midcap Fund - Direct Growth", amcName: "Motilal Oswal Mutual Fund", category: "Equity", tradingsymbol: "MOTILMID", baseNav: 85.6, annualReturn: 18, inceptionYear: 2015, aumCr: 14000, expenseRatio: 0.6, riskLevel: "Very High" },
  { schemeId: "MOTIL002", schemeName: "Motilal Oswal Nasdaq 100 Fund of Fund - Direct Growth", amcName: "Motilal Oswal Mutual Fund", category: "Equity", tradingsymbol: "MOTILNQ100", baseNav: 42.8, annualReturn: 18.5, inceptionYear: 2019, aumCr: 7500, expenseRatio: 0.55, riskLevel: "Very High" },
  { schemeId: "DSP001", schemeName: "DSP Midcap Fund - Direct Growth", amcName: "DSP Mutual Fund", category: "Equity", tradingsymbol: "DSPMID", baseNav: 112.4, annualReturn: 15.2, inceptionYear: 2013, aumCr: 17000, expenseRatio: 0.75, riskLevel: "Very High" },
  { schemeId: "DSP002", schemeName: "DSP Nifty 50 Equal Weight Index Fund - Direct Growth", amcName: "DSP Mutual Fund", category: "Index", tradingsymbol: "DSPN50EW", baseNav: 22.5, annualReturn: 12.5, inceptionYear: 2019, aumCr: 1200, expenseRatio: 0.3, riskLevel: "High" },
  { schemeId: "DSP003", schemeName: "DSP Liquidity Fund - Direct Growth", amcName: "DSP Mutual Fund", category: "Debt", tradingsymbol: "DSPLIQ", baseNav: 3100.5, annualReturn: 6.1, inceptionYear: 2014, aumCr: 11000, expenseRatio: 0.15, riskLevel: "Low" },
];

function enrichScheme(raw) {
  const navHistory = generateNavHistory(
    raw.schemeId,
    raw.baseNav,
    raw.annualReturn,
    raw.inceptionYear
  );
  const returns = computeReturns(navHistory);
  const currentNav = navHistory[navHistory.length - 1].nav;

  return {
    schemeId: raw.schemeId,
    schemeName: raw.schemeName,
    amcName: raw.amcName,
    category: raw.category,
    tradingsymbol: raw.tradingsymbol,
    currentNav,
    aum: raw.aumCr * 10000000,
    expenseRatio: raw.expenseRatio,
    riskLevel: raw.riskLevel,
    inceptionYear: raw.inceptionYear,
    returns,
    navHistory,
    performance: {
      "1M": slicePerformance(navHistory, "1M"),
      "3M": slicePerformance(navHistory, "3M"),
      "1Y": slicePerformance(navHistory, "1Y"),
      "3Y": slicePerformance(navHistory, "3Y"),
      "5Y": slicePerformance(navHistory, "5Y"),
      SI: slicePerformance(navHistory, "SI"),
    },
  };
}

const schemes = RAW_SCHEMES.map(enrichScheme);
const schemesById = Object.fromEntries(schemes.map((s) => [s.schemeId, s]));

function searchSchemes(query) {
  const q = (query || "").trim().toLowerCase();
  if (!q) return schemes.slice(0, 20).map(toSearchResult);
  return schemes
    .filter(
      (s) =>
        s.schemeName.toLowerCase().includes(q) ||
        s.amcName.toLowerCase().includes(q) ||
        s.tradingsymbol.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.schemeId.toLowerCase().includes(q)
    )
    .map(toSearchResult);
}

function toSearchResult(s) {
  return { schemeId: s.schemeId, schemeName: s.schemeName };
}

function getScheme(schemeId) {
  return schemesById[schemeId] || null;
}

function getFundPerformancePayload(schemeId) {
  const s = getScheme(schemeId);
  if (!s) return null;
  return {
    schemeId: s.schemeId,
    schemeName: s.schemeName,
    amcName: s.amcName,
    category: s.category,
    ...s.performance,
  };
}

function getFundDetailsPayload(schemeId) {
  const s = getScheme(schemeId);
  if (!s) return null;
  return {
    schemeName: s.schemeName,
    amcName: s.amcName,
    category: s.category,
    nav: s.currentNav,
    aum: s.aum,
    expenseRatio: s.expenseRatio,
    riskLevel: s.riskLevel,
    returns: s.returns,
    historicalData: s.navHistory.slice(-24).map((p) => ({
      date: p.date,
      nav: p.nav,
    })),
  };
}

module.exports = {
  schemes,
  schemesById,
  searchSchemes,
  getScheme,
  getFundPerformancePayload,
  getFundDetailsPayload,
};
