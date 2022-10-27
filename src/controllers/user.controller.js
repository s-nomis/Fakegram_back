const fs = require("fs");
const validator = require("validator");

const User = require("../models/user.model");

exports.isUsernameFree = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            //Pas d'utilisateur, donc le nom d'utilisateur est libre
            return res.status(200).json({
                message: "Free username",
                free_username: true,
            });
        }

        res.status(200).json({
            message: "Username is taken",
            free_username: false,
        });
    } catch (err) {
        res.status(500).json({
            message: err,
        });
    }
};

exports.isEmailFree = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });

        if (!user) {
            //Pas d'utilisateur, donc le nom d'utilisateur est libre
            return res.status(200).json({
                message: "Free email",
                free_email: true,
            });
        }

        res.status(200).json({
            message: "Email is taken",
            free_email: false,
        });
    } catch (err) {
        res.status(500).json({
            message: err,
        });
    }
};

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
        res.status(500).json({ message: err.message });
    }
};

exports.getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username,
        })
            .populate({
                path: "photos",
                populate: { path: "comments" },
            })
            .populate({
                path: "saved_posts",
                populate: { path: "comments" },
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        if (req.body.username) {
            const usernameRegex = new RegExp("^[a-zA-Z][a-zA-Z0-9_.-]{3,19}$");
            if (!usernameRegex.test(req.body.username)) {
                throw new Error("Le nom d'utilisateur est invalide.");
            }

            const user = await User.findOne({ username: req.body.username });
            if (user && user.email !== req.user.email) {
                throw new Error("Le nom d'utilisateur est déjà utilisé.");
            }
        }

        if (req.body.email) {
            if (!validator.isEmail(req.body.email)) {
                throw new Error("L'adresse email est invalide.");
            }

            const user = await User.findOne({ email: req.body.email });
            if (user && user.username !== req.user.username) {
                throw new Error("L'adresse email est déjà utilisée.");
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true }
        );

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate("photos");

        //Suppression de l'ancien avatar si ce n'est pas celui par defaut
        const oldAvatar = user.avatar;
        if (!oldAvatar.includes("default-avatar")) {
            //Suppression de l'ancien avatar si il existe, et que ce n'est pas celui par defaut
            fs.unlinkSync(
                `src/public/avatars/${oldAvatar.split("/avatars/")[1]}`
            );
        }

        if (!req.file) {
            //Retour à l'avatar par defaut
            user.avatar = `${req.protocol}://${req.get(
                "host"
            )}/avatars/default-avatar.svg`;
        } else {
            //Nouvel avatar
            user.avatar = `${req.protocol}://${req.get("host")}/avatars/${
                req.file.filename
            }`;
        }

        await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            message: err,
        });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res
                .status(404)
                .json({ message: "Utilisateur introuvable." });
        }

        const passwordMatch = await user.isPasswordCorrect(req.body.password);
        if (!passwordMatch) {
            return res
                .status(400)
                .json({ message: "Le mot de passe est incorrect." });
        }

        if (req.body.newPassword !== req.body.newPasswordConfirm) {
            return res.status(400).json({
                message:
                    "Le nouveau mot de passe et sa confirmation doivent être identiques.",
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        await user.remove();

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
