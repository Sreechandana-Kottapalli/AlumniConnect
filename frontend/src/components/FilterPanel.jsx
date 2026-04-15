import React from "react";

const EXPERIENCE_RANGES = [
  { label: "Any", min: "", max: "" },
  { label: "0–1 yr", min: 0, max: 1 },
  { label: "1–3 yrs", min: 1, max: 3 },
  { label: "3–5 yrs", min: 3, max: 5 },
  { label: "5+ yrs", min: 5, max: "" },
];

export default function FilterPanel({
  filters,
  filterOptions,
  updateFilter,
  clearFilters,
  hasActiveFilters,
}) {
  const selectedTechs = filters.technology
    ? filters.technology.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const toggleTech = (tech) => {
    const next = selectedTechs.includes(tech)
      ? selectedTechs.filter((t) => t !== tech)
      : [...selectedTechs, tech];
    updateFilter("technology", next.join(","));
  };

  const handleExpRange = (e) => {
    const idx = Number(e.target.value);
    const range = EXPERIENCE_RANGES[idx];
    updateFilter("minExp", range.min);
    updateFilter("maxExp", range.max);
  };

  const currentExpIdx = EXPERIENCE_RANGES.findIndex(
    (r) =>
      String(r.min) === String(filters.minExp) &&
      String(r.max) === String(filters.maxExp)
  );

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h2 className="filter-title">Filters</h2>
        {hasActiveFilters && (
          <button className="btn-clear" onClick={clearFilters}>
            Clear all
          </button>
        )}
      </div>

      {/* Technology chips */}
      {filterOptions.technologies.length > 0 && (
        <div className="filter-section">
          <p className="filter-label">Technology</p>
          <div className="filter-tech-grid">
            {filterOptions.technologies.map((tech) => (
              <button
                key={tech}
                className={`tech-chip${selectedTechs.includes(tech) ? " active" : ""}`}
                onClick={() => toggleTech(tech)}
                type="button"
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Company */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="filter-company">Company</label>
        <select
          id="filter-company"
          className="filter-select"
          value={filters.company}
          onChange={(e) => updateFilter("company", e.target.value)}
        >
          <option value="">All Companies</option>
          {filterOptions.companies.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Job Role */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="filter-role">Job Role</label>
        <select
          id="filter-role"
          className="filter-select"
          value={filters.jobRole}
          onChange={(e) => updateFilter("jobRole", e.target.value)}
        >
          <option value="">All Roles</option>
          {filterOptions.jobRoles.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Years of Experience */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="filter-exp">Years of Experience</label>
        <select
          id="filter-exp"
          className="filter-select"
          value={currentExpIdx === -1 ? 0 : currentExpIdx}
          onChange={handleExpRange}
        >
          {EXPERIENCE_RANGES.map((r, i) => (
            <option key={i} value={i}>{r.label}</option>
          ))}
        </select>
        {/* Manual range inputs */}
        <div className="exp-range" style={{ marginTop: 8 }}>
          <input
            type="number"
            className="exp-input"
            placeholder="Min"
            min={0}
            value={filters.minExp}
            onChange={(e) => updateFilter("minExp", e.target.value)}
          />
          <span className="exp-sep">to</span>
          <input
            type="number"
            className="exp-input"
            placeholder="Max"
            min={0}
            value={filters.maxExp}
            onChange={(e) => updateFilter("maxExp", e.target.value)}
          />
          <span className="exp-sep">yrs</span>
        </div>
      </div>

      {/* Availability */}
      <div className="filter-section">
        <label className="filter-label" htmlFor="filter-avail">Availability</label>
        <select
          id="filter-avail"
          className="filter-select"
          value={filters.availability}
          onChange={(e) => updateFilter("availability", e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="busy">Busy</option>
          <option value="not_available">Not Available</option>
        </select>
      </div>
    </div>
  );
}
