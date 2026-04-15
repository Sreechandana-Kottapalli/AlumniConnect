const multer = require("multer");

// Store files in memory so we can upload the buffer directly to Supabase Storage
const pdfFilter = (req, file, cb) => {
  if (
    file.mimetype === "application/pdf" ||
    file.originalname.toLowerCase().endsWith(".pdf")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed for resume upload."), false);
  }
};

const uploadResume = multer({
  storage: multer.memoryStorage(),
  fileFilter: pdfFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,
  },
});

module.exports = { uploadResume };
