import api from "./api";

export const referralAPI = {
  // ── Requests ─────────────────────────────────────────────────────────────

  /** Create a new referral / reference request */
  create: (data) => api.post("/referrals", data),

  /** Candidate: get their own requests */
  getMyRequests: (params) => api.get("/referrals/my", { params }),

  /** Alumni: get incoming requests addressed to them */
  getIncomingRequests: (params) => api.get("/referrals/incoming", { params }),

  /** Dashboard statistics */
  getStats: () => api.get("/referrals/stats"),

  /** Get a single request by ID */
  getById: (id) => api.get(`/referrals/${id}`),

  /** Alumni: update request status */
  updateStatus: (id, data) => api.put(`/referrals/${id}/status`, data),

  /** Candidate: cancel a pending request */
  cancel: (id) => api.delete(`/referrals/${id}`),

  /** Admin: get all requests */
  adminGetAll: (params) => api.get("/referrals/admin/all", { params }),

  // ── Scheduling (public — no auth token needed) ───────────────────────────

  /** Get scheduling form info by request ID (public) */
  getScheduleInfo: (requestId) => api.get(`/schedule/${requestId}`),

  /** Alumni: submit availability for a meeting (public) */
  submitAvailability: (requestId, data) => api.post(`/schedule/${requestId}`, data),

  // ── File Upload ──────────────────────────────────────────────────────────

  /**
   * Upload a resume PDF to Cloudinary.
   * @param {File} file - The PDF file object
   * @param {Function} onProgress - Optional upload progress callback (0–100)
   */
  uploadResume: (file, onProgress) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api.post("/upload/resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / e.total))
        : undefined,
    });
  },
};

export default referralAPI;
