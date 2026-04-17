const ReferralRequest = require("../models/ReferralRequest");
const Alumni          = require("../models/Alumni");
const User            = require("../models/User");
const emailService    = require("../services/emailService");

// ── GET /api/schedule/:requestId ──────────────────────────────────────────────
// Public endpoint — returns the minimum info needed to render the schedule page.
const getScheduleInfo = async (req, res, next) => {
  try {
    const request = await ReferralRequest.findById(req.params.requestId, true);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    const isTerminal = ["rejected", "completed"].includes(request.status);

    res.json({
      success: true,
      data: {
        requestId:     request._id,
        requestType:   request.requestType,
        targetJobRole: request.targetJobRole,
        targetCompany: request.targetCompany,
        candidateName: request.candidate?.name || "Candidate",
        alumniName:    request.alumni?.fullName || "Alumni",
        status:        request.status,
        scheduledAt:   request.scheduledAt,
        scheduleNote:  request.scheduleNote,
        isTerminal,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/schedule/:requestId ─────────────────────────────────────────────
// Public endpoint — alumni submits a chosen date/time.
const submitSchedule = async (req, res, next) => {
  try {
    const { scheduledAt, scheduleNote } = req.body;

    if (!scheduledAt) {
      return res.status(422).json({ success: false, message: "Scheduled date and time is required." });
    }

    const date = new Date(scheduledAt);
    if (isNaN(date.getTime())) {
      return res.status(422).json({ success: false, message: "Invalid date/time format." });
    }

    if (date <= new Date()) {
      return res.status(422).json({ success: false, message: "Scheduled time must be in the future." });
    }

    const request = await ReferralRequest.findById(req.params.requestId, true);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }

    if (["rejected", "completed"].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot schedule a meeting for a rejected or completed request.",
      });
    }

    const updated = await ReferralRequest.updateSchedule(req.params.requestId, {
      scheduledAt: date.toISOString(),
      scheduleNote: scheduleNote?.trim() || null,
    });

    // Resolve candidate and alumni for email
    const candidateId = request.candidate?._id ?? request.candidate;
    const alumniId    = request.alumni?._id    ?? request.alumni;

    const [candidate, alumni] = await Promise.all([
      User.findById(candidateId?.toString()),
      Alumni.findById(alumniId?.toString()),
    ]);

    if (candidate && alumni) {
      emailService
        .notifyCandidateScheduled({
          request: { ...updated, scheduledAt: date.toISOString(), scheduleNote: scheduleNote?.trim() || null },
          alumni,
          candidate,
        })
        .catch((err) => console.error("Email error (schedule notify):", err.message));
    }

    res.json({
      success: true,
      message: "Meeting scheduled successfully. The candidate has been notified.",
      data: {
        scheduledAt: updated.scheduledAt,
        scheduleNote: updated.scheduleNote,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getScheduleInfo, submitSchedule };
