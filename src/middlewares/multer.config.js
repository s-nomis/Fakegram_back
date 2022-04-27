const path = require('path');
const multer = require('multer');

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "jpg",
    "image/gif": "jpg",
};

const storage = multer.diskStorage({
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

const upload = multer({ storage });

module.exports = upload;