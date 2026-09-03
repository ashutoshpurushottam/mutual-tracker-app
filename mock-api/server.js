const express = require("express");
const cors = require("cors");
const { createStore } = require("./store");
const { createAuthRouter } = require("./routes/auth");
const { createInvestmentsRouter } = require("./routes/investments");
const { createFundsRouter } = require("./routes/funds");

const AUTH_PORT = Number(process.env.AUTH_PORT) || 8081;
const INV_PORT = Number(process.env.INV_PORT) || 8888;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

const store = createStore();

function applyCommon(app) {
  app.use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
}

const authApp = express();
applyCommon(authApp);
authApp.get("/health", (_req, res) => res.json({ ok: true, service: "auth" }));
authApp.use("/api/v1/auth", createAuthRouter(store));
authApp.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const invApp = express();
applyCommon(invApp);
invApp.get("/health", (_req, res) => res.json({ ok: true, service: "investments" }));
invApp.use(createInvestmentsRouter(store));
invApp.use(createFundsRouter());
invApp.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

authApp.listen(AUTH_PORT, () => {
  console.log(`[mock-api] Auth API listening on http://localhost:${AUTH_PORT}`);
  console.log(`           POST /api/v1/auth/signin | signup | logout | refresh`);
});

invApp.listen(INV_PORT, () => {
  console.log(`[mock-api] Investments API listening on http://localhost:${INV_PORT}`);
  console.log(`           GET  /users/:id/portfolios | /fund/search | /fund/:id`);
  console.log(`           Demo: demo@mutualtrack.com / password123`);
});
