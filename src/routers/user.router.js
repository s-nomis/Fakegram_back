const express = require("express");

const auth = require("../middlewares/auth.middleware");
const { admin, ownerOrAdmin } = require("../middlewares/role.middleware");
const controller = require("../controllers/user.controller");

const router = new express.Router();

router.get("/", auth, auth, controller.getAllUsers);
router.get("/:id", auth, controller.getUserById);
router.get("/username/:username", auth, controller.getUserByUsername);

router.put("/:id", auth, ownerOrAdmin, controller.updateUser);
router.put("/:id/password", auth, ownerOrAdmin, controller.updatePassword);
router.put("/saved/:postId", auth, controller.toggleSavedPost);

router.delete("/:id", auth, ownerOrAdmin, controller.deleteUser);

module.exports = router;
