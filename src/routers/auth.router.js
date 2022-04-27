const express = require("express");

const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/auth.controller");

const router = new express.Router();

router.get("/", auth, controller.getAuthUser);
router.post("/register", controller.register);
router.post("/login", controller.login);
router.post("/logout", auth, controller.logout);

module.exports = router;
