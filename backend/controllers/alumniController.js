const Alumni = require("../models/Alumni");

/**
 * GET /api/alumni/search
 *
 * Query params:
 *   q            – full-text keyword search
 *   technology   – filter by technology (comma-separated for OR logic)
 *   company      – partial, case-insensitive
 *   jobRole      – partial, case-insensitive
 *   minExp       – minimum years of experience
 *   maxExp       – maximum years of experience
 *   availability – available | busy | not_available
 *   sortBy       – fullName | company | yearsOfExperience | createdAt (default)
 *   sortOrder    – asc | desc (default: desc)
 *   page         – page number (default: 1)
 *   limit        – results per page (default: 10, max: 50)
 */
const searchAlumni = async (req, res, next) => {
  try {
    const {
      q,
      technology,
      company,
      jobRole,
      minExp,
      maxExp,
      availability,
      sortBy    = "createdAt",
      sortOrder = "desc",
      page  = 1,
      limit = 10,
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const { rows: alumni, total } = await Alumni.search({
      q, technology, company, jobRole,
      minExp, maxExp, availability,
      sortBy, sortOrder, page: pageNum, limit: limitNum,
    });

    res.json({
      success: true,
      data: alumni,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages:  Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/alumni/:id
 */
const getAlumniById = async (req, res, next) => {
  try {
    const alumni = await Alumni.findById(req.params.id);
    if (!alumni) {
      return res.status(404).json({ success: false, message: "Alumni not found." });
    }
    res.json({ success: true, data: alumni });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/alumni/filters/options
 */
const getFilterOptions = async (req, res, next) => {
  try {
    const [technologies, companies, jobRoles] = await Promise.all([
      Alumni.getDistinctTechnologies(),
      Alumni.getDistinctCompanies(),
      Alumni.getDistinctJobRoles(),
    ]);

    res.json({
      success: true,
      data: {
        technologies,
        companies,
        jobRoles,
        availabilityStatuses: ["available", "busy", "not_available"],
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchAlumni, getAlumniById, getFilterOptions };
