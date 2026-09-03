const express = require("express");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

function createInvestmentsRouter(store) {
  const router = express.Router();

  const delay = (_req, _res, next) => {
    setTimeout(next, 50 + Math.floor(Math.random() * 100));
  };

  router.use(delay);

  router.get("/users/:userId/portfolios", (req, res) => {
    const portfolios = store.getPortfolios(req.params.userId);
    return res.json(portfolios);
  });

  router.post("/users/:userId/upload", upload.single("file"), (req, res) => {
    const result = store.simulateCamsUpload(req.params.userId);
    if (!result) return res.status(404).json({ message: "User not found" });
    // Frontend expects a string-ish response from axios; return JSON string message
    return res.json(result.message);
  });

  router.post("/users/:userId/investments", (req, res) => {
    const body = req.body;
    const rows = Array.isArray(body) ? body : body?.investments || [body];
    const created = store.addInvestments(req.params.userId, rows);
    if (!created) return res.status(404).json({ message: "User not found" });
    return res.status(201).json(created);
  });

  router.put("/users/:userId/investments/:id", (req, res) => {
    const updated = store.updateInvestment(req.params.userId, req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ message: "Investment not found" });
    return res.json(updated);
  });

  router.delete("/users/:userId/investments/:id", (req, res) => {
    const ok = store.deleteInvestment(req.params.userId, req.params.id);
    if (!ok) return res.status(404).json({ message: "Investment not found" });
    return res.json({ message: "Deleted" });
  });

  return router;
}

module.exports = { createInvestmentsRouter };
