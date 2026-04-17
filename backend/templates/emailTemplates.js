/**
 * Professional HTML email templates for the NCPL Alumni Connect
 * Referral & Reference Request System.
 *
 * All templates use inline CSS for maximum email-client compatibility.
 */

const BRAND = {
  primary: "#1A3C6E",
  secondary: "#F4A823",
  bg: "#F5F7FA",
  white: "#FFFFFF",
  text: "#1C1C1E",
  textSecondary: "#6B7280",
  success: "#10B981",
  error: "#EF4444",
};

const baseWrapper = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NCPL Alumni Connect</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background-color:${BRAND.bg};padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background-color:${BRAND.primary};border-radius:12px 12px 0 0;
                       padding:24px 32px;text-align:center;">
              <span style="display:inline-block;background-color:${BRAND.secondary};
                           color:${BRAND.primary};font-size:22px;font-weight:800;
                           width:44px;height:44px;line-height:44px;border-radius:8px;
                           margin-right:10px;vertical-align:middle;">N</span>
              <span style="color:${BRAND.white};font-size:20px;font-weight:700;
                           vertical-align:middle;">NCPL Alumni Connect</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:${BRAND.white};padding:32px;
                       border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${BRAND.bg};border:1px solid #E5E7EB;
                       border-top:none;border-radius:0 0 12px 12px;
                       padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${BRAND.textSecondary};">
                This email was sent by <strong>NCPL Alumni Connect</strong>.<br/>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const actionBtn = (href, label, color = BRAND.primary) =>
  `<a href="${href}" target="_blank"
     style="display:inline-block;background-color:${color};color:${BRAND.white};
            font-size:14px;font-weight:700;text-decoration:none;
            padding:12px 24px;border-radius:8px;margin:4px;">
    ${label}
  </a>`;

const badge = (label, color) =>
  `<span style="display:inline-block;background-color:${color}22;color:${color};
               font-size:12px;font-weight:700;padding:4px 12px;border-radius:99px;">
    ${label}
  </span>`;

const detailRow = (label, value) =>
  `<tr>
    <td style="padding:8px 12px;font-size:13px;color:${BRAND.textSecondary};
               font-weight:600;width:150px;vertical-align:top;">${label}</td>
    <td style="padding:8px 12px;font-size:14px;color:${BRAND.text};">${value}</td>
  </tr>`;

