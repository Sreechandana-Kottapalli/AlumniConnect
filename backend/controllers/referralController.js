const { validationResult } = require("express-validator");
const ReferralRequest = require("../models/ReferralRequest");
const Alumni = require("../models/Alumni");
const User = require("../models/User");
const emailService = require("../services/emailService");

// ── Helpers ───────────────────────────────────────────────────────────────

const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ success: false, errors: errors.array() });
    return false;
  }
  return true;
};

// Build query for alumni's incoming requests by matching their email to Alumni docs
const getAlumniIds = async (userEmail) => {
  const profiles = await Alumni.find({ email: userEmail }).lean();
  return profiles.map((p) => p._id);
};

// ── POST /api/referrals ───────────────────────────────────────────────────
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
      resumePublicId,
      linkedinUrl,
      portfolioUrl,
      personalMessage,
    } = req.body;

    // Verify alumni exists
    const alumni = await Alumni.findById(alumniId).lean();
    if (!alumni) {
      return res.status(404).json({ success: false, message: "Alumni not found." });
    }

    // Prevent duplicate active requests
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

    // Create the request
    const request = await ReferralRequest.create({
      candidate: req.user._id,
      alumni: alumniId,
      requestType,
      targetJobRole,
      targetCompany,
      jobDescriptionUrl,
      resumeUrl,
      resumePublicId,
      linkedinUrl,
      portfolioUrl,
      personalMessage,
    });

    // Send email notification to alumni (non-blocking)
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

// ── GET /api/referrals/my ─────────────────────────────────────────────────
const getMyRequests = async (req, res, next) => {
  try {
    const {
      status,
      requestType,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { candidate: req.user._id };
    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const sortDir = sortOrder === "asc" ? 1 : -1;

    const [requests, total] = await Promise.all([
      ReferralRequest.find(filter)
        .populate("alumni", "fullName company jobRole avatarInitials avatarColor location")
        .sort({ [sortBy]: sortDir })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ReferralRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/incoming ───────────────────────────────────────────
// Alumni view: get requests addressed to any of their Alumni profiles (matched by email)
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
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { alumni: { $in: alumniIds } };
    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [requests, total] = await Promise.all([
      ReferralRequest.find(filter)
        .populate("candidate", "name email batch domain")
        .populate("alumni", "fullName company jobRole")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ReferralRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/stats ──────────────────────────────────────────────
const getStats = async (req, res, next) => {
  try {
    const isAlumni = req.user.role === "alumni";
    let filter = {};

    if (isAlumni) {
      const alumniIds = await getAlumniIds(req.user.email);
      filter = { alumni: { $in: alumniIds } };
    } else {
      filter = { candidate: req.user._id };
    }

    const counts = await ReferralRequest.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      in_progress: 0,
      completed: 0,
    };

    counts.forEach(({ _id, count }) => {
      stats[_id] = count;
      stats.total += count;
    });

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/:id ────────────────────────────────────────────────
const getRequestById = async (req, res, next) => {
  try {
    const request = await ReferralRequest.findById(req.params.id)
      .populate("candidate", "name email batch domain")
      .populate("alumni", "fullName company jobRole location technologies avatarInitials avatarColor")
      .lean();

    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    // Access control: candidate who made it OR alumni it was sent to OR admin
    const isOwner = request.candidate._id.toString() === req.user._id.toString();
    const alumniIds = await getAlumniIds(req.user.email);
    const isTargetAlumni = alumniIds.some(
      (id) => id.toString() === request.alumni._id.toString()
    );
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isTargetAlumni && !isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

// ── PUT /api/referrals/:id/status ─────────────────────────────────────────
// Only alumni (or admin) can update status
const updateStatus = async (req, res, next) => {
  try {
    if (!handleValidation(req, res)) return;

    const { status, alumniResponse, additionalInfoRequest } = req.body;

    const request = await ReferralRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    // Verify requester is the target alumni or an admin
    const alumniIds = await getAlumniIds(req.user.email);
    const isTargetAlumni = alumniIds.some(
      (id) => id.toString() === request.alumni.toString()
    );
    if (!isTargetAlumni && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Prevent going backwards in terminal states
    const terminalStatuses = ["rejected", "completed"];
    if (terminalStatuses.includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update a ${request.status} request.`,
      });
    }

    // Apply updates
    request.status = status;
    if (alumniResponse !== undefined) request.alumniResponse = alumniResponse;
    if (additionalInfoRequest !== undefined)
      request.additionalInfoRequest = additionalInfoRequest;

    await request.save();

    // Fetch parties for email
    const [alumni, candidate] = await Promise.all([
      Alumni.findById(request.alumni).lean(),
      User.findById(request.candidate).lean(),
    ]);

    // Send appropriate email (non-blocking)
    const emailMap = {
      accepted: () =>
        emailService.notifyCandidateAccepted({ request, alumni, candidate }),
      rejected: () =>
        emailService.notifyCandidateRejected({ request, alumni, candidate }),
      in_progress: () =>
        emailService.notifyCandidateAdditionalInfo({ request, alumni, candidate }),
      completed: () =>
        emailService.notifyCandidateCompleted({ request, alumni, candidate }),
    };

    if (emailMap[status]) {
      emailMap[status]().catch((err) =>
        console.error(`Email error (${status}):`, err.message)
      );
    }

    res.json({
      success: true,
      message: `Request ${status} successfully.`,
      data: request,
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/referrals/:id ─────────────────────────────────────────────
// Only the candidate who made the request can cancel it (only if pending)
const cancelRequest = async (req, res, next) => {
  try {
    const request = await ReferralRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (request.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending requests can be cancelled.",
      });
    }

    await request.deleteOne();

    res.json({ success: true, message: "Request cancelled successfully." });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/referrals/admin/all ──────────────────────────────────────────
// Admin only
const adminGetAll = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admins only." });
    }

    const {
      status,
      requestType,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (requestType) filter.requestType = requestType;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

    const [requests, total] = await Promise.all([
      ReferralRequest.find(filter)
        .populate("candidate", "name email")
        .populate("alumni", "fullName company jobRole")
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      ReferralRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
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
