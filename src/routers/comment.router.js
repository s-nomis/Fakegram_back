const express = require("express");

const auth = require("../middlewares/auth.middleware");
const controller = require("../controllers/comment.controller");

const router = new express.Router();

/**
 * TODO : ajout d'une sécurité sur certaines routes pour vérif
 * si la ressource appartient à l'utilisateur ou si il est admin
 */

router.post("/:postId/comments", auth, controller.create);

router.get("/:postId/comments", auth, controller.findAll);
router.get("/:postId/comments/:commentId", auth, controller.findOne);

router.put("/:postId/comments/:commentId", auth, controller.updateOne);

router.delete("/:postId/comments/:commentId", auth, controller.deleteOne);

module.exports = router;
