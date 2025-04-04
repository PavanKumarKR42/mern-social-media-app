const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

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
        allowed_formats: ["jpg", "png", "jpeg"], // Use allowed_formats instead of allowedFormats
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

// Multer upload instance (Cloudinary only)
const upload = multer({
    storage: cloudinaryStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
    fileFilter: fileFilter,
});

module.exports = upload;
