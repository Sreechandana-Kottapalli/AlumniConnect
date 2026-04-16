const express = require("express");
const { body, query } = require("express-validator");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { referralLimiter } = require("../middleware/rateLimiter");
const ctrl = require("../controllers/referralController");

// All referral routes require authentication
router.use(protect);

// ── Stats ─────────────────────────────────────────────────────────────────
router.get("/stats", ctrl.getStats);

// ── Admin: all requests ───────────────────────────────────────────────────
router.get("/admin/all", ctrl.adminGetAll);

// ── Candidate: my requests ────────────────────────────────────────────────
router.get("/my", ctrl.getMyRequests);

// ── Alumni: incoming requests ─────────────────────────────────────────────
router.get("/incoming", ctrl.getIncomingRequests);

// ── Create request ────────────────────────────────────────────────────────
router.post(
  "/",
  referralLimiter,
  [
    body("alumniId").notEmpty().isUUID().withMessage("Valid alumni ID is required"),
    body("requestType")
      .isIn(["referral", "reference"])
      .withMessage("requestType must be 'referral' or 'reference'"),
    body("targetJobRole")
      .trim()
      .notEmpty()
      .withMessage("Target job role is required")
      .isLength({ max: 150 }),
    body("targetCompany")
      .trim()
      .notEmpty()
      .withMessage("Target company is required")
      .isLength({ max: 150 }),
    body("resumeUrl").notEmpty().withMessage("Resume URL is required"),
    body("personalMessage")
      .trim()
      .notEmpty()
      .withMessage("Personal message is required")
      .isLength({ min: 20, max: 1000 })
      .withMessage("Message must be between 20 and 1000 characters"),
    body("linkedinUrl").optional().isURL().withMessage("Invalid LinkedIn URL"),
    body("portfolioUrl").optional().isURL().withMessage("Invalid portfolio URL"),
    body("jobDescriptionUrl").optional().isURL().withMessage("Invalid job description URL"),
  ],
  ctrl.createRequest
);

// ── Get / Update / Delete single request ─────────────────────────────────
router.get("/:id", ctrl.getRequestById);

router.put(
  "/:id/status",
  [
    body("status")
      .isIn(["accepted", "rejected", "in_progress", "completed"])
      .withMessage("Invalid status value"),
    body("alumniResponse")
      .optional()
      .isLength({ max: 1000 })
      .withMessage("Response cannot exceed 1000 characters"),
    body("additionalInfoRequest")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Info request cannot exceed 500 characters"),
  ],
  ctrl.updateStatus
);

router.delete("/:id", ctrl.cancelRequest);

module.exports = router;
