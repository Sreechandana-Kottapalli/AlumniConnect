import React from "react";

export default function LoadingSpinner({ text = "Loading...", small = false }) {
  return (
    <div className="spinner-overlay" role="status" aria-live="polite">
      <div className={`spinner${small ? " spinner-sm" : ""}`} aria-hidden="true" />
      <p className="spinner-text">{text}</p>
    </div>
  );
}
