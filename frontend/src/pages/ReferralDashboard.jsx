import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { CandidateRequestCard } from "../components/RequestCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { referralAPI } from "../services/referralAPI";
import { alumniAPI } from "../services/api";

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Declined" },
];

const TYPE_FILTERS = [
  { value: "", label: "All Types" },
  { value: "referral", label: "Referrals" },
  { value: "reference", label: "References" },
];

const STAT_CARDS = [
  { key: "total", label: "Total Sent", icon: "📬", color: "bg-blue-50 border-blue-200 text-[#1A3C6E]" },
  { key: "pending", label: "Pending", icon: "⏳", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "accepted", label: "Accepted", icon: "✓", color: "bg-green-50 border-green-200 text-green-700" },
  { key: "completed", label: "Completed", icon: "🎉", color: "bg-purple-50 border-purple-200 text-purple-700" },
];

// ── Alumni mini-card for the quick search section ─────────────────────────
function AlumniMiniCard({ alumni, onRequest }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 flex gap-3">
      <div
        className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
        style={{ backgroundColor: alumni.avatarColor || "#1A3C6E" }}
      >
        {alumni.avatarInitials || alumni.fullName?.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{alumni.fullName}</p>
        <p className="text-gray-500 text-xs mt-0.5 truncate">
          {alumni.jobRole} · {alumni.company}
        </p>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {alumni.technologies?.slice(0, 3).map((t) => (
            <span key={t} className="text-xs bg-[#1A3C6E]/10 text-[#1A3C6E] px-1.5 py-0.5 rounded font-medium">
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5 justify-center">
        <button
          onClick={() => onRequest(alumni._id, "referral")}
          className="text-xs px-2 py-1 bg-[#1A3C6E] text-white rounded font-semibold hover:bg-[#2a5298] transition-colors whitespace-nowrap"
        >
          💼 Referral
        </button>
        <button
          onClick={() => onRequest(alumni._id, "reference")}
          className="text-xs px-2 py-1 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition-colors whitespace-nowrap"
        >
          📝 Reference
        </button>
      </div>
    </div>
  );
}

export default function ReferralDashboard() {
  const navigate = useNavigate();

  // Tab state: "requests" | "search"
  const [activeTab, setActiveTab] = useState("requests");

  // Stats
  const [stats, setStats] = useState(null);

  // My requests state
  const [requests, setRequests] = useState([]);
  const [reqPagination, setReqPagination] = useState(null);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqError, setReqError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [reqPage, setReqPage] = useState(1);

  // Alumni search state
  const [searchQuery, setSearchQuery] = useState("");
  const [techFilter, setTechFilter] = useState("");
  const [alumniResults, setAlumniResults] = useState([]);
  const [alumniLoading, setAlumniLoading] = useState(false);

  // Load stats
  useEffect(() => {
    referralAPI
      .getStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => {});
  }, []);

  // Load my requests
  const loadRequests = useCallback(async () => {
    setReqLoading(true);
    setReqError(null);
    try {
      const { data } = await referralAPI.getMyRequests({
        status: statusFilter || undefined,
        requestType: typeFilter || undefined,
        page: reqPage,
        limit: 8,
      });
      setRequests(data.data);
      setReqPagination(data.pagination);
    } catch (err) {
      setReqError(err.response?.data?.message || "Failed to load requests.");
    } finally {
      setReqLoading(false);
    }
  }, [statusFilter, typeFilter, reqPage]);

  useEffect(() => {
    if (activeTab === "requests") loadRequests();
  }, [activeTab, loadRequests]);

  // Alumni search
  useEffect(() => {
    if (activeTab !== "search") return;
    const timer = setTimeout(async () => {
      setAlumniLoading(true);
      try {
        const { data } = await alumniAPI.search({
          q: searchQuery || undefined,
          technology: techFilter || undefined,
          limit: 12,
        });
        setAlumniResults(data.data);
      } catch {
        setAlumniResults([]);
      } finally {
        setAlumniLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, techFilter]);

  const handleCancel = async (id) => {
    await referralAPI.cancel(id);
    loadRequests();
    referralAPI.getStats().then(({ data }) => setStats(data.data)).catch(() => {});
  };

  const handleRequestFromSearch = (alumniId, type) => {
    navigate(`/request/${alumniId}?type=${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-[#1A3C6E]">
            Referrals &amp; References
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Request job referrals and professional references from NCPL alumni.
          </p>
        </div>

        {/* Stats row */}
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

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          <button
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px
              ${activeTab === "requests"
                ? "border-[#1A3C6E] text-[#1A3C6E]"
                : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("requests")}
          >
            📋 My Requests
          </button>
          <button
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px
              ${activeTab === "search"
                ? "border-[#1A3C6E] text-[#1A3C6E]"
                : "border-transparent text-gray-500 hover:text-gray-700"}`}
            onClick={() => setActiveTab("search")}
          >
            🔍 Find Alumni
          </button>
        </div>

        {/* ── My Requests Tab ─────────────────────────────────────────── */}
        {activeTab === "requests" && (
          <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-4">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setReqPage(1); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A3C6E]"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setReqPage(1); }}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A3C6E]"
              >
                {TYPE_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              {(statusFilter || typeFilter) && (
                <button
                  onClick={() => { setStatusFilter(""); setTypeFilter(""); setReqPage(1); }}
                  className="text-sm text-red-500 font-semibold hover:text-red-700"
                >
                  Clear filters
                </button>
              )}
            </div>

            {reqLoading && <LoadingSpinner text="Loading your requests..." />}
            {!reqLoading && reqError && (
              <div className="text-center py-12 text-red-500">{reqError}</div>
            )}
            {!reqLoading && !reqError && requests.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-semibold text-gray-700">No requests yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  Switch to "Find Alumni" to discover alumni and send your first request.
                </p>
                <button
                  onClick={() => setActiveTab("search")}
                  className="mt-4 px-4 py-2 bg-[#1A3C6E] text-white rounded-lg text-sm font-semibold hover:bg-[#2a5298] transition-colors"
                >
                  Find Alumni
                </button>
              </div>
            )}
            {!reqLoading && !reqError && requests.length > 0 && (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  {requests.map((req) => (
                    <CandidateRequestCard
                      key={req._id}
                      request={req}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {reqPagination && reqPagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      disabled={reqPage === 1}
                      onClick={() => setReqPage((p) => p - 1)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40"
                    >
                      ←
                    </button>
                    <span className="px-3 py-1.5 text-sm text-gray-600">
                      Page {reqPage} of {reqPagination.totalPages}
                    </span>
                    <button
                      disabled={reqPage === reqPagination.totalPages}
                      onClick={() => setReqPage((p) => p + 1)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-40"
                    >
                      →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Find Alumni Tab ──────────────────────────────────────────── */}
        {activeTab === "search" && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, company, technology..."
                className="flex-1 min-w-48 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A3C6E]"
              />
              <input
                type="text"
                value={techFilter}
                onChange={(e) => setTechFilter(e.target.value)}
                placeholder="Filter by tech (React, Java...)"
                className="min-w-40 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1A3C6E]"
              />
            </div>

            {alumniLoading && <LoadingSpinner text="Searching alumni..." />}
            {!alumniLoading && alumniResults.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-gray-700">No alumni found</p>
                <p className="text-gray-500 text-sm mt-1">Try a different search term.</p>
              </div>
            )}
            {!alumniLoading && alumniResults.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {alumniResults.map((alumni) => (
                  <AlumniMiniCard
                    key={alumni._id}
                    alumni={alumni}
                    onRequest={handleRequestFromSearch}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
