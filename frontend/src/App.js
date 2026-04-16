import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import SearchPage from "./pages/SearchPage";
import AlumniProfilePage from "./pages/AlumniProfilePage";
import ReferralDashboard from "./pages/ReferralDashboard";
import AlumniRequestPanel from "./pages/AlumniRequestPanel";
import RequestForm from "./pages/RequestForm";
import SchedulePage from "./pages/SchedulePage";

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/search" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Candidate routes */}
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <SearchPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/alumni/:id"
            element={
              <PrivateRoute>
                <AlumniProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/referrals"
            element={
              <PrivateRoute>
                <ReferralDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/request/:alumniId"
            element={
              <PrivateRoute>
                <RequestForm />
              </PrivateRoute>
            }
          />

          {/* Alumni route */}
          <Route
            path="/alumni/requests"
            element={
              <PrivateRoute>
                <AlumniRequestPanel />
              </PrivateRoute>
            }
          />

          {/* Public: alumni scheduling link (accessible from email without login) */}
          <Route path="/schedule/:requestId" element={<SchedulePage />} />

          {/* Default */}
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
