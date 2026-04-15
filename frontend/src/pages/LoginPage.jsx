import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const [tab, setTab] = useState("login"); // "login" | "register"
  const [alert, setAlert] = useState(null); // { type: "error"|"success", msg }
  const [busy, setBusy] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  // Register form state
  const [regData, setRegData] = useState({
    name: "",
    email: "",
    password: "",
    batch: "",
    domain: "",
  });
  const [regErrors, setRegErrors] = useState({});

  // ── Validation ───────────────────────────────────────────────────
  const validateLogin = () => {
    const errs = {};
    if (!loginData.email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(loginData.email)) errs.email = "Enter a valid email";
    if (!loginData.password) errs.password = "Password is required";
    return errs;
  };

  const validateRegister = () => {
    const errs = {};
    if (!regData.name.trim()) errs.name = "Name is required";
    if (!regData.email) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(regData.email)) errs.email = "Enter a valid email";
    if (!regData.password) errs.password = "Password is required";
    else if (regData.password.length < 6) errs.password = "Minimum 6 characters";
    return errs;
  };

  // ── Handlers ─────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = validateLogin();
    if (Object.keys(errs).length) { setLoginErrors(errs); return; }
    setLoginErrors({});
    setBusy(true);
    setAlert(null);
    try {
      await login(loginData.email, loginData.password);
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Login failed. Check your credentials." });
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateRegister();
    if (Object.keys(errs).length) { setRegErrors(errs); return; }
    setRegErrors({});
    setBusy(true);
    setAlert(null);
    try {
      await register(regData);
    } catch (err) {
      setAlert({ type: "error", msg: err.response?.data?.message || "Registration failed. Please try again." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">N</div>
          <span className="auth-logo-text">NCPL Alumni</span>
        </div>
        <p className="auth-subtitle">Connect with placed alumni. Get mentored.</p>

        {/* Tabs */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === "login" ? " active" : ""}`} onClick={() => { setTab("login"); setAlert(null); }}>
            Sign In
          </button>
          <button className={`auth-tab${tab === "register" ? " active" : ""}`} onClick={() => { setTab("register"); setAlert(null); }}>
            Register
          </button>
        </div>

        {/* Alert */}
        {alert && <div className={`auth-alert ${alert.type}`}>{alert.msg}</div>}

        {/* Login Form */}
        {tab === "login" && (
          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className={`form-input${loginErrors.email ? " error" : ""}`}
                placeholder="you@example.com" autoComplete="email"
                value={loginData.email}
                onChange={(e) => setLoginData((p) => ({ ...p, email: e.target.value }))}
              />
              {loginErrors.email && <p className="form-error">{loginErrors.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className={`form-input${loginErrors.password ? " error" : ""}`}
                placeholder="••••••••" autoComplete="current-password"
                value={loginData.password}
                onChange={(e) => setLoginData((p) => ({ ...p, password: e.target.value }))}
              />
              {loginErrors.password && <p className="form-error">{loginErrors.password}</p>}
            </div>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Signing in..." : "Sign In"}
            </button>
            <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-secondary)", textAlign: "center" }}>
              Demo: deepika@ncpl.in / demo1234
            </p>
          </form>
        )}

        {/* Register Form */}
        {tab === "register" && (
          <form onSubmit={handleRegister} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text" className={`form-input${regErrors.name ? " error" : ""}`}
                placeholder="Your full name"
                value={regData.name}
                onChange={(e) => setRegData((p) => ({ ...p, name: e.target.value }))}
              />
              {regErrors.name && <p className="form-error">{regErrors.name}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email" className={`form-input${regErrors.email ? " error" : ""}`}
                placeholder="you@example.com"
                value={regData.email}
                onChange={(e) => setRegData((p) => ({ ...p, email: e.target.value }))}
              />
              {regErrors.email && <p className="form-error">{regErrors.email}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password" className={`form-input${regErrors.password ? " error" : ""}`}
                placeholder="Min. 6 characters"
                value={regData.password}
                onChange={(e) => setRegData((p) => ({ ...p, password: e.target.value }))}
              />
              {regErrors.password && <p className="form-error">{regErrors.password}</p>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Batch (optional)</label>
                <input
                  type="text" className="form-input" placeholder="e.g. 2024"
                  value={regData.batch}
                  onChange={(e) => setRegData((p) => ({ ...p, batch: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Domain (optional)</label>
                <input
                  type="text" className="form-input" placeholder="e.g. React"
                  value={regData.domain}
                  onChange={(e) => setRegData((p) => ({ ...p, domain: e.target.value }))}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
