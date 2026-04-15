import React, { useState, useEffect, useRef } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import LoadingSpinner from "../components/LoadingSpinner";
import { alumniAPI } from "../services/api";
import { referralAPI } from "../services/referralAPI";

const MAX_MSG_LENGTH = 1000;

const INITIAL_FORM = {
  requestType: "referral",
  targetJobRole: "",
  targetCompany: "",
  jobDescriptionUrl: "",
  linkedinUrl: "",
  portfolioUrl: "",
  personalMessage: "",
};

const FORM_ERRORS = {
  targetJobRole: "",
  targetCompany: "",
  personalMessage: "",
  resume: "",
};

export default function RequestForm() {
  const { alumniId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const typeFromURL = searchParams.get("type");

  const [alumni, setAlumni] = useState(null);
  const [alumniLoading, setAlumniLoading] = useState(true);
  const [alumni404, setAlumni404] = useState(false);

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    requestType: typeFromURL === "reference" ? "reference" : "referral",
  });
  const [errors, setErrors] = useState({ ...FORM_ERRORS });
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  // Load alumni profile
  useEffect(() => {
    alumniAPI
      .getById(alumniId)
      .then(({ data }) => {
        setAlumni(data.data);
        // Pre-fill target role and company
        setForm((p) => ({
          ...p,
          targetCompany: data.data.company || "",
          targetJobRole: data.data.jobRole || "",
        }));
      })
      .catch((err) => {
        if (err.response?.status === 404) setAlumni404(true);
      })
      .finally(() => setAlumniLoading(false));
  }, [alumniId]);

  // ── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = { ...FORM_ERRORS };
    let valid = true;

    if (!form.targetJobRole.trim()) {
      errs.targetJobRole = "Target job role is required";
      valid = false;
    }
    if (!form.targetCompany.trim()) {
      errs.targetCompany = "Target company is required";
      valid = false;
    }
    if (!form.personalMessage.trim()) {
      errs.personalMessage = "Personal message is required";
      valid = false;
    } else if (form.personalMessage.trim().length < 20) {
      errs.personalMessage = "Message must be at least 20 characters";
      valid = false;
    }
    if (!resumeFile) {
      errs.resume = "Please upload your resume (PDF, max 5 MB)";
      valid = false;
    }

    setErrors(errs);
    return valid;
  };

  // ── File handling ────────────────────────────────────────────────────────
  const handleFileSelect = (file) => {
    setErrors((p) => ({ ...p, resume: "" }));
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrors((p) => ({ ...p, resume: "Only PDF files are accepted." }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, resume: "File size must be under 5 MB." }));
      return;
    }
    setResumeFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragRef.current?.classList.remove("border-[#1A3C6E]", "bg-blue-50");
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError(null);

    try {
      // Step 1: Upload resume
      setUploading(true);
      const { data: uploadData } = await referralAPI.uploadResume(
        resumeFile,
        setUploadProgress
      );
      setUploading(false);

      // Step 2: Create request
      setSubmitting(true);
      await referralAPI.create({
        alumniId,
        requestType: form.requestType,
        targetJobRole: form.targetJobRole,
        targetCompany: form.targetCompany,
        jobDescriptionUrl: form.jobDescriptionUrl || undefined,
        resumeUrl: uploadData.data.url,
        resumePublicId: uploadData.data.publicId,
        linkedinUrl: form.linkedinUrl || undefined,
        portfolioUrl: form.portfolioUrl || undefined,
        personalMessage: form.personalMessage,
      });

      setSuccess(true);
    } catch (err) {
      setUploading(false);
      setSubmitting(false);
      setUploadProgress(0);
      setSubmitError(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  const field = (key, val) =>
    setForm((p) => ({ ...p, [key]: val }));
  const clearErr = (key) =>
    setErrors((p) => ({ ...p, [key]: "" }));

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-[#1A3C6E] mb-3">
            Request Submitted!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Your {form.requestType === "referral" ? "referral" : "professional reference"}{" "}
            request has been sent to <strong>{alumni?.fullName}</strong>. They
            will review it and respond shortly. You can track the status from
            your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/referrals")}
              className="px-6 py-2.5 bg-[#1A3C6E] text-white rounded-lg font-semibold hover:bg-[#2a5298] transition-colors"
            >
              View My Requests
            </button>
            <button
              onClick={() => navigate("/search")}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Search More Alumni
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (alumniLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <LoadingSpinner text="Loading alumni profile..." />
      </div>
    );
  }

  if (alumni404 || !alumni) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-16">
          <p className="text-4xl mb-3">😕</p>
          <p className="font-bold text-gray-700">Alumni not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-[#1A3C6E] font-semibold hover:underline text-sm"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  const isProcessing = uploading || submitting;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-[#1A3C6E] font-semibold hover:underline mb-5 inline-flex items-center gap-1"
        >
          ← Back
        </button>

        {/* Page title */}
        <h1 className="text-2xl font-extrabold text-[#1A3C6E] mb-1">
          Send a Request
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Request a job referral or professional reference from{" "}
          <strong>{alumni.fullName}</strong>.
        </p>

        {/* Alumni snapshot */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-4 mb-6 flex gap-3 items-center">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white"
            style={{ backgroundColor: alumni.avatarColor || "#1A3C6E" }}
          >
            {alumni.avatarInitials || alumni.fullName?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900">{alumni.fullName}</p>
            <p className="text-gray-500 text-sm">
              {alumni.jobRole} &bull; {alumni.company}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {alumni.yearsOfExperience} yr{alumni.yearsOfExperience !== 1 ? "s" : ""} experience
              {alumni.location && ` · ${alumni.location}`}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Request Type */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Request Type <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              {[
                { value: "referral", icon: "💼", label: "Job Referral", desc: "Internal referral for an open position" },
                { value: "reference", icon: "📝", label: "Professional Reference", desc: "Endorsement / recommendation letter" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex-1 cursor-pointer rounded-xl border-2 p-3 transition-all
                    ${form.requestType === opt.value
                      ? "border-[#1A3C6E] bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"}`}
                >
                  <input
                    type="radio"
                    name="requestType"
                    value={opt.value}
                    checked={form.requestType === opt.value}
                    onChange={() => field("requestType", opt.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{opt.icon}</span>
                    <span className="font-bold text-sm text-gray-800">{opt.label}</span>
                    {form.requestType === opt.value && (
                      <span className="ml-auto text-[#1A3C6E] text-sm font-bold">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{opt.desc}</p>
                </label>
              ))}
            </div>
          </div>

          {/* Target Job Role */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="targetJobRole">
              Target Job Role <span className="text-red-500">*</span>
            </label>
            <input
              id="targetJobRole"
              type="text"
              maxLength={150}
              value={form.targetJobRole}
              onChange={(e) => { field("targetJobRole", e.target.value); clearErr("targetJobRole"); }}
              placeholder="e.g. React Developer, Backend Engineer..."
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none
                ${errors.targetJobRole ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#1A3C6E]"}`}
            />
            {errors.targetJobRole && <p className="text-red-500 text-xs mt-1">{errors.targetJobRole}</p>}
          </div>

          {/* Target Company */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="targetCompany">
              Target Company <span className="text-red-500">*</span>
            </label>
            <input
              id="targetCompany"
              type="text"
              maxLength={150}
              value={form.targetCompany}
              onChange={(e) => { field("targetCompany", e.target.value); clearErr("targetCompany"); }}
              placeholder="e.g. TCS, Infosys, Google..."
              className={`w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none
                ${errors.targetCompany ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#1A3C6E]"}`}
            />
            {errors.targetCompany && <p className="text-red-500 text-xs mt-1">{errors.targetCompany}</p>}
          </div>

          {/* Job Description URL */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="jobDescriptionUrl">
              Job Description URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="jobDescriptionUrl"
              type="url"
              value={form.jobDescriptionUrl}
              onChange={(e) => field("jobDescriptionUrl", e.target.value)}
              placeholder="https://careers.company.com/job/123"
              className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1A3C6E]"
            />
          </div>

          {/* LinkedIn + Portfolio */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="linkedinUrl">
                LinkedIn URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="linkedinUrl"
                type="url"
                value={form.linkedinUrl}
                onChange={(e) => field("linkedinUrl", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1A3C6E]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="portfolioUrl">
                Portfolio URL <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="portfolioUrl"
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => field("portfolioUrl", e.target.value)}
                placeholder="https://yourportfolio.com"
                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-[#1A3C6E]"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">
              Resume (PDF) <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">— max 5 MB</span>
            </label>
            <div
              ref={dragRef}
              onDragOver={(e) => {
                e.preventDefault();
                dragRef.current?.classList.add("border-[#1A3C6E]", "bg-blue-50");
              }}
              onDragLeave={() =>
                dragRef.current?.classList.remove("border-[#1A3C6E]", "bg-blue-50")
              }
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                ${errors.resume
                  ? "border-red-400 bg-red-50"
                  : resumeFile
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-[#1A3C6E] hover:bg-blue-50"}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files[0])}
              />
              {resumeFile ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">📄</span>
                  <div className="text-left">
                    <p className="font-semibold text-green-700 text-sm">{resumeFile.name}</p>
                    <p className="text-green-600 text-xs">
                      {(resumeFile.size / 1024).toFixed(0)} KB — Click to change
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-3xl mb-2">☁️</p>
                  <p className="font-semibold text-gray-700 text-sm">
                    Drag &amp; drop your PDF here
                  </p>
                  <p className="text-gray-400 text-xs mt-1">or click to browse files</p>
                </>
              )}
            </div>
            {errors.resume && <p className="text-red-500 text-xs mt-1">{errors.resume}</p>}
          </div>

          {/* Personal Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="personalMessage">
              Personal Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="personalMessage"
              rows={5}
              maxLength={MAX_MSG_LENGTH}
              value={form.personalMessage}
              onChange={(e) => { field("personalMessage", e.target.value); clearErr("personalMessage"); }}
              placeholder={`Introduce yourself to ${alumni.fullName}. Mention why you are reaching out, your background, and what role you are targeting. Be specific and professional.`}
              className={`w-full px-3 py-2.5 text-sm border rounded-lg resize-none focus:outline-none
                ${errors.personalMessage ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-[#1A3C6E]"}`}
            />
            <div className="flex items-center justify-between mt-1">
              {errors.personalMessage
                ? <p className="text-red-500 text-xs">{errors.personalMessage}</p>
                : <span />}
              <span className={`text-xs ${form.personalMessage.length > MAX_MSG_LENGTH * 0.9 ? "text-amber-600" : "text-gray-400"}`}>
                {form.personalMessage.length} / {MAX_MSG_LENGTH}
              </span>
            </div>
          </div>

          {/* Upload progress */}
          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading resume...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1A3C6E] rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit error */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-[#1A3C6E] text-white font-bold rounded-xl text-sm
                       hover:bg-[#2a5298] disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors"
          >
            {uploading
              ? `Uploading resume... ${uploadProgress}%`
              : submitting
                ? "Submitting request..."
                : `Submit ${form.requestType === "referral" ? "Referral" : "Reference"} Request`}
          </button>

          <p className="text-xs text-gray-400 text-center">
            By submitting, you agree that your resume and message will be shared
            with the selected alumni.
          </p>
        </form>
      </main>
    </div>
  );
}
