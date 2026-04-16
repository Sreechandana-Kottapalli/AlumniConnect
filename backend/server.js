require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const errorHandler = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");
const { ensureBucket } = require("./services/storageService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply global rate limiter to all API routes
app.use("/api", globalLimiter);

// Routes
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/alumni",   require("./routes/alumni"));
app.use("/api/referrals", require("./routes/referral"));
app.use("/api/upload",   require("./routes/upload"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status:    "ok",
    message:   "NCPL Alumni Connect API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Warm up: ensure storage bucket exists before accepting requests
ensureBucket().catch((err) =>
  console.error("[Storage] Startup bucket check failed:", err.message)
);

// Start server only when run directly (not when imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`
    );
  });
}

// Export for Vercel serverless deployment
module.exports = app;
