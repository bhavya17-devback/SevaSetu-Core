import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";
import "./Footer.css";

/* =========================================================
   SITE FOOTER
   The administrator entrance lives here, in the bottom bar.
   ========================================================= */

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="seva-footer" id="contact">
      <div className="footer-container">
        <div className="footer-brand">
          <Logo light size={44} tagline="Connecting Generosity" />

          <p className="footer-description">
            SevaSetu is a bridge between generous donors and trusted NGOs. List
            what you can spare, and let the organisations who need it most claim
            it in a couple of clicks.
          </p>

          <div className="footer-social">
            <a href="#facebook" aria-label="Facebook">
              f
            </a>
            <a href="#instagram" aria-label="Instagram">
              ◎
            </a>
            <a href="#twitter" aria-label="Twitter">
              𝕏
            </a>
            <a href="#linkedin" aria-label="LinkedIn">
              in
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Platform</h3>
          <Link to="/">Home</Link>
          <a href="#how-it-works">How it works</a>
          <a href="#categories">Donation categories</a>
          <a href="#impact">Our impact</a>
        </div>

        <div className="footer-column">
          <h3>Get started</h3>
          <Link to="/register">Register as donor</Link>
          <Link to="/register">Register your NGO</Link>
          <Link to="/login">Sign in</Link>
          <a href="#faq">Help & FAQ</a>
        </div>

        <div className="footer-column footer-contact">
          <h3>Contact us</h3>

          <div className="contact-item">
            <span className="contact-icon">✉</span>
            <div>
              <small>Email</small>
              <p>sevasetu@gmail.com</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">☎</span>
            <div>
              <small>Phone</small>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="contact-item">
            <span className="contact-icon">⌖</span>
            <div>
              <small>Based in</small>
              <p>Surat, Gujarat, India</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {year} SevaSetu. All rights reserved.</p>

          <div className="footer-legal">
            <a href="#privacy">Privacy policy</a>
            <a href="#terms">Terms & conditions</a>

            {/* Administrator entrance */}
            <Link to="/admin/login" className="footer-admin-link">
              <span>⚙</span> Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