// ── Template 1: New Request Notification (to Alumni) ──────────────────────
const newRequestToAlumni = ({
  alumniName,
  candidateName,
  candidateEmail,
  requestType,
  targetCompany,
  targetJobRole,
  personalMessage,
  resumeUrl,
  linkedinUrl,
  portfolioUrl,
  jobDescriptionUrl,
  acceptLink,
  rejectLink,
  requestInfoLink,
  scheduleLink,
  requestId,
}) =>
  baseWrapper(`
    <p style="font-size:16px;color:${BRAND.text};margin:0 0 8px;">
      Hi <strong>${alumniName}</strong>,
    </p>
    <p style="font-size:15px;color:${BRAND.textSecondary};margin:0 0 24px;line-height:1.6;">
      You have received a new
      <strong>${requestType === "referral" ? "Job Referral" : "Professional Reference"}</strong>
      request from a candidate on NCPL Alumni Connect.
    </p>

    <!-- Request Type Badge -->
    <p style="margin:0 0 20px;">
      ${badge(
        requestType === "referral" ? "Job Referral Request" : "Professional Reference Request",
        requestType === "referral" ? BRAND.primary : "#7C3AED"
      )}
    </p>

    <!-- Candidate Details -->
    <div style="background:${BRAND.bg};border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;
                text-transform:uppercase;letter-spacing:.05em;color:${BRAND.textSecondary};">
        CANDIDATE DETAILS
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${detailRow("Name", candidateName)}
        ${detailRow("Email", candidateEmail)}
        ${detailRow("Target Role", targetJobRole)}
        ${detailRow("Target Company", targetCompany)}
        ${linkedinUrl ? detailRow("LinkedIn", `<a href="${linkedinUrl}" style="color:${BRAND.primary};">${linkedinUrl}</a>`) : ""}
        ${portfolioUrl ? detailRow("Portfolio", `<a href="${portfolioUrl}" style="color:${BRAND.primary};">${portfolioUrl}</a>`) : ""}
        ${jobDescriptionUrl ? detailRow("Job Link", `<a href="${jobDescriptionUrl}" style="color:${BRAND.primary};">View Job Description</a>`) : ""}
      </table>
    </div>

    <!-- Personal Message -->
    <div style="background:#EFF6FF;border-left:4px solid ${BRAND.primary};
                padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                text-transform:uppercase;letter-spacing:.05em;color:${BRAND.primary};">
        MESSAGE FROM CANDIDATE
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.7;">
        ${personalMessage}
      </p>
    </div>

    <!-- Resume Link -->
    <p style="margin:0 0 24px;">
      ${actionBtn(resumeUrl, "📄  View Resume (PDF)", "#0891B2")}
    </p>

    <!-- Action Buttons -->
    <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:${BRAND.text};">
      Respond to this request:
    </p>
    <p style="margin:0 0 16px;">
      ${actionBtn(acceptLink, "✓  Accept", BRAND.success)}
      ${actionBtn(rejectLink, "✗  Decline", BRAND.error)}
      ${actionBtn(requestInfoLink, "?  Request More Info", "#F59E0B")}
    </p>

    <!-- Schedule Meeting -->
    <div style="background:#F5F3FF;border:1px solid #DDD6FE;border-radius:8px;
                padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#5B21B6;">
        📅 Want to schedule a meeting or call?
      </p>
      <p style="margin:0 0 12px;font-size:13px;color:${BRAND.textSecondary};line-height:1.5;">
        Pick a convenient date and time to connect with ${candidateName}.
        They will receive an email notification with your chosen schedule.
      </p>
      ${actionBtn(scheduleLink, "📅  Schedule a Meeting / Call", "#7C3AED")}
    </div>

    <p style="font-size:12px;color:${BRAND.textSecondary};margin:0;">
      Request ID: <code>${requestId}</code> — You can also manage this request
      by logging into your NCPL Alumni Connect dashboard.
    </p>
  `);

// ── Template 2: Acceptance Notification (to Candidate) ────────────────────
const acceptanceToCandidate = ({
  candidateName,
  alumniName,
  alumniCompany,
  alumniJobTitle,
  requestType,
  targetJobRole,
  targetCompany,
  alumniResponse,
  dashboardLink,
}) =>
  baseWrapper(`
    <p style="font-size:16px;color:${BRAND.text};margin:0 0 8px;">
      Hi <strong>${candidateName}</strong>,
    </p>
    <p style="font-size:22px;font-weight:800;color:${BRAND.success};margin:0 0 8px;">
      Your request was accepted!
    </p>
    <p style="font-size:15px;color:${BRAND.textSecondary};margin:0 0 24px;line-height:1.6;">
      Great news! <strong>${alumniName}</strong> (${alumniJobTitle} at ${alumniCompany})
      has accepted your
      <strong>${requestType === "referral" ? "referral" : "professional reference"}</strong>
      request.
    </p>

    <div style="background:${BRAND.bg};border-radius:8px;padding:16px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${detailRow("Alumni", `${alumniName} — ${alumniJobTitle} at ${alumniCompany}`)}
        ${detailRow("Request Type", requestType === "referral" ? "Job Referral" : "Professional Reference")}
        ${detailRow("Target Role", targetJobRole)}
        ${detailRow("Target Company", targetCompany)}
        ${detailRow("Status", badge("Accepted", BRAND.success))}
      </table>
    </div>

    ${
      alumniResponse
        ? `<div style="background:#ECFDF5;border-left:4px solid ${BRAND.success};
                      padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                      text-transform:uppercase;color:${BRAND.success};">
              MESSAGE FROM ${alumniName.toUpperCase()}
            </p>
            <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.7;">
              ${alumniResponse}
            </p>
          </div>`
        : ""
    }

    <p style="font-size:14px;color:${BRAND.text};margin:0 0 24px;line-height:1.6;">
      The alumni will be in touch with you directly. Make sure your LinkedIn profile
      and resume are up to date. Best of luck with your application!
    </p>

    ${actionBtn(dashboardLink, "View My Requests Dashboard")}
  `);

