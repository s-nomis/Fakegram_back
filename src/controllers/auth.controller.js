const User = require("../models/user.model");

exports.verifyToken = async (req, res) => {
    const token = req.user.generateAuthToken();

    res.status(200).json({ result: req.user, token });
};

exports.register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords don't match." });
        }

        const avatar = `${req.protocol}://${req.get(
            "host"
        )}/avatars/default-avatar.svg`;

        const user = new User({
            username,
            email,
            password,
            avatar,
        });

        await user.save();
        const token = user.generateAuthToken();

        res.status(200).json({ result: user, token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByCredentials(email, password);
        const token = user.generateAuthToken();

        res.status(200).json({ result: user, token });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

exports.logout = async (req, res) => {
    res.status(200).json("User successfully logged out");
};
