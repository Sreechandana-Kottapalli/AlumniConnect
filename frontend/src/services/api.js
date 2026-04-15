import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ─────────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// ── Alumni ───────────────────────────────────────────────────────

export const alumniAPI = {
  /**
   * Search alumni with filters, pagination, and sorting.
   * @param {Object} params - Query parameters
   * @param {string}  [params.q]            - Keyword search
   * @param {string}  [params.technology]   - Comma-separated technologies
   * @param {string}  [params.company]      - Company name
   * @param {string}  [params.jobRole]      - Job role
   * @param {number}  [params.minExp]       - Min years of experience
   * @param {number}  [params.maxExp]       - Max years of experience
   * @param {string}  [params.availability] - available | busy | not_available
   * @param {string}  [params.sortBy]       - Field to sort by
   * @param {string}  [params.sortOrder]    - asc | desc
   * @param {number}  [params.page]         - Page number
   * @param {number}  [params.limit]        - Results per page
   */
  search: (params) => api.get("/alumni/search", { params }),

  /** Get a single alumni by MongoDB _id */
  getById: (id) => api.get(`/alumni/${id}`),

  /** Get distinct values for filter dropdowns */
  getFilterOptions: () => api.get("/alumni/filters/options"),
};

export default api;
