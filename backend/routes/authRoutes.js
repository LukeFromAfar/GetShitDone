const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyJwt = require("../middleware/verifyJwt");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", authController.logout);

router.get("/get-user", verifyJwt, authController.getUser);
router.delete("/delete-account", verifyJwt, authController.deleteAccount);

module.exports = router;