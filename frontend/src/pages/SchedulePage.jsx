import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function SchedulePage() {
  const { requestId } = useParams();

  const [info, setInfo]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [terminal, setTerminal]   = useState(false);
  const [alreadySet, setAlreadySet] = useState(false);

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [scheduleNote, setScheduleNote]   = useState("");

  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess]         = useState(false);
  const [confirmedAt, setConfirmedAt] = useState(null);

  // Minimum datetime = now + 15 min
  const minDatetime = (() => {
    const d = new Date(Date.now() + 15 * 60 * 1000);
    return d.toISOString().slice(0, 16);
  })();

  useEffect(() => {
    axios
      .get(`/api/schedule/${requestId}`)
      .then(({ data }) => {
        setInfo(data.data);
        if (data.data.isTerminal)   setTerminal(true);
        if (data.data.scheduledAt)  setAlreadySet(true);
      })
      .catch((err) => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [requestId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!scheduledDate || !scheduledTime) {
      setSubmitError("Please select both a date and a time.");
      return;
    }

    const isoString = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();

    setSubmitting(true);
    try {
      await axios.post(`/api/schedule/${requestId}`, {
        scheduledAt:  isoString,
        scheduleNote: scheduleNote.trim() || undefined,
      });
      setConfirmedAt(new Date(`${scheduledDate}T${scheduledTime}`));
      setSuccess(true);
    } catch (err) {
      setSubmitError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#1A3C6E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading request details...</p>
        </div>
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────
  if (notFound || !info) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Request Not Found</h2>
          <p className="text-gray-500 text-sm">
            This scheduling link is invalid or has expired.
          </p>
        </div>
      </div>
    );
  }

  // ── Terminal (rejected/completed) ────────────────────────────────────────
  if (terminal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-5xl mb-4">🔒</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Scheduling Unavailable</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            This request has been <strong>{info.status}</strong> and scheduling is
            no longer available.
          </p>
        </div>
      </div>
    );
  }

  // ── Success ──────────────────────────────────────────────────────────────
  if (success) {
    const formatted = confirmedAt?.toLocaleString("en-IN", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📅</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#5B21B6] mb-2">
            Meeting Scheduled!
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            <strong>{info.candidateName}</strong> has been notified by email
            with the meeting details.
          </p>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
            <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">
              Scheduled For
            </p>
            <p className="font-bold text-purple-800 text-base">{formatted}</p>
          </div>
          {scheduleNote.trim() && (
            <div className="mt-3 bg-gray-50 rounded-xl p-4 text-left">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Your Note</p>
              <p className="text-sm text-gray-700">{scheduleNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Already scheduled banner ─────────────────────────────────────────────
  const existingDate = alreadySet ? new Date(info.scheduledAt) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1A3C6E] py-4 px-6 shadow-md">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F4A823] rounded-lg flex items-center justify-center font-extrabold text-[#1A3C6E] text-base">
            N
          </div>
          <span className="text-white font-bold text-base tracking-wide">
            NCPL Alumni Connect
          </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-8">
        {/* Context card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              📋
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">
                {info.requestType === "referral" ? "Job Referral" : "Professional Reference"} Request
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                From: <strong>{info.candidateName}</strong>
              </p>
              <p className="text-gray-500 text-xs">
                Role: <strong>{info.targetJobRole}</strong> at <strong>{info.targetCompany}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Already scheduled notice */}
        {alreadySet && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-5 flex gap-2 items-start">
            <span className="text-xl flex-shrink-0">⚠️</span>
            <div>
              <p className="text-sm font-bold text-yellow-800">Meeting already scheduled</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                Currently set for{" "}
                <strong>
                  {existingDate?.toLocaleString("en-IN", {
                    weekday: "short", year: "numeric", month: "short", day: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </strong>. Submitting below will replace it.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h1 className="text-xl font-extrabold text-[#1A3C6E] mb-1">
            📅 Schedule a Meeting
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Choose a convenient date and time to connect with{" "}
            <strong>{info.candidateName}</strong>. They will receive an email
            notification with the schedule details.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Date + Time side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="sched-date">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="sched-date"
                  type="date"
                  min={minDatetime.slice(0, 10)}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg
                             focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="sched-time">
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="sched-time"
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg
                             focus:outline-none focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {/* Optional note */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="sched-note">
                Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="sched-note"
                rows={3}
                maxLength={500}
                value={scheduleNote}
                onChange={(e) => setScheduleNote(e.target.value)}
                placeholder={`e.g. "We'll connect via Google Meet. I'll send the link on your email."`}
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg
                           resize-none focus:outline-none focus:border-[#7C3AED]"
              />
              <p className="text-xs text-gray-400 mt-1 text-right">
                {scheduleNote.length} / 500
              </p>
            </div>

            {/* Error */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#7C3AED] text-white font-bold rounded-xl text-sm
                         hover:bg-[#6D28D9] disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors"
            >
              {submitting ? "Scheduling..." : "Confirm Schedule & Notify Candidate"}
            </button>

            <p className="text-xs text-gray-400 text-center leading-relaxed">
              {info.candidateName} will receive an email with the scheduled date, time,
              and your note (if provided).
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
