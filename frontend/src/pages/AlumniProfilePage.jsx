import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { alumniAPI } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";

const AVAILABILITY_LABEL = {
  available: "Available for Mentorship",
  busy: "Busy",
  not_available: "Not Available",
};

export default function AlumniProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    alumniAPI
      .getById(id)
      .then(({ data }) => setAlumni(data.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load profile.")
      )
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page-wrapper">
      {/* Navbar */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-logo">N</div>
            <span className="navbar-title">NCPL Alumni Connect</span>
          </div>
          <div className="navbar-right">
            <span className="navbar-user">Hi, {user?.name?.split(" ")[0]}</span>
            <button className="btn-logout" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </nav>

      <main className="profile-page">
        <div className="container">
          <button className="btn-back" onClick={() => navigate(-1)}>
            &#8592; Back to Search
          </button>

          {loading && <LoadingSpinner text="Loading profile..." />}

          {!loading && error && (
            <div className="error-state">
              <span className="error-icon">&#9888;</span>
              <p className="error-title">Could not load profile</p>
              <p className="error-sub">{error}</p>
              <button className="btn-retry" onClick={() => navigate(-1)}>Go Back</button>
            </div>
          )}

          {!loading && !error && alumni && (
            <div className="profile-card">
              {/* Banner */}
              <div className="profile-banner" />

              {/* Header */}
              <div className="profile-header">
                <div
                  className="profile-avatar-wrap"
                  style={{ backgroundColor: alumni.avatarColor || "#1A3C6E" }}
                >
                  {alumni.profilePhoto ? (
                    <img src={alumni.profilePhoto} alt={alumni.fullName} />
                  ) : (
                    alumni.avatarInitials || alumni.fullName?.slice(0, 2).toUpperCase()
                  )}
                </div>

                <div className="profile-title-row">
                  <div>
                    <h1 className="profile-name">{alumni.fullName}</h1>
                    <p className="profile-role-company">
                      {alumni.jobRole} &mdash; {alumni.company}
                    </p>
                  </div>
                  <div className="profile-actions">
                    <span className={`availability-badge ${alumni.availabilityStatus}`}>
                      {AVAILABILITY_LABEL[alumni.availabilityStatus] || alumni.availabilityStatus}
                    </span>
                    {alumni.linkedinProfile && (
                      <a
                        href={alumni.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-linkedin"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                {/* ── Referral / Reference CTA buttons ───────────────── */}
                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    to={`/request/${alumni._id}?type=referral`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 20px",
                      background: "#1A3C6E",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      textDecoration: "none",
                    }}
                  >
                    💼 Request Referral
                  </Link>
                  <Link
                    to={`/request/${alumni._id}?type=reference`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 20px",
                      background: "#7C3AED",
                      color: "#fff",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "700",
                      textDecoration: "none",
                    }}
                  >
                    📝 Request Reference
                  </Link>
                  {alumni.email && (
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                        alumni.email
                      )}&su=${encodeURIComponent(
                        "Reaching out via NCPL Alumni Connect"
                      )}&body=${encodeURIComponent(
                        `Hi ${alumni.fullName},\n\nI found your profile on NCPL Alumni Connect and would like to connect with you.\n\nMy name is ${user?.name || ""}.\n\nLooking forward to hearing from you!\n\nBest regards,\n${user?.name || ""}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "10px 20px",
                        background: "#059669",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "700",
                        textDecoration: "none",
                      }}
                    >
                      ✉️ Mail Request
                    </a>
                  )}
                </div>
              </div>

              <div className="divider" />

              {/* Body */}
              <div className="profile-body">
                {/* About */}
                {alumni.bio && (
                  <div>
                    <p className="profile-section-title">About</p>
                    <p className="profile-bio">{alumni.bio}</p>
                  </div>
                )}

                {/* Meta grid */}
                <div>
                  <p className="profile-section-title">Details</p>
                  <div className="profile-meta-grid">
                    <div className="profile-meta-item">
                      <span className="meta-label">Email</span>
                      <span className="meta-value">{alumni.email}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="meta-label">Company</span>
                      <span className="meta-value">{alumni.company}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="meta-label">Job Role</span>
                      <span className="meta-value">{alumni.jobRole}</span>
                    </div>
                    <div className="profile-meta-item">
                      <span className="meta-label">Experience</span>
                      <span className="meta-value">
                        {alumni.yearsOfExperience}{" "}
                        {alumni.yearsOfExperience === 1 ? "year" : "years"}
                      </span>
                    </div>
                    {alumni.batch && (
                      <div className="profile-meta-item">
                        <span className="meta-label">Batch</span>
                        <span className="meta-value">{alumni.batch}</span>
                      </div>
                    )}
                    {alumni.location && (
                      <div className="profile-meta-item">
                        <span className="meta-label">Location</span>
                        <span className="meta-value">{alumni.location}</span>
                      </div>
                    )}
                    {alumni.domain && (
                      <div className="profile-meta-item">
                        <span className="meta-label">Domain</span>
                        <span className="meta-value">{alumni.domain}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Technologies */}
                {alumni.technologies?.length > 0 && (
                  <div>
                    <p className="profile-section-title">Technologies</p>
                    <div className="profile-tech-list">
                      {alumni.technologies.map((tech) => (
                        <span key={tech} className="profile-tech-tag">{tech}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
