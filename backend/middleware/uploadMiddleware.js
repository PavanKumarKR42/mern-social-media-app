const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

// Ensure Cloudinary is configured
if (!cloudinary || !cloudinary.uploader) {
    console.error("❌ Cloudinary is not configured properly.");
    process.exit(1);
}

// Cloudinary storage for Posts
const postStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mern-social-media/posts",
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

// Cloudinary storage for Profile Pictures
const profileStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mern-social-media/profiles",  // ✅ Separate folder for profiles
        allowed_formats: ["jpg", "png", "jpeg"],
    },
});

// File type validation
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed!"), false);
    }
};

// Multer instances
const uploadPostImage = multer({
    storage: postStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter,
});

const uploadProfilePicture = multer({
    storage: profileStorage,
    limits: { fileSize: 2 * 1024 * 1024 }, // ✅ Lower size limit for profile pics
    fileFilter: fileFilter,
});

module.exports = {
    uploadPostImage,
    uploadProfilePicture
};
