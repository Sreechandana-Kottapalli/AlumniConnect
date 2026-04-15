const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../services/cloudinaryService");

// Cloudinary storage for resumes
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ncpl_alumni_connect/resumes",
    allowed_formats: ["pdf"],
    resource_type: "raw", // Required for non-image files (PDFs)
    public_id: (req, file) => {
      const timestamp = Date.now();
      const userId = req.user?._id || "unknown";
      return `resume_${userId}_${timestamp}`;
    },
  },
});

// File filter – only allow PDF
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
  storage: resumeStorage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
    files: 1,
  },
});

module.exports = { uploadResume };
