import { useState, useEffect, useCallback, useRef } from "react";
import { alumniAPI } from "../services/api";

const DEFAULT_FILTERS = {
  q: "",
  technology: "",
  company: "",
  jobRole: "",
  minExp: "",
  maxExp: "",
  availability: "",
};

const DEFAULT_SORT = { sortBy: "createdAt", sortOrder: "desc" };
const PAGE_SIZE = 9;

export function useAlumniSearch() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [page, setPage] = useState(1);

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    technologies: [],
    companies: [],
    jobRoles: [],
    availabilityStatuses: [],
  });

  // Debounce timer ref
  const debounceRef = useRef(null);

  // Load filter dropdown options once on mount
  useEffect(() => {
    alumniAPI
      .getFilterOptions()
      .then(({ data }) => setFilterOptions(data.data))
      .catch(() => {}); // non-critical
  }, []);

  const fetchResults = useCallback(
    async (currentFilters, currentSort, currentPage) => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          ...currentFilters,
          ...currentSort,
          page: currentPage,
          limit: PAGE_SIZE,
        };
        // Strip empty string params
        Object.keys(params).forEach((k) => {
          if (params[k] === "" || params[k] === null || params[k] === undefined) {
            delete params[k];
          }
        });
        const { data } = await alumniAPI.search(params);
        setResults(data.data);
        setPagination(data.pagination);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to fetch results. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced search on filter/sort changes
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchResults(filters, sort, page);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [filters, sort, page, fetchResults]);

  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // reset to page 1 on filter change
  }, []);

  const updateSort = useCallback((sortBy, sortOrder) => {
    setSort({ sortBy, sortOrder });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
    setPage(1);
  }, []);

  const retry = useCallback(() => {
    fetchResults(filters, sort, page);
  }, [fetchResults, filters, sort, page]);

  return {
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
  };
}
