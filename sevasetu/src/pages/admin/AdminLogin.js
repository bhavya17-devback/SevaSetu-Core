import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";
import "../common/Auth.css";

/* =========================================================
   ADMIN LOGIN
   Reached from the "Admin" link in the site footer.
   ========================================================= */

function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSubmitting(true);
    const result = await loginAdmin({ email, password });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div className="auth-page admin">
      <div className="auth-visual">
        <Logo light size={42} tagline="Administration" />

        <div className="auth-visual-body">
          <span className="auth-chip">Restricted area</span>

          <h1>
            Platform
            <br />
            <span>control centre.</span>
          </h1>

          <p>
            Review registered donors and NGOs, monitor every donation on the
            platform and keep the community safe.
          </p>

          <ul className="auth-points">
            <li>
              <span>✓</span>
              <div>
                <strong>User management</strong>
                <small>Suspend or remove accounts that break the rules</small>
              </div>
            </li>

            <li>
              <span>✓</span>
              <div>
                <strong>Donation oversight</strong>
                <small>Follow every item from listing to delivery</small>
              </div>
            </li>

            <li>
              <span>✓</span>
              <div>
                <strong>Live platform metrics</strong>
                <small>Totals, cities covered and completion rates</small>
              </div>
            </li>
          </ul>
        </div>

        <p className="auth-visual-foot">SevaSetu • Administrator access</p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-wrap">
          <button
            type="button"
            className="auth-back"
            onClick={() => navigate("/")}
          >
            ← Back to home
          </button>

          <h2>Administrator sign in</h2>
          <p className="auth-sub">
            This area is limited to the SevaSetu platform team.
          </p>

          {error ? <div className="sv-alert sv-alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit} noValidate>
            <div className="sv-field">
              <label htmlFor="admin-email">Administrator email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                placeholder="admin@sevasetu.com"
              />
            </div>

            <div className="sv-field" style={{ marginTop: 16 }}>
              <label htmlFor="admin-password">Password</label>
              <div className="auth-password">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter administrator password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="sv-btn sv-btn-primary auth-submit" disabled={submitting}>
              {submitting ? "Signing in..." : "Enter admin panel"}
            </button>
          </form>

          
          <div className="auth-hint">
            {/* <strong>First time?</strong>
            <br />
            Run <code>npm run seed:admin</code> in the backend folder to
            create the first admin account (uses the ADMIN_EMAIL /
            ADMIN_PASSWORD values from your .env file, or
            admin@sevasetu.com / admin@123 by default). */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
