const express = require("express");

const auth = require("../middlewares/auth.middleware");
const { avatar } = require("../middlewares/multer.config");
const controller = require("../controllers/user.controller");

const router = new express.Router();

router.post("/register/username/:username", controller.isUsernameFree);
router.post("/register/email/:email", controller.isEmailFree);

router.get("/", auth, controller.getAllUsers);
router.get("/username/:username", auth, controller.getUserByUsername);

router.put("/:id", auth, controller.updateUser);
router.put(
    "/:id/avatar",
    avatar.single("avatar"),
    auth,
    controller.updateAvatar
);
router.put("/:id/password", auth, controller.updatePassword);

router.delete("/:id", auth, controller.deleteUser);

module.exports = router;
