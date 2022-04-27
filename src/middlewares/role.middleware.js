const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(404).json("User not found");
    }

    if (req.user.role !== "admin") {
        return res.status(401).json("Unauthorized");
    }

    next();
};

const ownerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(404).json("User not found");
    }

    if (req.user.id !== req.params.id && req.user.role !== "admin") {
        return res.status(401).json("Unauthorized");
    }

    next();
};

module.exports = {
    admin,
    ownerOrAdmin,
};
