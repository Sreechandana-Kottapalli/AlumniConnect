import React from "react";
import { useNavigate } from "react-router-dom";

const AVAILABILITY_LABEL = {
  available: "Available",
  busy: "Busy",
  not_available: "Not Available",
};

export default function AlumniCard({ alumni }) {
  const navigate = useNavigate();
  const initials =
    alumni.avatarInitials ||
    alumni.fullName
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <article
      className="alumni-card"
      onClick={() => navigate(`/alumni/${alumni._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/alumni/${alumni._id}`)}
      aria-label={`View profile of ${alumni.fullName}`}
    >
      {/* Top row: avatar + name + badge */}
      <div className="card-top">
        <div
          className="card-avatar"
          style={{ backgroundColor: alumni.avatarColor || "#1A3C6E" }}
        >
          {alumni.profilePhoto ? (
            <img src={alumni.profilePhoto} alt={alumni.fullName} />
          ) : (
            initials
          )}
        </div>

        <div className="card-info">
          <p className="card-name">{alumni.fullName}</p>
          <p className="card-role">
            {alumni.jobRole} &bull; {alumni.company}
          </p>
        </div>

        <span className={`availability-badge ${alumni.availabilityStatus}`}>
          {AVAILABILITY_LABEL[alumni.availabilityStatus] || alumni.availabilityStatus}
        </span>
      </div>

      {/* Meta info */}
      <div className="card-meta">
        {alumni.yearsOfExperience !== undefined && (
          <span className="meta-item">
            <span className="meta-icon">&#128197;</span>
            {alumni.yearsOfExperience} yr{alumni.yearsOfExperience !== 1 ? "s" : ""} exp
          </span>
        )}
        {alumni.batch && (
          <span className="meta-item">
            <span className="meta-icon">&#127891;</span>
            Batch {alumni.batch}
          </span>
        )}
        {alumni.location && (
          <span className="meta-item">
            <span className="meta-icon">&#128205;</span>
            {alumni.location}
          </span>
        )}
      </div>

      {/* Technology tags */}
      {alumni.technologies?.length > 0 && (
        <div className="card-tech">
          {alumni.technologies.slice(0, 4).map((tech) => (
            <span key={tech} className="tech-tag">{tech}</span>
          ))}
          {alumni.technologies.length > 4 && (
            <span className="tech-tag">+{alumni.technologies.length - 4}</span>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="card-footer">
        <button
          className="btn-view-profile"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/alumni/${alumni._id}`);
          }}
          tabIndex={-1}
        >
          View Profile &#8594;
        </button>
      </div>
    </article>
  );
}
