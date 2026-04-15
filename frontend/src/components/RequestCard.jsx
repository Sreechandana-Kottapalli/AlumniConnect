import React, { useState } from "react";
import { StatusBadge } from "./StatusTracker";
import StatusTracker from "./StatusTracker";

const REQUEST_TYPE_META = {
  referral: { label: "Job Referral", icon: "💼", color: "text-[#1A3C6E] bg-blue-50 border-blue-200" },
  reference: { label: "Professional Reference", icon: "📝", color: "text-purple-700 bg-purple-50 border-purple-200" },
};

/**
 * CandidateRequestCard — shown in the Referral Dashboard (candidate view).
 */
export function CandidateRequestCard({ request, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const type = REQUEST_TYPE_META[request.requestType] || REQUEST_TYPE_META.referral;
  const alumni = request.alumni;

  const handleCancel = async () => {
    if (!window.confirm("Cancel this request?")) return;
    setCancelling(true);
    try {
      await onCancel(request._id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
      {/* Card header */}
      <div className="p-4 flex items-start gap-3">
        {/* Alumni avatar */}
        <div
          className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white text-base"
          style={{ backgroundColor: alumni?.avatarColor || "#1A3C6E" }}
        >
          {alumni?.avatarInitials ||
            alumni?.fullName?.slice(0, 2).toUpperCase() || "AL"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-gray-900 text-sm">{alumni?.fullName}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {alumni?.jobRole} &bull; {alumni?.company}
              </p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${type.color}`}>
              {type.icon} {type.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(request.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>

          <p className="text-xs text-gray-600 mt-1.5">
            <span className="font-semibold">Target:</span> {request.targetJobRole} at {request.targetCompany}
          </p>
        </div>
      </div>

      {/* Expand / collapse */}
      <div
        className="border-t border-gray-100 px-4 py-2 flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <span className="text-xs font-semibold text-[#1A3C6E]">
          {expanded ? "Hide details ▲" : "View details ▼"}
        </span>
        {request.status === "pending" && (
          <button
            onClick={(e) => { e.stopPropagation(); handleCancel(); }}
            disabled={cancelling}
            className="text-xs text-red-500 hover:text-red-700 font-semibold transition-colors"
          >
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {/* Status tracker */}
          <StatusTracker status={request.status} statusHistory={request.statusHistory} />

          {/* Alumni response */}
          {request.alumniResponse && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Response from Alumni
              </p>
              <p className="text-sm text-gray-700">{request.alumniResponse}</p>
            </div>
          )}

          {/* Additional info request */}
          {request.additionalInfoRequest && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
                Additional Info Requested
              </p>
              <p className="text-sm text-amber-800">{request.additionalInfoRequest}</p>
            </div>
          )}

          {/* Resume link */}
          {request.resumeUrl && (
            <a
              href={request.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#1A3C6E] font-semibold hover:underline"
            >
              📄 View My Resume
            </a>
          )}

          {/* Personal message */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Your Message
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">{request.personalMessage}</p>
          </div>
        </div>
      )}
    </article>
  );
}

/**
 * AlumniRequestCard — shown in the Alumni Request Panel.
 */
export function AlumniRequestCard({ request, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState(request.alumniResponse || "");
  const [infoMsg, setInfoMsg] = useState(request.additionalInfoRequest || "");
  const [submitting, setSubmitting] = useState(false);
  const type = REQUEST_TYPE_META[request.requestType] || REQUEST_TYPE_META.referral;
  const candidate = request.candidate;

  const handleAction = async (status) => {
    if (status === "rejected" && !response.trim()) {
      alert("Please provide a brief note before declining.");
      return;
    }
    setSubmitting(true);
    try {
      await onUpdateStatus(request._id, {
        status,
        alumniResponse: response,
        additionalInfoRequest: status === "in_progress" ? infoMsg : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canAct = !["rejected", "completed"].includes(request.status);

  return (
    <article className="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-[#1A3C6E] flex-shrink-0 flex items-center
                        justify-center font-bold text-white text-base">
          {candidate?.name?.charAt(0).toUpperCase() || "C"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-gray-900 text-sm">{candidate?.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{candidate?.email}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${type.color}`}>
              {type.icon} {type.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(request.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          </div>

          <p className="text-xs text-gray-600 mt-1.5">
            <span className="font-semibold">Target:</span> {request.targetJobRole} at {request.targetCompany}
          </p>
        </div>
      </div>

      {/* Expand toggle */}
      <div
        className="border-t border-gray-100 px-4 py-2 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <span className="text-xs font-semibold text-[#1A3C6E]">
          {expanded ? "Hide ▲" : "Review & Respond ▼"}
        </span>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-4">
          {/* Candidate materials */}
          <div className="flex flex-wrap gap-3">
            {request.resumeUrl && (
              <a
                href={request.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-[#1A3C6E] text-white px-3 py-1.5 rounded-md font-semibold hover:bg-[#2a5298] transition-colors"
              >
                📄 View Resume
              </a>
            )}
            {request.linkedinUrl && (
              <a
                href={request.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-[#0A66C2] text-white px-3 py-1.5 rounded-md font-semibold hover:opacity-85 transition-opacity"
              >
                LinkedIn
              </a>
            )}
            {request.jobDescriptionUrl && (
              <a
                href={request.jobDescriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-md font-semibold hover:bg-gray-50 transition-colors"
              >
                Job Description
              </a>
            )}
          </div>

          {/* Message */}
          <div className="bg-blue-50 rounded-lg p-3">
            <p className="text-xs font-bold text-[#1A3C6E] uppercase tracking-wide mb-1">
              Message from Candidate
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{request.personalMessage}</p>
          </div>

          {/* Response actions (only if not terminal) */}
          {canAct && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Your Response (optional note to candidate)
                </label>
                <textarea
                  rows={3}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  maxLength={1000}
                  placeholder="Write a message to the candidate..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1A3C6E] resize-none"
                />
              </div>

              {/* Additional info text field (shown when clicking "Request Info") */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Additional Info Request (if needed)
                </label>
                <input
                  type="text"
                  value={infoMsg}
                  onChange={(e) => setInfoMsg(e.target.value)}
                  maxLength={500}
                  placeholder="Specify what additional information you need..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1A3C6E]"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  onClick={() => handleAction("accepted")}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => handleAction("in_progress")}
                  disabled={submitting || !infoMsg.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  ? Request Info
                </button>
                <button
                  onClick={() => handleAction("completed")}
                  disabled={submitting || request.status !== "accepted"}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  ✓✓ Mark Complete
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  ✗ Decline
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
