const express = require("express");
const {
  searchAlumni,
  getAlumniById,
  getFilterOptions,
} = require("../controllers/alumniController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All alumni routes require authentication
router.use(protect);

// GET /api/alumni/filters/options  — must be before /:id to avoid clash
router.get("/filters/options", getFilterOptions);

// GET /api/alumni/search
router.get("/search", searchAlumni);

// GET /api/alumni/:id
router.get("/:id", getAlumniById);

module.exports = router;
