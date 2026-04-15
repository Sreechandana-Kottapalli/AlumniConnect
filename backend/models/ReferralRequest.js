const mongoose = require("mongoose");

const { Schema, Types } = mongoose;

const statusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in_progress", "completed"],
      required: true,
    },
    note: { type: String, trim: true, maxlength: 500 },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const referralRequestSchema = new Schema(
  {
    // ── Parties ────────────────────────────────────────────────
    candidate: {
      type: Types.ObjectId,
      ref: "User",
      required: [true, "Candidate reference is required"],
    },
    alumni: {
      type: Types.ObjectId,
      ref: "Alumni",
      required: [true, "Alumni reference is required"],
    },

    // ── Request Type ───────────────────────────────────────────
    requestType: {
      type: String,
      enum: ["referral", "reference"],
      required: [true, "Request type is required"],
    },

    // ── Job / Target Details ───────────────────────────────────
    targetJobRole: {
      type: String,
      required: [true, "Target job role is required"],
      trim: true,
      maxlength: [150, "Job role cannot exceed 150 characters"],
    },
    targetCompany: {
      type: String,
      required: [true, "Target company is required"],
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
    },
    jobDescriptionUrl: {
      type: String,
      trim: true,
      maxlength: [500, "URL cannot exceed 500 characters"],
    },

    // ── Candidate Materials ────────────────────────────────────
    resumeUrl: {
      type: String,
      required: [true, "Resume URL is required"],
    },
    resumePublicId: {
      type: String, // Cloudinary public_id – for deletion if needed
    },
    linkedinUrl: {
      type: String,
      trim: true,
    },
    portfolioUrl: {
      type: String,
      trim: true,
    },
    personalMessage: {
      type: String,
      required: [true, "Personal message is required"],
      trim: true,
      minlength: [20, "Message must be at least 20 characters"],
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },

    // ── Status & Alumni Response ───────────────────────────────
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "in_progress", "completed"],
      default: "pending",
    },
    alumniResponse: {
      type: String,
      trim: true,
      maxlength: [1000, "Response cannot exceed 1000 characters"],
    },
    additionalInfoRequest: {
      type: String,
      trim: true,
      maxlength: [500, "Info request cannot exceed 500 characters"],
    },

    // ── Audit trail ────────────────────────────────────────────
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [{ status: "pending", note: "Request submitted" }],
    },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ────────────────────────────────────────────────────────────────
referralRequestSchema.index({ candidate: 1, createdAt: -1 });
referralRequestSchema.index({ alumni: 1, status: 1, createdAt: -1 });
referralRequestSchema.index({ status: 1 });

// ── Pre-save: push status change to history ────────────────────────────────
referralRequestSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.statusHistory.push({ status: this.status });
    if (this.status === "completed") this.completedAt = new Date();
  }
  next();
});

// ── Instance method: check if an active (non-closed) duplicate exists ──────
referralRequestSchema.statics.hasDuplicate = async function (
  candidateId,
  alumniId,
  requestType
) {
  const active = await this.findOne({
    candidate: candidateId,
    alumni: alumniId,
    requestType,
    status: { $in: ["pending", "accepted", "in_progress"] },
  });
  return !!active;
};

module.exports = mongoose.model("ReferralRequest", referralRequestSchema);
