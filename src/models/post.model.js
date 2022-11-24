const mongoose = require("mongoose");
const Comment = require("./comment.model");
const User = require("./user.model");

const postSchema = new mongoose.Schema(
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

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "post",
});

/**
 * Retire le post des favoris lors de sa suppression
 */
postSchema.pre("remove", async function (next) {
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
postSchema.pre("remove", async function (next) {
    await Comment.deleteMany({ post: this._id });

    next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
