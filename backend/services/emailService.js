const nodemailer = require("nodemailer");
const templates = require("../templates/emailTemplates");

// ── Transporter factory ───────────────────────────────────────────────────
const createTransporter = () => {
  if (process.env.NODE_ENV === "test") {
    // Ethereal (fake SMTP for testing)
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: { user: "test@ethereal.email", pass: "testpass" },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS via STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
  });
};

/**
 * Send a single email.
 * @param {Object} opts
 * @param {string} opts.to      - Recipient email
 * @param {string} opts.subject - Email subject
 * @param {string} opts.html    - HTML body
 */
const sendMail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || "NCPL Alumni Connect <no-reply@ncplalumni.in>";

  const info = await transporter.sendMail({ from, to, subject, html });
  if (process.env.NODE_ENV === "development") {
    console.log("Email sent:", info.messageId);
  }
  return info;
};

// ── Helper: build action links ─────────────────────────────────────────────
const buildLinks = (requestId) => {
  const base = process.env.FRONTEND_URL || "http://localhost:3000";
  return {
    acceptLink: `${base}/alumni/requests?action=accept&id=${requestId}`,
    rejectLink: `${base}/alumni/requests?action=reject&id=${requestId}`,
    requestInfoLink: `${base}/alumni/requests?action=info&id=${requestId}`,
    dashboardLink: `${base}/referrals`,
  };
};

// ── Notification functions ─────────────────────────────────────────────────

/**
 * Notify alumni of a new referral/reference request.
 */
const notifyAlumniNewRequest = async ({ request, alumni, candidate }) => {
  const links = buildLinks(request._id);
  const html = templates.newRequestToAlumni({
    alumniName: alumni.fullName,
    candidateName: candidate.name,
    candidateEmail: candidate.email,
    requestType: request.requestType,
    targetCompany: request.targetCompany,
    targetJobRole: request.targetJobRole,
    personalMessage: request.personalMessage,
    resumeUrl: request.resumeUrl,
    linkedinUrl: request.linkedinUrl,
    portfolioUrl: request.portfolioUrl,
    jobDescriptionUrl: request.jobDescriptionUrl,
    acceptLink: links.acceptLink,
    rejectLink: links.rejectLink,
    requestInfoLink: links.requestInfoLink,
    requestId: request._id,
  });

  await sendMail({
    to: alumni.email,
    subject: `New ${request.requestType === "referral" ? "Referral" : "Reference"} Request from ${candidate.name}`,
    html,
  });
};

/**
 * Confirm to the candidate that their request was submitted successfully.
 * Includes all submitted details so they have a record of what was sent.
 */
const notifyCandidateRequestSubmitted = async ({ request, alumni, candidate }) => {
  const { dashboardLink } = buildLinks(request._id);
  const html = templates.submissionConfirmationToCandidate({
    candidateName:  candidate.name,
    alumniName:     alumni.fullName,
    alumniCompany:  alumni.company,
    alumniJobTitle: alumni.jobRole,
    requestType:    request.requestType,
    targetJobRole:  request.targetJobRole,
    targetCompany:  request.targetCompany,
    jobDescriptionUrl: request.jobDescriptionUrl,
    linkedinUrl:    request.linkedinUrl,
    portfolioUrl:   request.portfolioUrl,
    personalMessage: request.personalMessage,
    resumeUrl:      request.resumeUrl,
    dashboardLink,
  });

  await sendMail({
    to: candidate.email,
    subject: `Your ${request.requestType === "referral" ? "Referral" : "Reference"} Request Has Been Submitted`,
    html,
  });
};

/**
 * Notify candidate that their request was accepted.
 */
const notifyCandidateAccepted = async ({ request, alumni, candidate }) => {
  const { dashboardLink } = buildLinks(request._id);
  const html = templates.acceptanceToCandidate({
    candidateName: candidate.name,
    alumniName: alumni.fullName,
    alumniCompany: alumni.company,
    alumniJobTitle: alumni.jobRole,
    requestType: request.requestType,
    targetJobRole: request.targetJobRole,
    targetCompany: request.targetCompany,
    alumniResponse: request.alumniResponse,
    dashboardLink,
  });

  await sendMail({
    to: candidate.email,
    subject: `Your ${request.requestType === "referral" ? "Referral" : "Reference"} Request was Accepted`,
    html,
  });
};

/**
 * Notify candidate that their request was rejected.
 */
const notifyCandidateRejected = async ({ request, alumni, candidate }) => {
  const { dashboardLink } = buildLinks(request._id);
  const html = templates.rejectionToCandidate({
    candidateName: candidate.name,
    alumniName: alumni.fullName,
    requestType: request.requestType,
    targetJobRole: request.targetJobRole,
    targetCompany: request.targetCompany,
    alumniResponse: request.alumniResponse,
    dashboardLink,
  });

  await sendMail({
    to: candidate.email,
    subject: `Update on Your ${request.requestType === "referral" ? "Referral" : "Reference"} Request`,
    html,
  });
};

/**
 * Notify candidate that alumni needs more information.
 */
const notifyCandidateAdditionalInfo = async ({ request, alumni, candidate }) => {
  const { dashboardLink } = buildLinks(request._id);
  const html = templates.additionalInfoToCandidate({
    candidateName: candidate.name,
    alumniName: alumni.fullName,
    requestType: request.requestType,
    additionalInfoMessage: request.additionalInfoRequest,
    dashboardLink,
  });

  await sendMail({
    to: candidate.email,
    subject: `${alumni.fullName} Needs More Information — ${request.requestType === "referral" ? "Referral" : "Reference"} Request`,
    html,
  });
};

/**
 * Notify candidate that their request is completed.
 */
const notifyCandidateCompleted = async ({ request, alumni, candidate }) => {
  const { dashboardLink } = buildLinks(request._id);
  const html = templates.completionToCandidate({
    candidateName: candidate.name,
    alumniName: alumni.fullName,
    alumniCompany: alumni.company,
    requestType: request.requestType,
    targetJobRole: request.targetJobRole,
    targetCompany: request.targetCompany,
    alumniResponse: request.alumniResponse,
    dashboardLink,
  });

  await sendMail({
    to: candidate.email,
    subject: `Your ${request.requestType === "referral" ? "Referral" : "Reference"} is Complete!`,
    html,
  });
};

module.exports = {
  notifyAlumniNewRequest,
  notifyCandidateRequestSubmitted,
  notifyCandidateAccepted,
  notifyCandidateRejected,
  notifyCandidateAdditionalInfo,
  notifyCandidateCompleted,
};
