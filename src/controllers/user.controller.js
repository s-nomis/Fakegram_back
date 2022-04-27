const Photo = require("../models/photo.model");
const User = require("../models/user.model");

//GET /users?username=username
exports.getAllUsers = async (req, res) => {
    const username = {};

    if (req.query.username) {
        username.search = req.query.username;
    }

    try {
        const users = await User.find({
            username: { $regex: `${username.search}`, $options: "i" },
        });

        res.status(200).json(users);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json("User not found");
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        })
            .populate("photos")
            .populate("saved_posts");

        if (!user) {
            return res.status(404).json("User not found");
        }

        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

exports.updateUser = async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
        "fullname",
        "username",
        "email",
        "website",
        "bio",
        "phone",
        "genre",
    ];

    const isValidUpdates = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if (!isValidUpdates) {
        return res.status(400).json({
            message: "Invalid updates!",
        });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isPasswordCorrect(req.body.password)) {
            return res.status(400).json({ message: "Password is not correct" });
        }

        if (req.body.newPassword !== req.body.newPasswordConfirm) {
            return res.status(400).json({ message: "Passwords must match" });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.toggleSavedPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const photo = await Photo.findById(postId);

        if (!photo) {
            return res.status(404).json({ message: "Post not found" });
        }

        const user = req.user;

        if (user.saved_posts.includes(postId)) {
            //Remove from fav
            user.saved_posts = user.saved_posts.filter(
                (post) => post.toString() !== postId
            );
        } else {
            //Add to fav
            user.saved_posts.push(postId);
        }

        await user.save();

        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};
