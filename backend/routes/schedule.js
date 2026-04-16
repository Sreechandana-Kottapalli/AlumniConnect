const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const ctrl = require("../controllers/scheduleController");

// Public routes — no authentication required
router.get("/:requestId", ctrl.getScheduleInfo);

router.post(
  "/:requestId",
  [
    body("date").notEmpty().withMessage("Date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("notes").optional().isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),
  ],
  ctrl.submitAvailability
);

module.exports = router;
