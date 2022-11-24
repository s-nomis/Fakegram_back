const Comment = require("../models/comment.model");
const Post = require("../models/post.model");

exports.create = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const comment = new Comment({
            ...req.body,
            owner: req.user._id,
            post: req.params.postId,
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
            post: req.params.postId,
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
            post: req.params.postId,
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
            post: req.params.postId,
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
            post: req.params.postId,
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
