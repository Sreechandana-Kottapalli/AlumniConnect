const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { uploadResume } = require("../middleware/upload");
const { uploadLimiter } = require("../middleware/rateLimiter");
const { deleteFile } = require("../services/cloudinaryService");

// POST /api/upload/resume
// Upload a resume PDF to Cloudinary; returns the secure URL + public_id
router.post(
  "/resume",
  protect,
  uploadLimiter,
  (req, res, next) => {
    uploadResume.single("resume")(req, res, (err) => {
      if (err) {
        // Multer/Cloudinary errors
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 5 MB."
            : err.message || "File upload failed.";
        return res.status(400).json({ success: false, message });
      }
      next();
    });
  },
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    res.status(201).json({
      success: true,
      message: "Resume uploaded successfully.",
      data: {
        url: req.file.path,         // Cloudinary secure URL
        publicId: req.file.filename, // Cloudinary public_id
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  }
);

// DELETE /api/upload/resume/:publicId
// Remove an orphaned resume from Cloudinary (optional cleanup)
router.delete("/resume/:publicId", protect, async (req, res, next) => {
  try {
    const { publicId } = req.params;
    await deleteFile(decodeURIComponent(publicId), "raw");
    res.json({ success: true, message: "File deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
