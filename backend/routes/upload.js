const express = require("express");
const router  = express.Router();
const { protect }                      = require("../middleware/auth");
const { uploadResume: uploadMiddleware } = require("../middleware/upload");
const { uploadLimiter }                = require("../middleware/rateLimiter");
const storageService                   = require("../services/storageService");

// POST /api/upload/resume
// Accepts a PDF (multipart/form-data field "resume"), uploads to Supabase Storage,
// and returns the public URL + storage path.
router.post(
  "/resume",
  protect,
  uploadLimiter,
  (req, res, next) => {
    uploadMiddleware.single("resume")(req, res, (err) => {
      if (err) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 5 MB."
            : err.message || "File upload failed.";
        return res.status(400).json({ success: false, message });
      }
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
      }

      const { url, path } = await storageService.uploadResume(
        req.file.buffer,
        req.user._id
      );

      res.status(201).json({
        success: true,
        message: "Resume uploaded successfully.",
        data: {
          url,
          publicId:     path,               // named "publicId" for frontend compatibility
          originalName: req.file.originalname,
          size:         req.file.size,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/upload/resume/:publicId
// Remove a resume from Supabase Storage (path is URL-encoded in the param).
router.delete("/resume/:publicId", protect, async (req, res, next) => {
  try {
    await storageService.deleteResume(decodeURIComponent(req.params.publicId));
    res.json({ success: true, message: "File deleted." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
