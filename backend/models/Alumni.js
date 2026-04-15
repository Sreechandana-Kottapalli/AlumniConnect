const mongoose = require("mongoose");

const alumniSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
    },
    jobRole: {
      type: String,
      required: [true, "Job role is required"],
      trim: true,
    },
    technologies: {
      type: [String],
      required: [true, "At least one technology is required"],
      validate: {
        validator: (v) => v.length > 0,
        message: "At least one technology is required",
      },
    },
    yearsOfExperience: {
      type: Number,
      required: [true, "Years of experience is required"],
      min: [0, "Experience cannot be negative"],
    },
    linkedinProfile: {
      type: String,
      trim: true,
      default: "",
    },
    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "not_available"],
      default: "available",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    // Extra profile fields
    batch: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    domain: {
      type: String,
      trim: true,
    },
    // Avatar fallback (initials + color)
    avatarInitials: {
      type: String,
      trim: true,
    },
    avatarColor: {
      type: String,
      default: "#1A3C6E",
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index across key fields
alumniSchema.index({
  fullName: "text",
  company: "text",
  jobRole: "text",
  technologies: "text",
  domain: "text",
  bio: "text",
});

// Compound indexes for filter queries
alumniSchema.index({ technologies: 1 });
alumniSchema.index({ company: 1 });
alumniSchema.index({ jobRole: 1 });
alumniSchema.index({ yearsOfExperience: 1 });
alumniSchema.index({ availabilityStatus: 1 });

module.exports = mongoose.model("Alumni", alumniSchema);
