const { v4: uuidv4 } = require("uuid");
const { getScheme } = require("./schemes");

function today() {
  return new Date().toISOString().slice(0, 10);
}

function holdingFromScheme(userId, schemeId, overrides = {}) {
  const scheme = getScheme(schemeId);
  if (!scheme) throw new Error(`Unknown scheme ${schemeId}`);

  const investedValue = overrides.investedValue ?? 100000;
  const units =
    overrides.units ??
    Number((investedValue / (scheme.currentNav * 0.85)).toFixed(3));
  const currentValue =
    overrides.currentValue ?? Number((units * scheme.currentNav).toFixed(2));

  return {
    id: overrides.id || uuidv4(),
    userId,
    schemeName: scheme.schemeName,
    amcName: scheme.amcName,
    folioNumber: overrides.folioNumber || `FOLIO-${schemeId.slice(-4)}-${userId.slice(0, 4).toUpperCase()}`,
    units,
    investedValue,
    schemeCode: scheme.schemeId,
    tradingsymbol: scheme.tradingsymbol,
    currentValue,
    lastUpdateDate: today(),
    category: scheme.category,
  };
}

const DEMO_USER_ID = "user-demo-001";
const EMPTY_USER_ID = "user-empty-001";
const ACTIVE_USER_ID = "user-active-002";

function createSeedUsers() {
  const demoHoldings = [
    holdingFromScheme(DEMO_USER_ID, "PPFAS001", {
      investedValue: 250000,
      folioNumber: "PPFAS-88421",
    }),
    holdingFromScheme(DEMO_USER_ID, "HDFC001", {
      investedValue: 180000,
      folioNumber: "HDFC-10293",
    }),
    holdingFromScheme(DEMO_USER_ID, "MIRAE002", {
      investedValue: 150000,
      folioNumber: "MIRAE-55401",
    }),
    holdingFromScheme(DEMO_USER_ID, "SBI002", {
      investedValue: 120000,
      folioNumber: "SBI-77821",
    }),
    holdingFromScheme(DEMO_USER_ID, "ICICI001", {
      investedValue: 200000,
      folioNumber: "ICICI-33410",
    }),
    holdingFromScheme(DEMO_USER_ID, "AXIS002", {
      investedValue: 90000,
      folioNumber: "AXIS-99102",
    }),
    holdingFromScheme(DEMO_USER_ID, "NIPP002", {
      investedValue: 75000,
      folioNumber: "NIPP-22018",
    }),
    holdingFromScheme(DEMO_USER_ID, "KOTAK001", {
      investedValue: 110000,
      folioNumber: "KOTAK-44102",
    }),
    holdingFromScheme(DEMO_USER_ID, "HDFC004", {
      investedValue: 300000,
      folioNumber: "HDFC-DEB-11",
    }),
    holdingFromScheme(DEMO_USER_ID, "SBI005", {
      investedValue: 160000,
      folioNumber: "SBI-HYB-09",
    }),
    holdingFromScheme(DEMO_USER_ID, "UTI001", {
      investedValue: 100000,
      folioNumber: "UTI-IDX-03",
    }),
  ];

  const activeHoldings = [
    holdingFromScheme(ACTIVE_USER_ID, "QUANT001", {
      investedValue: 80000,
      folioNumber: "QUANT-1001",
    }),
    holdingFromScheme(ACTIVE_USER_ID, "MOTIL002", {
      investedValue: 60000,
      folioNumber: "MOTIL-2002",
    }),
    holdingFromScheme(ACTIVE_USER_ID, "DSP001", {
      investedValue: 95000,
      folioNumber: "DSP-3003",
    }),
    holdingFromScheme(ACTIVE_USER_ID, "ICICI004", {
      investedValue: 200000,
      folioNumber: "ICICI-DEB-4",
    }),
  ];

  return [
    {
      userId: DEMO_USER_ID,
      email: "demo@mutualtrack.com",
      username: "demo",
      fullName: "Demo Investor",
      password: "password123",
      registrationDate: "2024-01-15T10:00:00Z",
      lastLogin: null,
      portfolios: demoHoldings,
    },
    {
      userId: EMPTY_USER_ID,
      email: "empty@mutualtrack.com",
      username: "empty",
      fullName: "Empty Portfolio User",
      password: "password123",
      registrationDate: "2024-06-01T10:00:00Z",
      lastLogin: null,
      portfolios: [],
    },
    {
      userId: ACTIVE_USER_ID,
      email: "active@mutualtrack.com",
      username: "active",
      fullName: "Active Trader",
      password: "password123",
      registrationDate: "2024-03-20T10:00:00Z",
      lastLogin: null,
      portfolios: activeHoldings,
    },
  ];
}

/** Schemes used when faking a CAMS upload parse */
const CAMS_UPLOAD_SCHEME_IDS = ["HDFC006", "ICICI005", "AXIS001", "SBI006"];

module.exports = {
  DEMO_USER_ID,
  EMPTY_USER_ID,
  ACTIVE_USER_ID,
  createSeedUsers,
  holdingFromScheme,
  CAMS_UPLOAD_SCHEME_IDS,
};
