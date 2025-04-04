const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");
const path = require("path");

// Ensure Cloudinary is configured
if (!cloudinary || !cloudinary.uploader) {
    console.error("❌ Cloudinary is not configured properly.");
    process.exit(1);
}

// Cloudinary storage configuration
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mern-social-media/posts",
        allowedFormats: ["jpg", "png", "jpeg"],
    },
});

// Local disk storage configuration
const localStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Save files in "uploads" directory
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
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

// Choose storage type based on environment
const storageType = process.env.USE_CLOUDINARY === "true" ? cloudinaryStorage : localStorage;

// Multer upload instance
const upload = multer({
    storage: storageType,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
    fileFilter: fileFilter,
});

module.exports = upload;
