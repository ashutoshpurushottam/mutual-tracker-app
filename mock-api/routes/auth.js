const express = require("express");

function createAuthRouter(store) {
  const router = express.Router();

  const delay = (_req, _res, next) => {
    setTimeout(next, 50 + Math.floor(Math.random() * 100));
  };

  router.use(delay);

  router.post("/signup", (req, res) => {
    try {
      const { email, password, username } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const user = store.signup({ email, password, username });
      return res.status(201).json({
        message: "Registration successful",
        userId: user.userId,
        email: user.email,
      });
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  });

  router.post("/signin", (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }
      const payload = store.signin(email, password);
      return res.json(payload);
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  });

  router.post("/logout", (req, res) => {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token) store.invalidateToken(token);
    return res.json({ message: "Logged out" });
  });

  router.post("/change-password", (req, res) => {
    try {
      const entry = store.resolveAccessToken(req.headers.authorization);
      if (!entry) return res.status(401).json({ message: "Unauthorized" });
      const { oldPassword, newPassword } = req.body || {};
      if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "oldPassword and newPassword required" });
      }
      const result = store.changePassword(entry.userId, oldPassword, newPassword);
      return res.json(result);
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  });

  router.post("/refresh", (req, res) => {
    try {
      const { refreshToken } = req.body || {};
      if (!refreshToken) {
        return res.status(400).json({ message: "refreshToken required" });
      }
      return res.json(store.refresh(refreshToken));
    } catch (err) {
      return res.status(err.status || 500).json({ message: err.message });
    }
  });

  return router;
}

module.exports = { createAuthRouter };
