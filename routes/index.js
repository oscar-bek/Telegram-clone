const authController = require("../controllers/auth.controller");

const router = require("express").Router();

// Auth routes
router.post("/auth/login", authController.login);
router.post("/auth/verify", authController.verify);

// User routes
router.get("/user/contacts", (req, res) => {
  res.json({ contacts: [] });
});

module.exports = router;
