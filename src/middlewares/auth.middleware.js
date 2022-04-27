const jwt = require("jsonwebtoken");

const User = require("../models/user.model");

const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decoded._id });
        if (!user) {
            return res.status(404).json("User not found");
        }

        req.user = user;

        next();
    } catch (err) {
        res.status(501).json({
            error: "Please authenticate.",
        });
    }
};

module.exports = auth;
