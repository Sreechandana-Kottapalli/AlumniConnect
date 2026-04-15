/**
 * Alumni model – Supabase/PostgreSQL implementation.
 * All snake_case DB columns are normalised back to camelCase with `_id`
 * so every controller and frontend consumer continues to work unchanged.
 */
const supabase = require("../config/supabase");

// ── Row → app shape ───────────────────────────────────────────────────────────
const mapAlumni = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    fullName: row.full_name,
    email: row.email,
    company: row.company,
    jobRole: row.job_role,
    technologies: row.technologies || [],
    yearsOfExperience: row.years_of_experience,
    linkedinProfile: row.linkedin_profile || "",
    availabilityStatus: row.availability_status,
    profilePhoto: row.profile_photo || "",
    batch: row.batch || null,
    location: row.location || null,
    bio: row.bio || null,
    domain: row.domain || null,
    avatarInitials: row.avatar_initials || null,
    avatarColor: row.avatar_color || "#1A3C6E",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

// ── findById ──────────────────────────────────────────────────────────────────
const findById = async (id) => {
  const { data, error } = await supabase
    .from("alumni")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return mapAlumni(data);
};

// ── findByEmail ───────────────────────────────────────────────────────────────
// Returns all alumni profiles whose email matches (used by referral controller
// to resolve incoming requests for the current user).
const findByEmail = async (email) => {
  const { data, error } = await supabase
    .from("alumni")
    .select("id, full_name, company, job_role, avatar_initials, avatar_color, location, technologies")
    .eq("email", email.toLowerCase().trim());

  if (error) throw error;
  return (data || []).map(mapAlumni);
};

// ── search ────────────────────────────────────────────────────────────────────
const search = async ({
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
} = {}) => {
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset   = (pageNum - 1) * limitNum;
  const ascending = sortOrder === "asc";

  // Map camelCase sort field names to snake_case column names
  const sortFieldMap = {
    fullName: "full_name",
    company: "company",
    yearsOfExperience: "years_of_experience",
    createdAt: "created_at",
    created_at: "created_at",
  };
  const sortField = sortFieldMap[sortBy] || "created_at";

  let query = supabase.from("alumni").select("*", { count: "exact" });

  // Keyword search – case-insensitive partial match across multiple columns
  if (q && q.trim()) {
    const term = q.trim().replace(/'/g, "''"); // basic SQL-injection guard for ilike value
    query = query.or(
      [
        `full_name.ilike.%${term}%`,
        `company.ilike.%${term}%`,
        `job_role.ilike.%${term}%`,
        `bio.ilike.%${term}%`,
        `domain.ilike.%${term}%`,
      ].join(",")
    );
  }

  // Technology – array overlap (comma-separated input → array)
  if (technology) {
    const techs = technology
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (techs.length > 0) {
      query = query.overlaps("technologies", techs);
    }
  }

  // Company – partial, case-insensitive
  if (company && company.trim()) {
    query = query.ilike("company", `%${company.trim()}%`);
  }

  // Job role – partial, case-insensitive
  if (jobRole && jobRole.trim()) {
    query = query.ilike("job_role", `%${jobRole.trim()}%`);
  }

  // Experience range
  if (minExp !== undefined && minExp !== null && minExp !== "") {
    query = query.gte("years_of_experience", Number(minExp));
  }
  if (maxExp !== undefined && maxExp !== null && maxExp !== "") {
    query = query.lte("years_of_experience", Number(maxExp));
  }

  // Availability status
  if (availability) {
    query = query.eq("availability_status", availability);
  }

  query = query
    .order(sortField, { ascending })
    .range(offset, offset + limitNum - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    rows: (data || []).map(mapAlumni),
    total: count || 0,
  };
};

// ── Distinct value helpers (for filter dropdowns) ─────────────────────────────
const getDistinctTechnologies = async () => {
  const { data, error } = await supabase.from("alumni").select("technologies");
  if (error) throw error;
  const all = (data || []).flatMap((row) => row.technologies || []);
  return [...new Set(all)].sort();
};

const getDistinctCompanies = async () => {
  const { data, error } = await supabase.from("alumni").select("company");
  if (error) throw error;
  const all = (data || []).map((row) => row.company).filter(Boolean);
  return [...new Set(all)].sort();
};

const getDistinctJobRoles = async () => {
  const { data, error } = await supabase.from("alumni").select("job_role");
  if (error) throw error;
  const all = (data || []).map((row) => row.job_role).filter(Boolean);
  return [...new Set(all)].sort();
};

module.exports = {
  findById,
  findByEmail,
  search,
  getDistinctTechnologies,
  getDistinctCompanies,
  getDistinctJobRoles,
};
