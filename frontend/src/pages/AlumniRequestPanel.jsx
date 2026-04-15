import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { AlumniRequestCard } from "../components/RequestCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { referralAPI } from "../services/referralAPI";

const STATUS_TABS = [
  { value: "", label: "All", icon: "📋" },
  { value: "pending", label: "Pending", icon: "⏳" },
  { value: "accepted", label: "Accepted", icon: "✓" },
  { value: "in_progress", label: "Info Needed", icon: "❓" },
  { value: "completed", label: "Completed", icon: "🎉" },
  { value: "rejected", label: "Declined", icon: "✗" },
];

const STAT_CARDS = [
  { key: "total", label: "Total Received", icon: "📬", color: "bg-blue-50 border-blue-200 text-[#1A3C6E]" },
  { key: "pending", label: "Awaiting Response", icon: "⏳", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "accepted", label: "Accepted", icon: "✓", color: "bg-green-50 border-green-200 text-green-700" },
  { key: "completed", label: "Completed", icon: "🎉", color: "bg-purple-50 border-purple-200 text-purple-700" },
];

export default function AlumniRequestPanel() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-handle action links from email (accept/reject/info)
  const emailAction = searchParams.get("action");
  const emailRequestId = searchParams.get("id");

  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [emailActionHandled, setEmailActionHandled] = useState(false);

  const loadStats = useCallback(() =>
    referralAPI
      .getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {}),
  []);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await referralAPI.getIncomingRequests({
        status: statusFilter || undefined,
        requestType: typeFilter || undefined,
        page,
        limit: 8,
      });
      setRequests(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Handle email action links (auto-expand the relevant card)
  useEffect(() => {
    if (emailAction && emailRequestId && !emailActionHandled) {
      setEmailActionHandled(true);
      // Clear the params after processing
      setSearchParams({});
      // The AlumniRequestCard handles actions through onUpdateStatus
    }
  }, [emailAction, emailRequestId, emailActionHandled, setSearchParams]);

  const handleUpdateStatus = async (id, data) => {
    await referralAPI.updateStatus(id, data);
    loadRequests();
    loadStats();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1A3C6E]">
            Request Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Review and respond to referral and reference requests from candidates.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map(({ key, label, icon, color }) => (
            <div key={key} className={`rounded-xl border p-4 ${color}`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{icon}</span>
                <span className="text-2xl font-extrabold">
                  {stats ? stats[key] : "—"}
                </span>
              </div>
              <p className="font-semibold text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Status tab filters */}
        <div className="flex overflow-x-auto gap-1 mb-5 pb-1">
          {STATUS_TABS.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => { setStatusFilter(value); setPage(1); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                           whitespace-nowrap transition-colors border
                ${statusFilter === value
                  ? "bg-[#1A3C6E] text-white border-[#1A3C6E]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1A3C6E] hover:text-[#1A3C6E]"}`}
            >
              <span>{icon}</span> {label}
              {value === "" && stats && (
                <span className="ml-1 bg-[#F4A823] text-[#1A3C6E] rounded-full px-1.5 text-[10px] font-bold">
                  {stats.total}
                </span>
              )}
              {value === "pending" && stats?.pending > 0 && (
                <span className="ml-1 bg-amber-400 text-white rounded-full px-1.5 text-[10px] font-bold">
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex items-center gap-3 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A3C6E]"
          >
            <option value="">All Types</option>
            <option value="referral">Referrals Only</option>
            <option value="reference">References Only</option>
          </select>
          {(statusFilter || typeFilter) && (
            <button
              onClick={() => { setStatusFilter(""); setTypeFilter(""); setPage(1); }}
              className="text-sm text-red-500 font-semibold hover:text-red-700"
            >
              Clear
            </button>
          )}
          <span className="text-sm text-gray-500 ml-auto">
            {pagination?.total ?? "—"} request{pagination?.total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Content */}
        {loading && <LoadingSpinner text="Loading requests..." />}

        {!loading && error && (
          <div className="text-center py-12">
            <p className="text-red-500 font-semibold">{error}</p>
            <button
              onClick={loadRequests}
              className="mt-3 px-4 py-2 bg-[#1A3C6E] text-white text-sm rounded-lg font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && requests.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold text-gray-700">No requests found</p>
            <p className="text-gray-500 text-sm mt-1">
              {statusFilter
                ? "No requests with this status. Try clearing the filter."
                : "You haven't received any requests yet. Make sure your alumni profile email matches your login email."}
            </p>
          </div>
        )}

        {!loading && !error && requests.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {requests.map((req) => (
                <AlumniRequestCard
                  key={req._id}
                  request={req}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40"
                >
                  ←
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
