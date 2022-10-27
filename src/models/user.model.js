const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const Comment = require("./comment.model");
const Photo = require("./photo.model");

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            trim: true,
            minlength: 4,
        },
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            minlength: 4,
            validate(v) {
                const regex = new RegExp("^[a-zA-Z][a-zA-Z0-9_.-]{3,19}$");
                if (!regex.test(v)) {
                    throw new Error("Le nom d'utilisateur est invalide.");
                }
            },
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate(v) {
                if (!validator.isEmail(v)) {
                    throw new Error("L'adresse email est invalide.");
                }
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: 6,
        },
        website: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            validate(v) {
                if (!validator.isMobilePhone(v)) {
                    throw new Error("Le numéro de téléphone est invalide.");
                }
            },
        },
        genre: {
            type: String,
            trim: true,
        },
        avatar: {
            type: String,
        },
        role: {
            type: String,
            default: "user",
            enum: ["user", "admin"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

userSchema.virtual("photos", {
    ref: "Photo",
    localField: "_id",
    foreignField: "owner",
});

userSchema.virtual("liked_posts", {
    ref: "Photo",
    localField: "_id",
    foreignField: "likes",
});

userSchema.virtual("saved_posts", {
    ref: "Photo",
    localField: "_id",
    foreignField: "favorites",
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid credentials.");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid credentials.");
    }

    return user;
};

userSchema.methods.isPasswordCorrect = async function (password) {
    const isMatch = await bcrypt.compare(password, this.password);

    return isMatch;
};

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign(
        { _id: this._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
    );

    return token;
};

userSchema.methods.toJSON = function () {
    const publicProfile = this.toObject();

    delete publicProfile.password;
    delete publicProfile.role;

    return publicProfile;
};

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        /**
         * Password validation ici plutot que lors de la définition du Schema pour que
         * la validation ne se fasse pas sur le password hashé puisque c'est inutile
         */
        const regex = new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[a-zA-Z0-9@$!%*?&]{6,}$"
        );

        if (!regex.test(this.password)) {
            throw new Error(
                "Password must contains at least one uppercase character, one lowercase character, one numeric character and one special character!"
            );
        }

        this.password = await bcrypt.hash(this.password, 8);
    }

    next();
});

/**
 * Supprime les posts sur d'un utilisateur lors de sa suppression
 */
userSchema.pre("remove", async function (next) {
    try {
        const photos = await Photo.find({ owner: this._id });
        photos.forEach(async (photo) => {
            const filename = photo.image.split("/photos/")[1];
            fs.unlinkSync(`src/public/photos/${filename}`);

            await photo.remove();
        });

        next();
    } catch (err) {
        console.log(err);
        return;
    }
});

/**
 * Supprime les commentaires d'un utilisateur lors de sa suppression
 */
userSchema.pre("remove", async function (next) {
    await Comment.deleteMany({ owner: this._id });

    next();
});

/**
 * Enleve le like aux post concerné lors de la suppression d'un utilisateur
 */
userSchema.pre("remove", async function (next) {
    const photos = await Photo.find({ likes: { $all: [this._id] } });
    photos.forEach(async (photo) => {
        photo.likes = photo.likes.filter(
            (id) => id.toString() !== this._id.toString()
        );
        await photo.save();
    });

    next();
});

/**
 * Enleve le favoris aux post concerné lors de la suppression d'un utilisateur
 */
userSchema.pre("remove", async function (next) {
    const photos = await Photo.find({ favorites: { $all: [this._id] } });
    photos.forEach(async (photo) => {
        photo.favorites = photo.favorites.filter(
            (id) => id.toString() !== this._id.toString()
        );
        await photo.save();
    });

    next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
