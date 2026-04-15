import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { to: "/search", label: "Search Alumni", icon: "🔍" },
  { to: "/referrals", label: "Referrals & References", icon: "🤝" },
];

const ALUMNI_LINKS = [
  { to: "/search", label: "Search Alumni", icon: "🔍" },
  { to: "/alumni/requests", label: "Manage Requests", icon: "📋" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = user?.role === "alumni" ? ALUMNI_LINKS : NAV_LINKS;

  return (
    <nav className="bg-[#1A3C6E] sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/search" className="flex items-center gap-2.5">
            <span className="w-9 h-9 bg-[#F4A823] rounded-lg flex items-center justify-center font-extrabold text-lg text-[#1A3C6E]">
              N
            </span>
            <span className="text-white font-bold text-[17px] hidden sm:block">
              NCPL Alumni Connect
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${location.pathname === to
                    ? "bg-white/20 text-white"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                  }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            ))}
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              {/* Avatar circle */}
              <span className="w-8 h-8 rounded-full bg-[#F4A823] flex items-center justify-center text-[#1A3C6E] font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
              <div className="hidden lg:block">
                <p className="text-white text-sm font-semibold leading-tight">
                  {user?.name?.split(" ")[0]}
                </p>
                <p className="text-white/60 text-xs capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="text-white/80 hover:text-white border border-white/30 hover:border-white/60
                         rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            >
              Sign Out
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-white p-1"
              onClick={() => setMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-3 pt-1 border-t border-white/20 flex flex-col gap-1">
            {links.map(({ to, label, icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                  ${location.pathname === to
                    ? "bg-white/20 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
