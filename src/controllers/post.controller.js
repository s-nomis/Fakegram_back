const fs = require("fs");
const Post = require("../models/post.model");

exports.create = async (req, res) => {
    if (!req.file) {
        return res.status(500).json({
            message: "Error when creating post : No file selected",
        });
    }

    try {
        const post = new Post({
            ...req.body,
            image: `${req.protocol}://${req.get("host")}/posts/${
                req.file.filename
            }`,
            owner: req.user._id,
        });

        await post.save();
        await post.populate("owner");

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({
            message: err,
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).populate("owner");

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const pagination = req.query.pagination
            ? parseInt(req.query.pagination)
            : 5;
        const pageNumber = req.query.page && parseInt(req.query.page);

        const posts = await Post.find({})
            .populate("owner")
            .populate({
                path: "comments",
                populate: { path: "owner" },
            })
            .sort({ createdAt: "desc" })
            .skip((pageNumber - 1) * pagination)
            .limit(pagination);

        if (!posts) {
            return res.status(404).json({
                message: "Posts not found",
            });
        }

        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.updateOne = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["title", "description"];

    const isValidUpdates = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValidUpdates) {
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
            message: "Invalid update fields!",
        });
    }

    try {
        const post = await Post.findOne({
            _id: req.params.postId,
            owner: req.user.id,
        });

        if (!post) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(404).json({
                message: "Post not found",
            });
        }

        if (req.file) {
            updates.push("image");

            const oldPost = post.image.split("/posts/")[1];
            fs.unlinkSync(`src/public/posts/${oldPost}`);
        }

        updates.forEach((update) => {
            if (update === "image") {
                post[update] = `${req.protocol}://${req.get("host")}/posts/${
                    req.file.filename
                }`;
            } else {
                post[update] = req.body[update];
            }
        });

        await post.save();
        await post.populate("owner");

        res.status(200).json(post);
    } catch (err) {
        fs.unlinkSync(req.file.path);
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.deleteOne = async (req, res) => {
    try {
        const post = await Post.findOne({
            _id: req.params.postId,
            owner: req.user._id,
        });

        if (!post) {
            return res.status(404).json({
                message: "Post not found",
            });
        }

        const filename = post.image.split("/posts/")[1];
        fs.unlinkSync(`src/public/posts/${filename}`);

        await post.remove();

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.toggleLikedPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId).populate("owner");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.likes.includes(req.user._id)) {
            //Remove from liked
            post.likes = post.likes.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            //Add to liked
            post.likes.push(req.user._id);
        }

        await post.save();

        res.status(200).json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.toggleSavedPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId).populate("owner");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.favorites.includes(req.user._id)) {
            //Remove from fav
            post.favorites = post.favorites.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            //Add to fav
            post.favorites.push(req.user._id);
        }

        await post.save();

        res.status(200).json(post);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.getMaxPostsLength = async (req, res) => {
    try {
        const nb = await Post.estimatedDocumentCount();

        res.status(200).json(nb);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
