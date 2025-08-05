const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");

const router = require("express").Router();

// Auth routes
router.post("/auth/login", authController.login);
router.post("/auth/verify", authController.verify);

router.get("/user/messages/:contactId", userController.getMessages);

router.post("/user/create-message", userController.createMessage);

module.exports = router;