// ── Template 3: Rejection Notification (to Candidate) ─────────────────────
const rejectionToCandidate = ({
  candidateName,
  alumniName,
  requestType,
  targetJobRole,
  targetCompany,
  alumniResponse,
  dashboardLink,
}) =>
  baseWrapper(`
    <p style="font-size:16px;color:${BRAND.text};margin:0 0 8px;">
      Hi <strong>${candidateName}</strong>,
    </p>
    <p style="font-size:22px;font-weight:800;color:${BRAND.text};margin:0 0 8px;">
      An update on your request
    </p>
    <p style="font-size:15px;color:${BRAND.textSecondary};margin:0 0 24px;line-height:1.6;">
      We're sorry to inform you that <strong>${alumniName}</strong> is unable to
      fulfill your ${requestType === "referral" ? "referral" : "reference"} request
      at this time.
    </p>

    <div style="background:${BRAND.bg};border-radius:8px;padding:16px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${detailRow("Request Type", requestType === "referral" ? "Job Referral" : "Professional Reference")}
        ${detailRow("Target Role", targetJobRole)}
        ${detailRow("Target Company", targetCompany)}
        ${detailRow("Status", badge("Declined", BRAND.error))}
      </table>
    </div>

    ${
      alumniResponse
        ? `<div style="background:#FEF2F2;border-left:4px solid ${BRAND.error};
                      padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                      text-transform:uppercase;color:${BRAND.error};">
              NOTE FROM ALUMNI
            </p>
            <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.7;">
              ${alumniResponse}
            </p>
          </div>`
        : ""
    }

    <p style="font-size:14px;color:${BRAND.text};margin:0 0 24px;line-height:1.6;">
      Don't be discouraged — you can search for other alumni who may be a better
      match for your target company or role.
    </p>

    ${actionBtn(dashboardLink, "Find Other Alumni")}
  `);

// ── Template 4: Additional Info Request (to Candidate) ────────────────────
const additionalInfoToCandidate = ({
  candidateName,
  alumniName,
  requestType,
  additionalInfoMessage,
  dashboardLink,
}) =>
  baseWrapper(`
    <p style="font-size:16px;color:${BRAND.text};margin:0 0 8px;">
      Hi <strong>${candidateName}</strong>,
    </p>
    <p style="font-size:22px;font-weight:800;color:${BRAND.text};margin:0 0 8px;">
      Additional information needed
    </p>
    <p style="font-size:15px;color:${BRAND.textSecondary};margin:0 0 24px;line-height:1.6;">
      <strong>${alumniName}</strong> has reviewed your
      ${requestType === "referral" ? "referral" : "reference"} request and would
      like some additional information before proceeding.
    </p>

    <div style="background:#FFFBEB;border-left:4px solid #F59E0B;
                padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                text-transform:uppercase;letter-spacing:.05em;color:#92400E;">
        INFORMATION REQUESTED BY ${alumniName.toUpperCase()}
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.7;">
        ${additionalInfoMessage}
      </p>
    </div>

    <p style="font-size:14px;color:${BRAND.text};margin:0 0 24px;line-height:1.6;">
      Please reply to this request through your dashboard. Once you provide the
      required information, ${alumniName} will review and respond.
    </p>

    ${actionBtn(dashboardLink, "Respond via Dashboard")}
  `);

