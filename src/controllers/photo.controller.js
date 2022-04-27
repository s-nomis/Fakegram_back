const fs = require("fs");
const Photo = require("../models/photo.model");

exports.create = async (req, res) => {
    if (!req.file) {
        return res.status(500).json({
            message: "Error when creating photo",
        });
    }

    try {
        const photo = new Photo({
            ...req.body,
            image: `${req.protocol}://${req.get("host")}/photos/${
                req.file.filename
            }`,
            owner: req.user._id,
        });

        await photo.save();
        res.status(201).json(photo);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: err,
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.photoId).populate(
            "owner"
        );

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found",
            });
        }

        res.status(200).json(photo);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const photos = await Photo.find({})
            .populate("owner")
            .populate({
                path: "comments",
                populate: { path: "owner" },
            });

        if (!photos) {
            return res.status(404).json({
                message: "Photos not found",
            });
        }

        res.status(200).json(photos);
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
        const photo = await Photo.findOne({
            _id: req.params.photoId,
            owner: req.user.id,
        });

        if (!photo) {
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(404).json({
                error: "Photo not found",
            });
        }

        if (req.file) {
            updates.push("image");

            const oldPhoto = photo.image.split("/photos/")[1];
            fs.unlinkSync(`src/public/photos/${oldPhoto}`);
        }

        updates.forEach((update) => {
            if (update === "image") {
                photo[update] = `${req.protocol}://${req.get("host")}/photos/${
                    req.file.filename
                }`;
            } else {
                photo[update] = req.body[update];
            }
        });

        await photo.save();
        res.status(200).json(photo);
    } catch (err) {
        fs.unlinkSync(req.file.path);
        res.status(500).json({
            message: err.message,
        });
    }
};

exports.deleteOne = async (req, res) => {
    try {
        const photo = await Photo.findOneAndDelete({
            _id: req.params.photoId,
            owner: req.user._id,
        });

        if (!photo) {
            return res.status(404).json({
                message: "Photo not found",
            });
        }

        const filename = photo.image.split("/photos/")[1];
        fs.unlinkSync(`src/public/photos/${filename}`);

        res.status(200).json(photo);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
};

/**
 * TODO: Vérif si le post est trouvé dans la bdd
 */
exports.toggleLikedPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const photo = await Photo.findById(postId).populate("owner");

        if (!photo) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (photo.likes.includes(req.user._id)) {
            //Remove from liked
            photo.likes = photo.likes.filter(
                (id) => id.toString() !== req.user._id.toString()
            );
        } else {
            //Add to liked
            photo.likes.push(req.user._id);
        }

        await photo.save();

        res.status(200).json(photo);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};
