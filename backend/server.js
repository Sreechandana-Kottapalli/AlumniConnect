require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const errorHandler = require("./middleware/errorHandler");
const { globalLimiter } = require("./middleware/rateLimiter");
const { ensureBucket } = require("./services/storageService");
const emailService = require("./services/emailService");

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

// Health check — surfaces missing env vars for easier debugging
app.get("/api/health", (req, res) => {
  const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "JWT_SECRET"];
  const missing  = required.filter((v) => !process.env[v]);

  if (missing.length) {
    return res.status(500).json({
      status:  "error",
      message: `Missing environment variables: ${missing.join(", ")}. Set them in Vercel → Project → Settings → Environment Variables.`,
      missing,
    });
  }

  const emailConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

  res.json({
    status:          "ok",
    message:         "NCPL Alumni Connect API is running",
    timestamp:       new Date().toISOString(),
    emailConfigured, // false → set EMAIL_USER + EMAIL_PASS in Vercel env vars
    emailUser:       process.env.EMAIL_USER
      ? `${process.env.EMAIL_USER.slice(0, 3)}***` // show first 3 chars only
      : "NOT SET",
  });
});

// Debug: send a test email (protected — requires a valid Bearer token)
app.post("/api/debug/send-test-email", require("./middleware/auth").protect, async (req, res) => {
  try {
    emailService.validateEmailConfig(); // throws if vars missing
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }

  const { to } = req.body;
  const recipient = to || req.user.email;

  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });

    await transporter.verify();
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `NCPL Alumni Connect <${process.env.EMAIL_USER}>`,
      to:   recipient,
      subject: "NCPL Alumni Connect — Test Email",
      html: "<p>If you received this, your SMTP configuration is working correctly!</p>",
    });

    res.json({ success: true, message: `Test email sent to ${recipient}` });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send test email",
      error:   err.message,
      hint:    err.message.includes("Invalid login")
        ? "Check that EMAIL_USER is your Gmail address and EMAIL_PASS is a Gmail App Password (not your regular password). Enable App Passwords at myaccount.google.com/apppasswords"
        : "Check EMAIL_HOST, EMAIL_PORT, EMAIL_USER, and EMAIL_PASS environment variables.",
    });
  }
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

// Warn early if email is not configured
if (process.env.NODE_ENV !== "test") {
  const missingEmail = ["EMAIL_USER", "EMAIL_PASS"].filter((k) => !process.env[k]);
  if (missingEmail.length) {
    console.warn(
      `[Email] WARNING: ${missingEmail.join(", ")} not set — ` +
        "emails will fail. Add them in Vercel → Project → Settings → Environment Variables."
    );
  } else {
    console.log(`[Email] Configured for ${process.env.EMAIL_USER}`);
  }
}

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
