const mongoose = require("mongoose");
const Comment = require("./comment.model");
const User = require("./user.model");

const photoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

photoSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "photo",
});

/**
 * Retire le post des favoris lors de sa suppression
 */
photoSchema.pre("remove", async function (next) {
    // const users = await User.find({});
    // users.forEach(async (user) => {
    //     const fav = user.saved_posts.filter(
    //         (post) => post.toString() !== this._id.toString()
    //     );
    //     if (fav.length !== user.saved_posts.length) {
    //         user.saved_posts = fav;
    //         await user.save();
    //     }
    // });
});

/**
 * Supprime des commentaires sur un post lors de sa suppression
 */
photoSchema.pre("remove", async function (next) {
    await Comment.deleteMany({ photo: this._id });

    next();
});

const Photo = mongoose.model("Photo", photoSchema);

module.exports = Photo;
