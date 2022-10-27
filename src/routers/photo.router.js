const express = require("express");

const auth = require("../middlewares/auth.middleware");
const { post } = require("../middlewares/multer.config");
const controller = require("../controllers/photo.controller");

const router = new express.Router();

/**
 * TODO : ajout d'une sécurité sur certaines routes pour vérif
 * si la ressource appartient à l'utilisateur ou si il est admin
 */

router.post("/photos", auth, post.single("image"), controller.create);

router.get("/photos", controller.findAll);
router.get("/photos/:photoId", controller.findOne);
router.get("/photos/count/max", controller.getMaxPostsLength);

router.put(
    "/photos/:photoId",
    auth,
    post.single("image"),
    controller.updateOne
);
router.put("/photos/likes/:postId", auth, controller.toggleLikedPost);
router.put("/photos/saved/:postId", auth, controller.toggleSavedPost);

router.delete("/photos/:photoId", auth, controller.deleteOne);

module.exports = router;
