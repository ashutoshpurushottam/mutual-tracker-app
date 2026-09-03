const express = require("express");
const {
  searchSchemes,
  getFundPerformancePayload,
  getFundDetailsPayload,
  getScheme,
} = require("../data/schemes");

function createFundsRouter() {
  const router = express.Router();

  const delay = (_req, _res, next) => {
    setTimeout(next, 50 + Math.floor(Math.random() * 100));
  };

  router.use(delay);

  router.get("/fund/search", (req, res) => {
    const results = searchSchemes(req.query.query);
    return res.json(results);
  });

  router.get("/fund/:schemeId/details", (req, res) => {
    const details = getFundDetailsPayload(req.params.schemeId);
    if (!details) return res.status(404).json({ message: "Fund not found" });
    return res.json(details);
  });

  router.get("/fund/:schemeId", (req, res) => {
    const scheme = getScheme(req.params.schemeId);
    if (!scheme) return res.status(404).json({ message: "Fund not found" });
    const payload = getFundPerformancePayload(req.params.schemeId);
    return res.json(payload);
  });

  return router;
}

module.exports = { createFundsRouter };