// ── Template 5: Completion Notification (to Candidate) ────────────────────
const completionToCandidate = ({
  candidateName,
  alumniName,
  alumniCompany,
  requestType,
  targetJobRole,
  targetCompany,
  alumniResponse,
  dashboardLink,
}) =>
  baseWrapper(`
    <p style="font-size:16px;color:${BRAND.text};margin:0 0 8px;">
      Hi <strong>${candidateName}</strong>,
    </p>
    <p style="font-size:22px;font-weight:800;color:#7C3AED;margin:0 0 8px;">
      Your ${requestType === "referral" ? "referral" : "reference"} is complete!
    </p>
    <p style="font-size:15px;color:${BRAND.textSecondary};margin:0 0 24px;line-height:1.6;">
      <strong>${alumniName}</strong> from <strong>${alumniCompany}</strong> has
      completed your
      ${requestType === "referral" ? "job referral" : "professional reference"}
      request. You are all set!
    </p>

    <div style="background:${BRAND.bg};border-radius:8px;padding:16px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${detailRow("Alumni", alumniName)}
        ${detailRow("Request Type", requestType === "referral" ? "Job Referral" : "Professional Reference")}
        ${detailRow("Target Role", targetJobRole)}
        ${detailRow("Target Company", targetCompany)}
        ${detailRow("Status", badge("Completed", "#7C3AED"))}
      </table>
    </div>

    ${
      alumniResponse
        ? `<div style="background:#F5F3FF;border-left:4px solid #7C3AED;
                      padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                      text-transform:uppercase;color:#7C3AED;">
              FINAL NOTE FROM ${alumniName.toUpperCase()}
            </p>
            <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.7;">
              ${alumniResponse}
            </p>
          </div>`
        : ""
    }

    <p style="font-size:14px;color:${BRAND.text};margin:0 0 24px;line-height:1.6;">
      Best of luck with your job application! Keep us posted on your journey.
    </p>

    ${actionBtn(dashboardLink, "View Dashboard")}
  `);

// ── Template 6: Submission Confirmation (to Candidate) ───────────────────
const submissionConfirmationToCandidate = ({
  candidateName,
  alumniName,
  alumniCompany,
  alumniJobTitle,
  requestType,
  targetJobRole,
  targetCompany,
  jobDescriptionUrl,
  linkedinUrl,
  portfolioUrl,
  personalMessage,
  resumeUrl,
  dashboardLink,
}) =>
  baseWrapper(`
    <p style="font-size:16px;color:${BRAND.text};margin:0 0 8px;">
      Hi <strong>${candidateName}</strong>,
    </p>
    <p style="font-size:22px;font-weight:800;color:${BRAND.primary};margin:0 0 8px;">
      Request Submitted Successfully!
    </p>
    <p style="font-size:15px;color:${BRAND.textSecondary};margin:0 0 24px;line-height:1.6;">
      Your <strong>${requestType === "referral" ? "Job Referral" : "Professional Reference"}</strong>
      request has been sent to <strong>${alumniName}</strong>
      (${alumniJobTitle} at ${alumniCompany}).
      You will be notified once they respond.
    </p>

    <!-- Badge -->
    <p style="margin:0 0 20px;">
      ${badge(
        requestType === "referral" ? "Job Referral Request" : "Professional Reference Request",
        requestType === "referral" ? BRAND.primary : "#7C3AED"
      )}
    </p>

    <!-- Request Summary -->
    <div style="background:${BRAND.bg};border-radius:8px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 12px;font-size:13px;font-weight:700;
                text-transform:uppercase;letter-spacing:.05em;color:${BRAND.textSecondary};">
        REQUEST SUMMARY
      </p>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${detailRow("Sent To", `${alumniName} — ${alumniJobTitle} at ${alumniCompany}`)}
        ${detailRow("Request Type", requestType === "referral" ? "Job Referral" : "Professional Reference")}
        ${detailRow("Target Role", targetJobRole)}
        ${detailRow("Target Company", targetCompany)}
        ${linkedinUrl ? detailRow("LinkedIn", `<a href="${linkedinUrl}" style="color:${BRAND.primary};">${linkedinUrl}</a>`) : ""}
        ${portfolioUrl ? detailRow("Portfolio", `<a href="${portfolioUrl}" style="color:${BRAND.primary};">${portfolioUrl}</a>`) : ""}
        ${jobDescriptionUrl ? detailRow("Job Link", `<a href="${jobDescriptionUrl}" style="color:${BRAND.primary};">View Job Description</a>`) : ""}
        ${detailRow("Status", badge("Pending", "#F59E0B"))}
      </table>
    </div>

    <!-- Personal Message -->
    <div style="background:#EFF6FF;border-left:4px solid ${BRAND.primary};
                padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                text-transform:uppercase;letter-spacing:.05em;color:${BRAND.primary};">
        YOUR MESSAGE
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.7;">
        ${personalMessage}
      </p>
    </div>

    <!-- Resume Link -->
    <p style="margin:0 0 24px;">
      ${actionBtn(resumeUrl, "📄  View Submitted Resume (PDF)", "#0891B2")}
    </p>

    <p style="font-size:14px;color:${BRAND.text};margin:0 0 24px;line-height:1.6;">
      You can track the status of your request from your dashboard.
      We'll notify you by email as soon as the alumni responds.
    </p>

    ${actionBtn(dashboardLink, "Track My Request")}
  `);

