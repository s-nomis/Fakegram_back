const express = require("express");

const auth = require("../middlewares/auth.middleware");
const { post } = require("../middlewares/multer.config");
const controller = require("../controllers/post.controller");

const router = new express.Router();

/**
 * TODO : ajout d'une sécurité sur certaines routes pour vérif
 * si la ressource appartient à l'utilisateur ou si il est admin
 */

router.post("/", auth, post.single("image"), controller.create);

router.get("/", controller.findAll);
router.get("/:postId", controller.findOne);
router.get("/count/max", controller.getMaxPostsLength);

router.put("/:postId", auth, post.single("image"), controller.updateOne);
router.put("/likes/:postId", auth, controller.toggleLikedPost);
router.put("/saved/:postId", auth, controller.toggleSavedPost);

router.delete("/:postId", auth, controller.deleteOne);

module.exports = router;
