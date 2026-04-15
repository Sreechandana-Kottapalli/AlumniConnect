const { validationResult } = require("express-validator");
const ReferralRequest = require("../models/ReferralRequest");
const Alumni          = require("../models/Alumni");
const User            = require("../models/User");
const emailService    = require("../services/emailService");

// ── Helpers ───────────────────────────────────────────────────────────────────

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

// Resolve the alumni profile UUIDs that belong to the current user (matched by email)
const getAlumniIds = async (userEmail) => {
  const profiles = await Alumni.findByEmail(userEmail);
  return profiles.map((p) => p._id);
};

// ── POST /api/referrals ───────────────────────────────────────────────────────
const createRequest = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;

    const {
      alumniId,
      requestType,
      targetJobRole,
      targetCompany,
      jobDescriptionUrl,
      resumeUrl,
      resumePath,
      linkedinUrl,
      portfolioUrl,
      personalMessage,
    } = req.body;

    // Verify the target alumni exists
    const alumni = await Alumni.findById(alumniId);
    if (!alumni) {
      return res.status(404).json({ success: false, message: "Alumni not found." });
    }

    // Block duplicate active requests
    const isDuplicate = await ReferralRequest.hasDuplicate(
      req.user._id,
      alumniId,
      requestType
    );
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        message: `You already have an active ${requestType} request with this alumni.`,
      });
    }

    const request = await ReferralRequest.create({
      candidate: req.user._id,
      alumni:    alumniId,
      requestType,
      targetJobRole,
      targetCompany,
      jobDescriptionUrl,
      resumeUrl,
      resumePath,
      linkedinUrl,
      portfolioUrl,
      personalMessage,
    });

    // Non-blocking email notification
    emailService
      .notifyAlumniNewRequest({ request, alumni, candidate: req.user })
      .catch((err) => console.error("Email error (new request):", err.message));

    res.status(201).json({
      success: true,
      message: "Request submitted successfully.",
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/my ─────────────────────────────────────────────────────
const getMyRequests = async (req, res, next) => {
  try {
    const {
      status,
      requestType,
      page      = 1,
      limit     = 10,
      sortBy    = "created_at",
      sortOrder = "desc",
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const { rows: requests, total } = await ReferralRequest.findByCandidate(
      req.user._id,
      { status, requestType, page: pageNum, limit: limitNum, sortBy, sortOrder }
    );

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/incoming ───────────────────────────────────────────────
const getIncomingRequests = async (req, res, next) => {
  try {
    const alumniIds = await getAlumniIds(req.user.email);
    if (!alumniIds.length) {
      return res.json({
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      });
    }

    const {
      status,
      requestType,
      page      = 1,
      limit     = 10,
      sortBy    = "created_at",
      sortOrder = "desc",
    } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const { rows: requests, total } = await ReferralRequest.findByAlumniIds(
      alumniIds,
      { status, requestType, page: pageNum, limit: limitNum, sortBy, sortOrder }
    );

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/stats ──────────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const isAlumni = req.user.role === "alumni";
    let filter = {};

    if (isAlumni) {
      const alumniIds = await getAlumniIds(req.user.email);
      filter = { alumni_ids: alumniIds };
    } else {
      filter = { candidate_id: req.user._id };
    }

    const stats = await ReferralRequest.countByStatus(filter);
    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/:id ────────────────────────────────────────────────────
const getRequestById = async (req, res, next) => {
  try {
    const request = await ReferralRequest.findById(req.params.id, true);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const candidateId = request.candidate?._id ?? request.candidate;
    const alumniId    = request.alumni?._id    ?? request.alumni;

    const isOwner       = candidateId?.toString() === req.user._id.toString();
    const alumniIds     = await getAlumniIds(req.user.email);
    const isTargetAlumni = alumniIds.some((id) => id.toString() === alumniId?.toString());
    const isAdmin        = req.user.role === "admin";

    if (!isOwner && !isTargetAlumni && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/referrals/:id/status ─────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;

    const { status, alumniResponse, additionalInfoRequest } = req.body;

    const request = await ReferralRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const alumniId       = request.alumni?._id ?? request.alumni;
    const alumniIds      = await getAlumniIds(req.user.email);
    const isTargetAlumni = alumniIds.some((id) => id.toString() === alumniId?.toString());

    if (!isTargetAlumni && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const terminalStatuses = ["rejected", "completed"];
    if (terminalStatuses.includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${request.status} request.`,
      });
    }

    const updated = await ReferralRequest.updateStatus(req.params.id, {
      status,
      alumniResponse,
      additionalInfoRequest,
    });

    // Fetch parties for email notification
    const candidateId = request.candidate?._id ?? request.candidate;
    const [alumniProfile, candidateProfile] = await Promise.all([
      Alumni.findById(alumniId?.toString()),
      User.findById(candidateId?.toString()),
    ]);

    const emailMap = {
      accepted:    () => emailService.notifyCandidateAccepted({ request: updated, alumni: alumniProfile, candidate: candidateProfile }),
      rejected:    () => emailService.notifyCandidateRejected({ request: updated, alumni: alumniProfile, candidate: candidateProfile }),
      in_progress: () => emailService.notifyCandidateAdditionalInfo({ request: updated, alumni: alumniProfile, candidate: candidateProfile }),
      completed:   () => emailService.notifyCandidateCompleted({ request: updated, alumni: alumniProfile, candidate: candidateProfile }),
    };

    if (emailMap[status]) {
      emailMap[status]().catch((err) =>
        console.error(`Email error (${status}):`, err.message)
      );
    }

    res.json({
      success: true,
      message: `Request ${status} successfully.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/referrals/:id ─────────────────────────────────────────────────
const cancelRequest = async (req, res, next) => {
  try {
    const request = await ReferralRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const candidateId = request.candidate?._id ?? request.candidate;
    if (candidateId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled.",
      });
    }

    await ReferralRequest.deleteById(req.params.id);

    res.json({ success: true, message: "Request cancelled successfully." });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/admin/all ──────────────────────────────────────────────
const adminGetAll = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admins only." });
    }

    const { status, requestType, page = 1, limit = 20 } = req.query;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const { rows: requests, total } = await ReferralRequest.findAll({
      status, requestType, page: pageNum, limit: limitNum,
    });

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  getIncomingRequests,
  getStats,
  getRequestById,
  updateStatus,
  cancelRequest,
  adminGetAll,
};
