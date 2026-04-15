import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAlumniSearch } from "../hooks/useAlumniSearch";
import FilterPanel from "../components/FilterPanel";
import AlumniCard from "../components/AlumniCard";
import Pagination from "../components/Pagination";
import LoadingSpinner from "../components/LoadingSpinner";

const SORT_OPTIONS = [
  { label: "Newest first", sortBy: "createdAt", sortOrder: "desc" },
  { label: "Oldest first", sortBy: "createdAt", sortOrder: "asc" },
  { label: "Name A–Z", sortBy: "fullName", sortOrder: "asc" },
  { label: "Name Z–A", sortBy: "fullName", sortOrder: "desc" },
  { label: "Most experienced", sortBy: "yearsOfExperience", sortOrder: "desc" },
  { label: "Least experienced", sortBy: "yearsOfExperience", sortOrder: "asc" },
];

export default function SearchPage() {
  const { user, logout } = useAuth();
  const {
    filters,
    sort,
    page,
    results,
    pagination,
    loading,
    error,
    filterOptions,
    updateFilter,
    updateSort,
    setPage,
    clearFilters,
    retry,
  } = useAlumniSearch();

  const [inputValue, setInputValue] = useState(filters.q);

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter("q", inputValue.trim());
  };

  const handleSortChange = (e) => {
    const opt = SORT_OPTIONS[Number(e.target.value)];
    updateSort(opt.sortBy, opt.sortOrder);
  };

  const currentSortIdx = SORT_OPTIONS.findIndex(
    (o) => o.sortBy === sort.sortBy && o.sortOrder === sort.sortOrder
  );

  const hasActiveFilters =
    filters.technology || filters.company || filters.jobRole ||
    filters.minExp || filters.maxExp || filters.availability;

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

      <main className="search-page">
        <div className="container">
          {/* Hero search bar */}
          <div className="search-hero">
            <h1 className="search-hero-title">Find Alumni by Technology</h1>
            <p className="search-hero-sub">
              Connect with NCPL placed alumni. Filter by tech, company, role, and experience.
            </p>
            <form className="search-input-wrap" onSubmit={handleSearch}>
              <div className="search-box">
                <span className="search-icon" aria-hidden="true">&#128269;</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, company, technology..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  aria-label="Search alumni"
                />
              </div>
              <button type="submit" className="btn-search">Search</button>
            </form>
          </div>

          {/* Two-column layout */}
          <div className="search-layout">
            {/* Filters sidebar */}
            <aside>
              <FilterPanel
                filters={filters}
                filterOptions={filterOptions}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                hasActiveFilters={!!hasActiveFilters}
              />
            </aside>

            {/* Results */}
            <section>
              {/* Results header */}
              <div className="results-header">
                <p className="results-count">
                  {loading ? (
                    "Searching..."
                  ) : error ? (
                    "—"
                  ) : (
                    <>
                      <strong>{pagination?.total ?? 0}</strong> alumni found
                      {hasActiveFilters && " (filtered)"}
                    </>
                  )}
                </p>
                <select
                  className="sort-select"
                  value={currentSortIdx === -1 ? 0 : currentSortIdx}
                  onChange={handleSortChange}
                  aria-label="Sort results"
                >
                  {SORT_OPTIONS.map((opt, i) => (
                    <option key={i} value={i}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* States */}
              {loading && <LoadingSpinner text="Loading alumni..." />}

              {!loading && error && (
                <div className="error-state">
                  <span className="error-icon">&#9888;</span>
                  <p className="error-title">Something went wrong</p>
                  <p className="error-sub">{error}</p>
                  <button className="btn-retry" onClick={retry}>Try Again</button>
                </div>
              )}

              {!loading && !error && results.length === 0 && (
                <div className="empty-state">
                  <span className="empty-icon">&#128269;</span>
                  <p className="empty-title">No alumni found</p>
                  <p className="empty-sub">Try adjusting your filters or search terms.</p>
                  {hasActiveFilters && (
                    <button className="btn-retry" onClick={clearFilters} style={{ marginTop: 8 }}>
                      Clear Filters
                    </button>
                  )}
                </div>
              )}

              {!loading && !error && results.length > 0 && (
                <>
                  <div className="results-grid">
                    {results.map((alumni) => (
                      <AlumniCard key={alumni._id} alumni={alumni} />
                    ))}
                  </div>

                  {pagination && pagination.totalPages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={pagination.totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
