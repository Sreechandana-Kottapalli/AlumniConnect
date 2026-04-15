/**
 * ReferralRequest model – Supabase/PostgreSQL implementation.
 * Status history is stored as a JSONB column and appended on every
 * status change (replacing the Mongoose pre-save hook).
 * All rows are normalised back to the camelCase + `_id` shape the
 * controllers and frontend already expect.
 */
const supabase = require("../config/supabase");

// ── Supabase FK-embed selectors ────────────────────────────────────────────────
const CANDIDATE_SEL = "candidate:users!candidate_id(id, name, email, batch, domain)";
const ALUMNI_SEL    =
  "alumni:alumni!alumni_id(id, full_name, company, job_role, location, technologies, avatar_initials, avatar_color)";
const POPULATED_SEL = `*, ${CANDIDATE_SEL}, ${ALUMNI_SEL}`;

// ── Row → app shape ───────────────────────────────────────────────────────────
const mapRequest = (row) => {
  if (!row) return null;

  const base = {
    _id: row.id,
    requestType: row.request_type,
    targetJobRole: row.target_job_role,
    targetCompany: row.target_company,
    jobDescriptionUrl: row.job_description_url || null,
    resumeUrl: row.resume_url,
    resumePath: row.resume_path || null,
    linkedinUrl: row.linkedin_url || null,
    portfolioUrl: row.portfolio_url || null,
    personalMessage: row.personal_message,
    status: row.status,
    alumniResponse: row.alumni_response || null,
    additionalInfoRequest: row.additional_info_request || null,
    statusHistory: row.status_history || [],
    completedAt: row.completed_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  // Populated candidate
  if (row.candidate && typeof row.candidate === "object") {
    base.candidate = {
      _id: row.candidate.id,
      name: row.candidate.name,
      email: row.candidate.email,
      batch: row.candidate.batch || null,
      domain: row.candidate.domain || null,
    };
  } else {
    base.candidate = row.candidate_id;
  }

  // Populated alumni
  if (row.alumni && typeof row.alumni === "object") {
    base.alumni = {
      _id: row.alumni.id,
      fullName: row.alumni.full_name,
      company: row.alumni.company,
      jobRole: row.alumni.job_role,
      location: row.alumni.location || null,
      technologies: row.alumni.technologies || [],
      avatarInitials: row.alumni.avatar_initials || null,
      avatarColor: row.alumni.avatar_color || "#1A3C6E",
    };
  } else {
    base.alumni = row.alumni_id;
  }

  return base;
};

// ── create ────────────────────────────────────────────────────────────────────
const create = async ({
  candidate,
  alumni,
  requestType,
  targetJobRole,
  targetCompany,
  jobDescriptionUrl,
  resumeUrl,
  resumePath,
  linkedinUrl,
  portfolioUrl,
  personalMessage,
}) => {
  const statusHistory = [
    { status: "pending", note: "Request submitted", changed_at: new Date().toISOString() },
  ];

  const { data, error } = await supabase
    .from("referral_requests")
    .insert({
      candidate_id: candidate,
      alumni_id: alumni,
      request_type: requestType,
      target_job_role: targetJobRole,
      target_company: targetCompany,
      job_description_url: jobDescriptionUrl || null,
      resume_url: resumeUrl,
      resume_path: resumePath || null,
      linkedin_url: linkedinUrl || null,
      portfolio_url: portfolioUrl || null,
      personal_message: personalMessage,
      status_history: statusHistory,
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRequest(data);
};

// ── findById ──────────────────────────────────────────────────────────────────
const findById = async (id, withPopulate = false) => {
  const { data, error } = await supabase
    .from("referral_requests")
    .select(withPopulate ? POPULATED_SEL : "*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return mapRequest(data);
};

// ── findByCandidate ───────────────────────────────────────────────────────────
const findByCandidate = async (
  candidateId,
  { status, requestType, page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc" } = {}
) => {
  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset   = (pageNum - 1) * limitNum;

  let query = supabase
    .from("referral_requests")
    .select(POPULATED_SEL, { count: "exact" })
    .eq("candidate_id", candidateId);

  if (status)      query = query.eq("status", status);
  if (requestType) query = query.eq("request_type", requestType);

  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limitNum - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { rows: (data || []).map(mapRequest), total: count || 0 };
};

// ── findByAlumniIds ───────────────────────────────────────────────────────────
const findByAlumniIds = async (
  alumniIds,
  { status, requestType, page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc" } = {}
) => {
  if (!alumniIds || alumniIds.length === 0) return { rows: [], total: 0 };

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset   = (pageNum - 1) * limitNum;

  let query = supabase
    .from("referral_requests")
    .select(POPULATED_SEL, { count: "exact" })
    .in("alumni_id", alumniIds);

  if (status)      query = query.eq("status", status);
  if (requestType) query = query.eq("request_type", requestType);

  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(offset, offset + limitNum - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { rows: (data || []).map(mapRequest), total: count || 0 };
};

// ── findAll (admin) ───────────────────────────────────────────────────────────
const findAll = async ({
  status,
  requestType,
  page = 1,
  limit = 20,
} = {}) => {
  const ADMIN_SEL =
    "*, candidate:users!candidate_id(id, name, email), alumni:alumni!alumni_id(id, full_name, company, job_role)";

  const pageNum  = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const offset   = (pageNum - 1) * limitNum;

  let query = supabase
    .from("referral_requests")
    .select(ADMIN_SEL, { count: "exact" });

  if (status)      query = query.eq("status", status);
  if (requestType) query = query.eq("request_type", requestType);

  query = query
    .order("created_at", { ascending: false })
    .range(offset, offset + limitNum - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return { rows: (data || []).map(mapRequest), total: count || 0 };
};

// ── updateStatus ──────────────────────────────────────────────────────────────
const updateStatus = async (id, { status, alumniResponse, additionalInfoRequest }) => {
  // Fetch the current history first so we can append to it
  const { data: current, error: fetchErr } = await supabase
    .from("referral_requests")
    .select("status_history")
    .eq("id", id)
    .single();

  if (fetchErr) throw fetchErr;

  const history = [
    ...(current.status_history || []),
    { status, note: null, changed_at: new Date().toISOString() },
  ];

  const patch = {
    status,
    status_history: history,
    ...(alumniResponse       !== undefined && { alumni_response: alumniResponse }),
    ...(additionalInfoRequest !== undefined && { additional_info_request: additionalInfoRequest }),
    ...(status === "completed"             && { completed_at: new Date().toISOString() }),
  };

  const { data, error } = await supabase
    .from("referral_requests")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return mapRequest(data);
};

// ── deleteById ────────────────────────────────────────────────────────────────
const deleteById = async (id) => {
  const { error } = await supabase
    .from("referral_requests")
    .delete()
    .eq("id", id);
  if (error) throw error;
};

// ── hasDuplicate ──────────────────────────────────────────────────────────────
const hasDuplicate = async (candidateId, alumniId, requestType) => {
  const { data, error } = await supabase
    .from("referral_requests")
    .select("id")
    .eq("candidate_id", candidateId)
    .eq("alumni_id", alumniId)
    .eq("request_type", requestType)
    .in("status", ["pending", "accepted", "in_progress"])
    .limit(1);

  if (error) throw error;
  return data && data.length > 0;
};

// ── countByStatus ─────────────────────────────────────────────────────────────
// filter: { candidate_id } OR { alumni_ids: [...] }
const countByStatus = async (filter = {}) => {
  let query = supabase.from("referral_requests").select("status");

  if (filter.candidate_id) query = query.eq("candidate_id", filter.candidate_id);
  if (filter.alumni_ids && filter.alumni_ids.length > 0) {
    query = query.in("alumni_id", filter.alumni_ids);
  }

  const { data, error } = await query;
  if (error) throw error;

  const stats = { total: 0, pending: 0, accepted: 0, rejected: 0, in_progress: 0, completed: 0 };
  (data || []).forEach(({ status }) => {
    stats.total++;
    if (status in stats) stats[status]++;
  });

  return stats;
};

module.exports = {
  create,
  findById,
  findByCandidate,
  findByAlumniIds,
  findAll,
  updateStatus,
  deleteById,
  hasDuplicate,
  countByStatus,
};
