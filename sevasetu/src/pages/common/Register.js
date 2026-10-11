import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../components/Logo";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

/* 
   REGISTER
   
   The account is written through the shared data layer and
   the new user is signed in straight away, so the dashboard
   opens with their real details already loaded. That is the
   fix for "the dashboard does not refresh after registering".
    */

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  city: "",
  address: "",
};

function Register() {
  const navigate = useNavigate();
  const { registerAccount } = useAuth();

  const [role, setRole] = useState("donor");
  const [form, setForm] = useState(EMPTY);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isNgo = role === "ngo";

  const update = (field) => (event) => {
    const value =
      field === "phone"
        ? event.target.value.replace(/\D/g, "").slice(0, 10)
        : event.target.value;

    setForm((previous) => ({ ...previous, [field]: value }));
    setError("");
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    const name = form.name.trim();

    if (!name) {
      return isNgo
        ? "Please enter the organisation name."
        : "Please enter your full name.";
    }

    if (name.length < 2) return "The name must be at least 2 characters long.";

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      return "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
      form.email.trim()
    )) {
      return "Please enter a valid email address.";
    }

    if (form.password.length < 6) {
      return "The password must be at least 6 characters long.";
    }

    if (form.password !== form.confirmPassword) {
      return "The two passwords do not match.";
    }

    if (!form.city.trim()) return "Please enter your city.";

    return "";
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const problem = validate();

    if (problem) {
      setError(problem);
      return;
    }

    setSubmitting(true);
    const result = await registerAccount({ ...form, role });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    /* registerAccount already signs the new account in, so the
       dashboard has live data the moment it mounts. */
    navigate(isNgo ? "/ngo/dashboard" : "/donor/dashboard", { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <Logo light size={42} tagline="Connect • Donate • Serve" />

        <div className="auth-visual-body">
          <span className="auth-chip">Join the community</span>

          <h1>
            Give more.
            <br />
            <span>Do more.</span>
          </h1>

          <p>
            SevaSetu is the bridge between people with something to spare and
            the organisations who know exactly where it is needed.
          </p>

          <ul className="auth-points">
            <li>
              <span>✓</span>
              <div>
                <strong>List in under a minute</strong>
                <small>Pick a category, add a few details, and you're done</small>
              </div>
            </li>

            <li>
              <span>✓</span>
              <div>
                <strong>Track every item</strong>
                <small>See when an NGO claims and collects your donation</small>
              </div>
            </li>

            <li>
              <span>✓</span>
              <div>
                <strong>NGOs get a live feed</strong>
                <small>Browse and claim what your programmes need</small>
              </div>
            </li>
          </ul>
        </div>

        <p className="auth-visual-foot">© {new Date().getFullYear()} SevaSetu</p>
      </div>

      <div className="auth-form-panel">
        <div className="auth-form-wrap wide">
          <button
            type="button"
            className="auth-back"
            onClick={() => navigate("/")}
          >
            ← Back to home
          </button>

          <h2>Create your account</h2>
          <p className="auth-sub">
            Register once, then sign in any time with this same email address
            and password.
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
              <span>🤝</span>
              <div>
                <strong>Donor</strong>
                <small>Donate items & resources</small>
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
                <small>Receive & distribute donations</small>
              </div>
            </button>
          </div>

          {error ? <div className="sv-alert sv-alert-error">{error}</div> : null}

          <form onSubmit={handleSubmit} noValidate>
            <div className="auth-grid">
              <div className="sv-field">
                <label htmlFor="reg-name">
                  {isNgo ? "Organisation name" : "Full name"}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  value={form.name}
                  onChange={update("name")}
                  placeholder={
                    isNgo ? "e.g. Aasha Foundation" : "Enter your full name"
                  }
                />
              </div>

              <div className="auth-grid two">
                <div className="sv-field">
                  <label htmlFor="reg-phone">Phone number</label>
                  <input
                    id="reg-phone"
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={update("phone")}
                    placeholder="10-digit mobile"
                  />
                </div>

                <div className="sv-field">
                  <label htmlFor="reg-city">City</label>
                  <input
                    id="reg-city"
                    type="text"
                    value={form.city}
                    onChange={update("city")}
                    placeholder="e.g. Surat"
                  />
                </div>
              </div>

              <div className="sv-field">
                <label htmlFor="reg-email">Email address</label>
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                />
                <small>You will use this email to sign in.</small>
              </div>

              <div className="auth-grid two">
                <div className="sv-field">
                  <label htmlFor="reg-password">Password</label>
                  <div className="auth-password">
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={update("password")}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="sv-field">
                  <label htmlFor="reg-confirm">Confirm password</label>
                  <input
                    id="reg-confirm"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={update("confirmPassword")}
                    placeholder="Repeat password"
                  />
                </div>
              </div>
            </div>

            {/* ================= NGO ONLY ================= */}

            {isNgo ? (
              <>
                <p className="auth-section-label">Organisation details</p>

                <div className="sv-field" style={{ marginTop: 12 }}>
                  <label htmlFor="reg-address">Office address</label>
                  <input
                    id="reg-address"
                    type="text"
                    value={form.address}
                    onChange={update("address")}
                    placeholder="Street, area, landmark"
                  />
                </div>
              </>
            ) : null}

            <label className="auth-terms">
              <input type="checkbox" required />
              <span>
                I agree to the <b>Terms of Service</b> and the{" "}
                <b>Privacy Policy</b>.
              </span>
            </label>

            <button
              type="submit"
              className={`sv-btn auth-submit ${
                isNgo ? "sv-btn-teal" : "sv-btn-primary"
              }`}
              disabled={submitting}
            >
              {submitting
                ? "Creating account..."
                : `Create ${isNgo ? "NGO" : "donor"} account →`}
            </button>
          </form>

          <div className="auth-alt">
            Already registered?{" "}
            <button type="button" onClick={() => navigate("/login")}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;