const path = require("path");
const multer = require("multer");
const fs = require("fs");

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "jpg",
    "image/gif": "jpg",
};

const postStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(path.join(__dirname, "../public/posts"))) {
            fs.mkdirSync(path.join(__dirname, "../public/posts"));
        }

        cb(null, path.join(__dirname, "../public/posts"));
    },
    filename: function (req, file, cb) {
        const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = MIME_TYPES[file.mimetype];

        const filename = `${suffix}.${extension}`;

        cb(null, filename);
    },
});

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (!fs.existsSync(path.join(__dirname, "../public/avatars"))) {
            fs.mkdirSync(path.join(__dirname, "../public/avatars"));
        }

        cb(null, path.join(__dirname, "../public/avatars"));
    },
    filename: function (req, file, cb) {
        const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = MIME_TYPES[file.mimetype];

        const filename = `${suffix}.${extension}`;

        cb(null, filename);
    },
});

const post = multer({ storage: postStorage });
const avatar = multer({ storage: avatarStorage });

module.exports = {
    post,
    avatar,
};
