const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
            minlength: 4,
            validate(v) {
                const regex = new RegExp("^[a-zA-Z][a-zA-Z0-9_.-]{3,19}$");
                if (!regex.test(v)) {
                    throw new Error("Username is invalid!");
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
                    throw new Error("Email is invalid!");
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
                    throw new Error("Phone is invalid!");
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
        saved_posts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Photo",
            },
        ],
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

const User = mongoose.model("User", userSchema);

module.exports = User;
