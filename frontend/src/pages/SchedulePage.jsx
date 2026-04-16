import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "/api";

export default function SchedulePage() {
  const { requestId } = useParams();

  const [info, setInfo]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("");
  const [notes, setNotes]       = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError]   = useState(null);

  // Today's date in YYYY-MM-DD for the min attribute
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    axios
      .get(`${API_BASE}/schedule/${requestId}`)
      .then(({ data }) => setInfo(data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "This scheduling link is invalid or has expired.")
      )
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time) {
      setFormError("Please select both a date and a time.");
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/schedule/${requestId}`, { date, time, notes });
      setSubmitted(true);
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>N</div>
          <p style={styles.subtitle}>Loading scheduling details…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>N</div>
          <h2 style={{ ...styles.heading, color: "#EF4444" }}>Link Not Found</h2>
          <p style={styles.subtitle}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Already submitted ────────────────────────────────────────────────────
  if (submitted || info?.alumniAvailability) {
    const av = info?.alumniAvailability;
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.logo}>N</div>
          <div style={styles.successIcon}>✓</div>
          <h2 style={{ ...styles.heading, color: "#10B981" }}>
            Availability Submitted!
          </h2>
          <p style={styles.subtitle}>
            <strong>{info.candidateName}</strong> has been notified of your
            availability. They will reach out to confirm the meeting.
          </p>
          {(av || submitted) && (
            <div style={styles.scheduleBox}>
              <p style={styles.scheduleLabel}>YOUR SCHEDULED TIME</p>
              <p style={styles.scheduleDate}>{date || av?.date}</p>
              <p style={styles.scheduleTime}>{time || av?.time}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.logo}>N</div>
        <p style={styles.brand}>NCPL Alumni Connect</p>

        <div style={styles.typeBadge(info.requestType === "referral")}>
          {info.requestType === "referral" ? "Job Referral Request" : "Professional Reference Request"}
        </div>

        <h2 style={styles.heading}>Share Your Availability</h2>
        <p style={styles.subtitle}>
          Hi <strong>{info.alumniName}</strong>, {info.candidateName} has
          requested a{" "}
          {info.requestType === "referral" ? "job referral" : "professional reference"}{" "}
          for the <strong>{info.targetJobRole}</strong> role at{" "}
          <strong>{info.targetCompany}</strong>.
        </p>
        <p style={{ ...styles.subtitle, marginTop: 0 }}>
          Please select a date and time when you'd be available to connect.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Date */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="schedule-date">
              Preferred Date <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              id="schedule-date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Time */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="schedule-time">
              Preferred Time <span style={{ color: "#EF4444" }}>*</span>
            </label>
            <input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          {/* Notes */}
          <div style={styles.field}>
            <label style={styles.label} htmlFor="schedule-notes">
              Additional Notes{" "}
              <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="schedule-notes"
              rows={3}
              maxLength={500}
              placeholder="e.g. I'm available via Google Meet. My email is…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ ...styles.input, resize: "vertical" }}
            />
            <p style={styles.charCount}>{notes.length}/500</p>
          </div>

          {formError && <p style={styles.errorMsg}>{formError}</p>}

          <button
            type="submit"
            disabled={submitting}
            style={styles.submitBtn(submitting)}
          >
            {submitting ? "Submitting…" : "📅  Submit Availability"}
          </button>
        </form>

        <p style={styles.footer}>
          The candidate will be notified by email immediately after you submit.
        </p>
      </div>
    </div>
  );
}

// ── Inline styles ────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#F5F7FA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px 16px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    padding: "40px 36px",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
  },
  logo: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "52px",
    height: "52px",
    borderRadius: "12px",
    background: "#1A3C6E",
    color: "#F4A823",
    fontSize: "26px",
    fontWeight: 800,
    marginBottom: "8px",
  },
  brand: {
    fontSize: "15px",
    fontWeight: 700,
    color: "#1A3C6E",
    margin: "0 0 16px",
  },
  typeBadge: (isReferral) => ({
    display: "inline-block",
    padding: "4px 14px",
    borderRadius: "99px",
    fontSize: "12px",
    fontWeight: 700,
    background: isReferral ? "#EFF6FF" : "#F5F3FF",
    color: isReferral ? "#1A3C6E" : "#7C3AED",
    marginBottom: "16px",
  }),
  heading: {
    fontSize: "22px",
    fontWeight: 800,
    color: "#1C1C1E",
    margin: "0 0 12px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    margin: "0 0 16px",
    lineHeight: 1.6,
    textAlign: "left",
  },
  form: {
    textAlign: "left",
    marginTop: "8px",
  },
  field: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #D1D5DB",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#1C1C1E",
    outline: "none",
    boxSizing: "border-box",
  },
  charCount: {
    fontSize: "12px",
    color: "#9CA3AF",
    margin: "4px 0 0",
    textAlign: "right",
  },
  errorMsg: {
    fontSize: "13px",
    color: "#EF4444",
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "6px",
    padding: "10px 14px",
    margin: "0 0 16px",
  },
  submitBtn: (disabled) => ({
    width: "100%",
    padding: "13px",
    background: disabled ? "#9CA3AF" : "#7C3AED",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "background 0.2s",
  }),
  successIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#ECFDF5",
    color: "#10B981",
    fontSize: "28px",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 12px",
  },
  scheduleBox: {
    background: "#F5F3FF",
    border: "2px solid #DDD6FE",
    borderRadius: "10px",
    padding: "20px",
    marginTop: "20px",
  },
  scheduleLabel: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: ".08em",
    color: "#7C3AED",
    textTransform: "uppercase",
    margin: "0 0 8px",
  },
  scheduleDate: {
    fontSize: "24px",
    fontWeight: 800,
    color: "#1C1C1E",
    margin: "0 0 4px",
  },
  scheduleTime: {
    fontSize: "18px",
    fontWeight: 600,
    color: "#7C3AED",
    margin: 0,
  },
  footer: {
    fontSize: "12px",
    color: "#9CA3AF",
    marginTop: "20px",
  },
};
