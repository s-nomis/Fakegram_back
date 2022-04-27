const Comment = require("../models/comment.model");
const Photo = require("../models/photo.model");

exports.create = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.photoId);

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found",
            });
        }

        const comment = new Comment({
            ...req.body,
            owner: req.user._id,
            photo: req.params.photoId,
        });

        await comment.save();
        await comment.populate("owner");

        res.status(201).json(comment);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const comments = await Comment.find({
            photo: req.params.photoId,
        }).populate("owner");

        res.status(200).json(comments);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            photo: req.params.photoId,
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comments not found",
            });
        }

        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.updateOne = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["content"];

    const isValidUpdates = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValidUpdates) {
        return res.status(400).json({
            message: "Invalid updates!",
        });
    }

    try {
        const comment = await Comment.findOne({
            _id: req.params.commentId,
            owner: req.user._id,
            photo: req.params.photoId,
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        updates.forEach((update) => {
            comment[update] = req.body[update];
        });

        await comment.save();
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.deleteOne = async (req, res) => {
    try {
        const comment = await Comment.findOneAndDelete({
            _id: req.params.commentId,
            owner: req.user._id,
            photo: req.params.photoId,
        });

        if (!comment) {
            return res.status(404).json({
                message: "Comment not found",
            });
        }

        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};
