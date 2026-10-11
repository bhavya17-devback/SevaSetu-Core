import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

/* =========================================================
   LOGIN
   Donors and NGOs both sign in here with exactly the email
   and password they used at registration.
   ========================================================= */

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState("donor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setError("Please enter both your email address and password.");
      return;
    }

    setSubmitting(true);
    const result = await login({ email, password, role });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    navigate(
      result.user.role === "ngo" ? "/ngo/dashboard" : "/donor/dashboard",
      { replace: true }
    );
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Logo light size={42} tagline="Connecting Generosity" />

        <div className="auth-visual-body">
          <span className="auth-chip">Welcome back</span>

          <h1>
            Together,
            <br />
            <span>we create impact.</span>
          </h1>

          <p>
            Sign back in to list what you can spare, or to find the items your
            organisation needs most this week.
          </p>

          <ul className="auth-points">
            <li>
              <span>♥</span>
              <div>
                <strong>Every contribution counts</strong>
                <small>Small surplus becomes someone's essential</small>
              </div>
            </li>

            <li>
              <span>✓</span>
              <div>
                <strong>Verified organisations</strong>
                <small>Your items reach NGOs working on the ground</small>
              </div>
            </li>

            <li>
              <span>★</span>
              <div>
                <strong>Earn Seva Coins</strong>
                <small>Collect 100 coins to unlock your certificate</small>
              </div>
            </li>
          </ul>
        </div>

        <p className="auth-visual-foot">Making surplus meaningful • SevaSetu</p>
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

          <h2>Sign in</h2>
          <p className="auth-sub">
            Continue to your SevaSetu account. Choose the account type you
            registered with.
          </p>

          <div className="auth-roles">
            <button
              type="button"
              className={role === "donor" ? "active" : ""}
              onClick={() => {
                setRole("donor");
                setError("");
              }}
            >
              <span>🎁</span>
              <div>
                <strong>Donor</strong>
                <small>Give items you no longer need</small>
              </div>
            </button>

            <button
              type="button"
              className={role === "ngo" ? "active teal" : ""}
              onClick={() => {
                setRole("ngo");
                setError("");
              }}
            >
              <span>🏢</span>
              <div>
                <strong>NGO</strong>
                <small>Claim and collect donations</small>
              </div>
            </button>
          </div>

          {error ? <div className="sv-alert sv-alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-grid">
              <div className="sv-field">
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                />
              </div>

              <div className="sv-field">
                <label htmlFor="login-password">Password</label>
                <div className="auth-password">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    placeholder="Enter your password"
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`sv-btn auth-submit ${
                role === "ngo" ? "sv-btn-teal" : "sv-btn-primary"
              }`}
              disabled={submitting}
            >
              {submitting
                ? "Signing in..."
                : `Sign in as ${role === "ngo" ? "NGO" : "Donor"} →`}
            </button>
          </form>

          <div className="auth-alt">
            New to SevaSetu?{" "}
            <button type="button" onClick={() => navigate("/register")}>
              Create an account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
