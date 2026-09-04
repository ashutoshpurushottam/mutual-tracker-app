const { v4: uuidv4 } = require("uuid");
const { createSeedUsers, holdingFromScheme, CAMS_UPLOAD_SCHEME_IDS } = require("./data/users");
const { getScheme, schemes } = require("./data/schemes");
const { buildTransactionsForPortfolios } = require("./data/transactions");

function createStore() {
  const users = createSeedUsers();
  /** @type {Map<string, { userId: string, type: 'access'|'refresh' }>} */
  const tokens = new Map();

  function findUserByEmail(email) {
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  function findUserById(userId) {
    return users.find((u) => u.userId === userId);
  }

  function issueTokens(userId) {
    const accessToken = `atk_${uuidv4()}`;
    const refreshToken = `rtk_${uuidv4()}`;
    tokens.set(accessToken, { userId, type: "access" });
    tokens.set(refreshToken, { userId, type: "refresh" });
    return { accessToken, refreshToken };
  }

  function invalidateToken(token) {
    tokens.delete(token);
  }

  function resolveAccessToken(authHeader) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice(7);
    const entry = tokens.get(token);
    if (!entry || entry.type !== "access") return null;
    return entry;
  }

  function toUserProfile(user) {
    return {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin || new Date().toISOString(),
    };
  }

  function getPortfolios(userId) {
    const user = findUserById(userId);
    return user ? [...user.portfolios] : [];
  }

  function getTransactions(userId) {
    const user = findUserById(userId);
    if (!user) return null;
    return buildTransactionsForPortfolios(user.portfolios);
  }

  function addInvestments(userId, rows) {
    const user = findUserById(userId);
    if (!user) return null;

    const created = [];
    for (const row of rows) {
      const schemeName = (row.schemeName || "").toLowerCase();
      const fundHouse = (row.fundHouse || "").toLowerCase();
      const match =
        schemes.find(
          (s) =>
            s.schemeName.toLowerCase() === schemeName ||
            s.schemeName.toLowerCase().includes(schemeName) ||
            (fundHouse && s.amcName.toLowerCase().includes(fundHouse) && schemeName && s.schemeName.toLowerCase().includes(schemeName.split(" ")[0]))
        ) || schemes.find((s) => schemeName && s.schemeName.toLowerCase().includes(schemeName));

      let holding;
      if (match) {
        const invested = Number(row.investment) || 50000;
        holding = holdingFromScheme(userId, match.schemeId, {
          investedValue: invested,
          folioNumber: row.folioNumber || `MANUAL-${Date.now()}`,
        });
      } else {
        const invested = Number(row.investment) || 50000;
        const units = Number((invested / 50).toFixed(3));
        holding = {
          id: uuidv4(),
          userId,
          schemeName: row.schemeName || "Custom Scheme",
          amcName: row.fundHouse || "Unknown AMC",
          folioNumber: row.folioNumber || `MANUAL-${Date.now()}`,
          units,
          investedValue: invested,
          schemeCode: null,
          tradingsymbol: "CUSTOM",
          currentValue: Number((invested * 1.05).toFixed(2)),
          lastUpdateDate: new Date().toISOString().slice(0, 10),
          category: "Equity",
        };
      }
      user.portfolios.push(holding);
      created.push(holding);
    }
    return created;
  }

  function updateInvestment(userId, investmentId, patch) {
    const user = findUserById(userId);
    if (!user) return null;
    const idx = user.portfolios.findIndex((p) => p.id === investmentId);
    if (idx === -1) return null;
    user.portfolios[idx] = { ...user.portfolios[idx], ...patch, id: investmentId, userId };
    return user.portfolios[idx];
  }

  function deleteInvestment(userId, investmentId) {
    const user = findUserById(userId);
    if (!user) return false;
    const before = user.portfolios.length;
    user.portfolios = user.portfolios.filter((p) => p.id !== investmentId);
    return user.portfolios.length < before;
  }

  function simulateCamsUpload(userId) {
    const user = findUserById(userId);
    if (!user) return null;

    const existingCodes = new Set(user.portfolios.map((p) => p.schemeCode));
    const toAdd = CAMS_UPLOAD_SCHEME_IDS.filter((id) => !existingCodes.has(id)).slice(0, 3);
    const fallback = CAMS_UPLOAD_SCHEME_IDS.slice(0, 2);
    const ids = toAdd.length ? toAdd : fallback;

    const added = ids.map((schemeId, i) =>
      holdingFromScheme(userId, schemeId, {
        investedValue: 50000 + i * 25000,
        folioNumber: `CAMS-${schemeId}-${Date.now().toString().slice(-6)}`,
      })
    );
    user.portfolios.push(...added);
    return {
      message: `Processed CAMS report. Added ${added.length} holdings.`,
      addedCount: added.length,
      holdings: added,
    };
  }

  function signup({ email, password, username }) {
    if (findUserByEmail(email)) {
      const err = new Error("Email already registered");
      err.status = 409;
      throw err;
    }
    const user = {
      userId: `user-${uuidv4().slice(0, 8)}`,
      email,
      username: username || email.split("@")[0],
      fullName: username || email.split("@")[0],
      password,
      registrationDate: new Date().toISOString(),
      lastLogin: null,
      portfolios: [],
    };
    users.push(user);
    return user;
  }

  function signin(email, password) {
    const user = findUserByEmail(email);
    if (!user || user.password !== password) {
      const err = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }
    user.lastLogin = new Date().toISOString();
    const { accessToken, refreshToken } = issueTokens(user.userId);
    return {
      accessToken,
      refreshToken,
      userProfile: toUserProfile(user),
      tokenType: "BEARER",
    };
  }

  function changePassword(userId, oldPassword, newPassword) {
    const user = findUserById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    if (user.password !== oldPassword) {
      const err = new Error("Old password incorrect");
      err.status = 400;
      throw err;
    }
    user.password = newPassword;
    return { message: "Password updated" };
  }

  function refresh(refreshToken) {
    const entry = tokens.get(refreshToken);
    if (!entry || entry.type !== "refresh") {
      const err = new Error("Invalid refresh token");
      err.status = 401;
      throw err;
    }
    tokens.delete(refreshToken);
    const user = findUserById(entry.userId);
    if (!user) {
      const err = new Error("User not found");
      err.status = 404;
      throw err;
    }
    const issued = issueTokens(user.userId);
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      userProfile: toUserProfile(user),
      tokenType: "BEARER",
    };
  }

  return {
    users,
    findUserByEmail,
    findUserById,
    issueTokens,
    invalidateToken,
    resolveAccessToken,
    toUserProfile,
    getPortfolios,
    getTransactions,
    addInvestments,
    updateInvestment,
    deleteInvestment,
    simulateCamsUpload,
    signup,
    signin,
    changePassword,
    refresh,
  };
}

module.exports = { createStore };
