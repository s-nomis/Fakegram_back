const express = require("express");

const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.config");
const controller = require("../controllers/photo.controller");

const router = new express.Router();

//POST   /photos
//GET    /photos
//GET    /photos/:photoId
//PUT  /photos/:photoId
//DELETE /photos/:photoId

router.post("/photos", auth, upload.single("image"), controller.create);
router.get("/photos", controller.findAll);
router.get("/photos/:photoId", controller.findOne);
router.put(
    "/photos/:photoId",
    auth,
    upload.single("image"),
    controller.updateOne
);
router.put("/photos/likes/:postId", auth, controller.toggleLikedPost);
router.delete("/photos/:photoId", auth, controller.deleteOne);

module.exports = router;
