import React from "react";

const STEPS = [
  { key: "pending", label: "Submitted", icon: "📤" },
  { key: "accepted", label: "Accepted", icon: "✓" },
  { key: "in_progress", label: "In Progress", icon: "⚡" },
  { key: "completed", label: "Completed", icon: "🎉" },
];

const STATUS_META = {
  pending: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", dot: "bg-amber-400", label: "Pending" },
  accepted: { color: "text-green-700", bg: "bg-green-50", border: "border-green-300", dot: "bg-green-500", label: "Accepted" },
  rejected: { color: "text-red-700", bg: "bg-red-50", border: "border-red-300", dot: "bg-red-500", label: "Declined" },
  in_progress: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-300", dot: "bg-blue-500", label: "In Progress" },
  completed: { color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-300", dot: "bg-purple-500", label: "Completed" },
};

/**
 * StatusBadge — inline pill badge for a request status.
 */
export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold
                  ${meta.color} ${meta.bg} border ${meta.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

/**
 * StatusTracker — horizontal progress stepper.
 * Renders the 4-step happy path; shows rejected state separately.
 */
export default function StatusTracker({ status, statusHistory = [] }) {
  if (status === "rejected") {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
        <span className="text-2xl">✗</span>
        <div>
          <p className="font-semibold text-red-700 text-sm">Request Declined</p>
          <p className="text-red-500 text-xs mt-0.5">
            The alumni was unable to fulfil this request at this time.
          </p>
        </div>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="relative">
      {/* Track line */}
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 mx-8 z-0" />

      <div className="relative z-10 flex justify-between">
        {STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;

          return (
            <div key={step.key} className="flex flex-col items-center gap-1.5 flex-1">
              {/* Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  border-2 transition-all
                  ${done
                    ? "bg-[#1A3C6E] border-[#1A3C6E] text-white"
                    : active
                      ? "bg-white border-[#F4A823] text-[#1A3C6E] shadow-sm"
                      : "bg-white border-gray-300 text-gray-300"
                  }`}
              >
                {done ? "✓" : step.icon}
              </div>

              {/* Label */}
              <span
                className={`text-xs font-semibold text-center leading-tight
                  ${active ? "text-[#1A3C6E]" : done ? "text-gray-500" : "text-gray-300"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Status history mini-log (last 3 entries) */}
      {statusHistory.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {[...statusHistory].reverse().slice(0, 3).map((entry, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-gray-500">
              <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
              <span>
                <span className="font-semibold capitalize">{entry.status.replace("_", " ")}</span>
                {entry.note && ` — ${entry.note}`}
                {" · "}
                {new Date(entry.changedAt || entry.changed_at).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
