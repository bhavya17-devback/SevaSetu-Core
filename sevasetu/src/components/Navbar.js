import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

/* =========================================================
   PUBLIC NAVBAR
   Shows Login / Get started to visitors and a shortcut back
   into the dashboard once somebody is signed in.
   ========================================================= */

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardPath =
    user && user.role === "ngo" ? "/ngo/dashboard" : "/donor/dashboard";

  return (
    <nav className={`seva-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <Logo size={42} />

        <div className={`navbar-links ${open ? "open" : ""}`}>
          <a href="#home" onClick={() => setOpen(false)}>
            Home
          </a>
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </a>
          <a href="#categories" onClick={() => setOpen(false)}>
            Categories
          </a>
          <a href="#impact" onClick={() => setOpen(false)}>
            Impact
          </a>
          <a href="#contact" onClick={() => setOpen(false)}>
            Contact
          </a>
        </div>

        <div className="navbar-actions">
          {user ? (
            <>
              <Link to={dashboardPath} className="sv-btn sv-btn-ghost sv-btn-sm">
                My dashboard
              </Link>

              <button
                type="button"
                className="sv-btn sv-btn-primary sv-btn-sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-login">
                Login
              </Link>

              <Link to="/register" className="sv-btn sv-btn-primary sv-btn-sm">
                Get started →
              </Link>
            </>
          )}

          <button
            type="button"
            className="navbar-toggle"
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
