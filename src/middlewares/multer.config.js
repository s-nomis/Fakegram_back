const path = require('path');
const multer = require('multer');

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "jpg",
    "image/gif": "jpg",
};

const postStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/photos'));
    },
    filename: function(req, file, cb) {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = MIME_TYPES[file.mimetype];

        const filename = `${suffix}.${extension}`;

        cb(null, filename);
    }
});

const avatarStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/avatars'));
    },
    filename: function(req, file, cb) {
        const suffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = MIME_TYPES[file.mimetype];

        const filename = `${suffix}.${extension}`;

        cb(null, filename);
    }
})

const post = multer({ storage: postStorage });
const avatar = multer({ storage: avatarStorage });

module.exports = {
    post,
    avatar,
};