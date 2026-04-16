const { validationResult } = require("express-validator");
const ReferralRequest = require("../models/ReferralRequest");
const emailService    = require("../services/emailService");

// ── GET /api/schedule/:requestId ─────────────────────────────────────────────
// Public endpoint — no auth required.
// Returns the minimal info needed to render the scheduling form.
const getScheduleInfo = async (req, res, next) => {
  try {
    const request = await ReferralRequest.findByIdForSchedule(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Scheduling link not found." });
    }

    res.json({
      success: true,
      data: {
        requestId:         request._id,
        requestType:       request.requestType,
        targetJobRole:     request.targetJobRole,
        targetCompany:     request.targetCompany,
        candidateName:     request.candidate?.name   || "the candidate",
        alumniName:        request.alumni?.fullName  || "Alumni",
        alumniCompany:     request.alumni?.company   || "",
        alumniAvailability: request.alumniAvailability || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/schedule/:requestId ─────────────────────────────────────────────
// Public endpoint — alumni submits their preferred date and time.
const submitAvailability = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const first = errors.array()[0];
      return res.status(422).json({ success: false, message: first.msg });
    }

    const { date, time, notes } = req.body;

    const request = await ReferralRequest.findByIdForSchedule(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: "Scheduling link not found." });
    }

    const availability = await ReferralRequest.setAvailability(request._id, { date, time, notes });

    // Non-blocking: notify the candidate of the new availability
    emailService
      .notifyCandidateAvailabilitySet({ request, availability })
      .catch((err) => console.error("[Email] availability notify failed:", err.message));

    res.json({
      success: true,
      message: "Availability submitted! The candidate will be notified.",
      data:    availability,
    });
  } catch (err) {
    // If the alumni_availability column doesn't exist yet, surface a helpful message
    if (err.message?.includes("alumni_availability")) {
      return res.status(500).json({
        success: false,
        message:
          "Database migration required. Run this SQL in your Supabase SQL editor:\n" +
          "ALTER TABLE referral_requests ADD COLUMN IF NOT EXISTS alumni_availability JSONB;",
      });
    }
    next(err);
  }
};

module.exports = { getScheduleInfo, submitAvailability };