// ── Template 7: Schedule Confirmation (to Candidate) ─────────────────────
const scheduledMeetingToCandidate = ({
  candidateName,
  alumniName,
  alumniCompany,
  alumniJobTitle,
  requestType,
  scheduledAt,
  scheduleNote,
  dashboardLink,
}) => {
  const formattedDate = new Date(scheduledAt).toLocaleString("en-IN", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
    timeZoneName: "short",
  });

  return baseWrapper(`
    <p style="font-size:16px;color:${BRAND.text};margin:0 0 8px;">
      Hi <strong>${candidateName}</strong>,
    </p>
    <p style="font-size:22px;font-weight:800;color:#7C3AED;margin:0 0 8px;">
      📅 Meeting Scheduled!
    </p>
    <p style="font-size:15px;color:${BRAND.textSecondary};margin:0 0 24px;line-height:1.6;">
      <strong>${alumniName}</strong> (${alumniJobTitle} at ${alumniCompany}) has scheduled
      a meeting with you regarding your
      <strong>${requestType === "referral" ? "Job Referral" : "Professional Reference"}</strong>
      request. Please keep this time slot free.
    </p>

    <!-- Schedule Details -->
    <div style="background:#F5F3FF;border:2px solid #7C3AED;border-radius:8px;
                padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;text-transform:uppercase;
                letter-spacing:.05em;color:#5B21B6;">SCHEDULED DATE &amp; TIME</p>
      <p style="margin:0;font-size:20px;font-weight:800;color:#5B21B6;">${formattedDate}</p>
    </div>

    <div style="background:${BRAND.bg};border-radius:8px;padding:16px;margin-bottom:24px;">
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${detailRow("Alumni", `${alumniName} — ${alumniJobTitle} at ${alumniCompany}`)}
        ${detailRow("Request Type", requestType === "referral" ? "Job Referral" : "Professional Reference")}
      </table>
    </div>

    ${scheduleNote
      ? `<div style="background:#EFF6FF;border-left:4px solid ${BRAND.primary};
                    padding:16px;border-radius:0 8px 8px 0;margin-bottom:24px;">
          <p style="margin:0 0 6px;font-size:12px;font-weight:700;
                    text-transform:uppercase;letter-spacing:.05em;color:${BRAND.primary};">
            NOTE FROM ${alumniName.toUpperCase()}
          </p>
          <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.7;">
            ${scheduleNote}
          </p>
        </div>`
      : ""}

    <p style="font-size:14px;color:${BRAND.text};margin:0 0 24px;line-height:1.6;">
      Make sure you are prepared and available at the scheduled time.
      Good luck with your meeting!
    </p>

    ${actionBtn(dashboardLink, "View My Requests Dashboard")}
  `);
};

module.exports = {
  newRequestToAlumni,
  acceptanceToCandidate,
  rejectionToCandidate,
  additionalInfoToCandidate,
  completionToCandidate,
  submissionConfirmationToCandidate,
  scheduledMeetingToCandidate,
};
