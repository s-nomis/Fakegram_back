const express = require('express');

const auth = require('../middlewares/auth.middleware');
const controller = require('../controllers/comment.controller');

const router = new express.Router();

//POST   /photos/:photoId/comments
//GET    /photos/:photoId/comments
//GET    /photos/:photoId/comments/:commentId
//PATCH  /photos/:photoId/comments/:commentId
//DELETE /photos/:photoId/comments/:commentId

router.post('/photos/:photoId/comments', auth, controller.create);
router.get('/photos/:photoId/comments', controller.findAll);
router.get('/photos/:photoId/comments/:commentId', controller.findOne);
router.patch('/photos/:photoId/comments/:commentId', auth, controller.updateOne);
router.delete('/photos/:photoId/comments/:commentId', auth, controller.deleteOne);

module.exports = router;