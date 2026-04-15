const Alumni = require("../models/Alumni");

/**
 * GET /api/alumni/search
 *
 * Query params:
 *   q            - full-text keyword search
 *   technology   - filter by technology (comma-separated for multiple)
 *   company      - filter by company name (case-insensitive partial match)
 *   jobRole      - filter by job role (case-insensitive partial match)
 *   minExp       - minimum years of experience
 *   maxExp       - maximum years of experience
 *   availability - filter by availability status (available | busy | not_available)
 *   sortBy       - field to sort by (default: createdAt)
 *   sortOrder    - asc | desc (default: desc)
 *   page         - page number (default: 1)
 *   limit        - results per page (default: 10, max: 50)
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
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {};

    // Full-text search
    if (q && q.trim()) {
      filter.$text = { $search: q.trim() };
    }

    // Technology filter – supports comma-separated values (OR logic)
    if (technology) {
      const techs = technology
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (techs.length > 0) {
        filter.technologies = {
          $in: techs.map((t) => new RegExp(t, "i")),
        };
      }
    }

    // Company filter – partial, case-insensitive
    if (company && company.trim()) {
      filter.company = { $regex: company.trim(), $options: "i" };
    }

    // Job role filter – partial, case-insensitive
    if (jobRole && jobRole.trim()) {
      filter.jobRole = { $regex: jobRole.trim(), $options: "i" };
    }

    // Experience range filter
    if (minExp !== undefined || maxExp !== undefined) {
      filter.yearsOfExperience = {};
      if (minExp !== undefined) filter.yearsOfExperience.$gte = Number(minExp);
      if (maxExp !== undefined) filter.yearsOfExperience.$lte = Number(maxExp);
    }

    // Availability status filter
    if (availability) {
      filter.availabilityStatus = availability;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sorting — whitelist allowed sort fields to prevent injection
    const allowedSortFields = [
      "fullName",
      "company",
      "yearsOfExperience",
      "createdAt",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortDir };

    // If text search is active, also include text score for relevance sort
    let projection = {};
    if (filter.$text) {
      projection = { score: { $meta: "textScore" } };
      sortOptions.score = { $meta: "textScore" };
    }

    const [alumni, total] = await Promise.all([
      Alumni.find(filter, projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Alumni.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: alumni,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
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
 * Get a single alumni profile by ID.
 */
const getAlumniById = async (req, res, next) => {
  try {
    const alumni = await Alumni.findById(req.params.id).lean();
    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found.",
      });
    }
    res.json({ success: true, data: alumni });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/alumni/filters/options
 * Return distinct values for filter dropdowns.
 */
const getFilterOptions = async (req, res, next) => {
  try {
    const [technologies, companies, jobRoles] = await Promise.all([
      Alumni.distinct("technologies"),
      Alumni.distinct("company"),
      Alumni.distinct("jobRole"),
    ]);

    res.json({
      success: true,
      data: {
        technologies: technologies.sort(),
        companies: companies.sort(),
        jobRoles: jobRoles.sort(),
        availabilityStatuses: ["available", "busy", "not_available"],
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { searchAlumni, getAlumniById, getFilterOptions };
