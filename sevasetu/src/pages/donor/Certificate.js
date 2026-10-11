import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuthUser, useFetch } from "../../hooks/useSeva";
import {
  CERTIFICATE_TARGET,
  fetchMyDonations,
  getCoinsFromDonations,
} from "../../utils/storage";
import "./Certificate.css";

/* =========================================================
   CERTIFICATE OF APPRECIATION
   Coins are derived from the donor's own donation list, so
   this screen can never drift out of sync with the rest of
   the dashboard.
   ========================================================= */

function Certificate() {
  const navigate = useNavigate();
  const certificateRef = useRef(null);

  const user = useAuthUser("donor");

  const { data: fetchedDonations } = useFetch(
    () => (user ? fetchMyDonations() : Promise.resolve([])),
    [user?.id]
  );

  const coins = getCoinsFromDonations(fetchedDonations || []);

  const userName = user ? user.name : "SevaSetu Donor";

  // =========================================================
  // CERTIFICATE DOWNLOAD
  // =========================================================

  const downloadCertificate = async () => {
    if (coins < CERTIFICATE_TARGET) {
      alert(
        `You need ${
          CERTIFICATE_TARGET - coins
        } more Seva Coins to unlock the certificate.`
      );

      return;
    }

    const element = certificateRef.current;

    if (!element) {
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#fffdf7",
      });

      const imageData =
        canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [
          canvas.width,
          canvas.height,
        ],
      });

      pdf.addImage(
        imageData,
        "PNG",
        0,
        0,
        canvas.width,
        canvas.height
      );

      pdf.save(
        "SevaSetu-Certificate-of-Appreciation.pdf"
      );
    } catch (error) {
      console.error(
        "Certificate download failed:",
        error
      );

      alert(
        "Unable to download certificate. Please try again."
      );
    }
  };

  // =========================================================
  // DATE
  // =========================================================

  const certificateDate =
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  // =========================================================
  // GUARD
  // =========================================================

  if (!user) return null;

  // =========================================================
  // LOCKED SCREEN
  // =========================================================

  if (coins < CERTIFICATE_TARGET) {
    const remaining =
      CERTIFICATE_TARGET - coins;

    return (
      <div className="certificate-page">

        <header className="certificate-topbar">

          <button
            className="certificate-back-button"
            onClick={() =>
              navigate("/donor/dashboard")
            }
          >
            ← Back to Dashboard
          </button>

          <div className="certificate-top-title">
            SevaSetu Certificate
          </div>

        </header>

        <main className="certificate-locked-container">

          <div className="certificate-locked-icon">
            🔒
          </div>

          <p className="certificate-small-label">
            CERTIFICATE OF APPRECIATION
          </p>

          <h1>
            Certificate Locked
          </h1>

          <p>
            Keep donating and collecting Seva Coins.
          </p>

          <div className="certificate-progress-box">

            <div className="progress-top">

              <span>
                Your Seva Coins
              </span>

              <strong>
                {coins} / {CERTIFICATE_TARGET}
              </strong>

            </div>

            <div className="progress-bar">

              <div
                style={{
                  width: `${Math.min(
                    (coins /
                      CERTIFICATE_TARGET) *
                      100,
                    100
                  )}%`,
                }}
              ></div>

            </div>

            <p>
              {remaining} more coins needed to unlock
              your SevaSetu Certificate.
            </p>

          </div>

          <button
            className="certificate-go-donate"
            onClick={() =>
              navigate("/donor/create-donation")
            }
          >
            Create Donation →
          </button>

        </main>

      </div>
    );
  }

  // =========================================================
  // CERTIFICATE
  // =========================================================

  return (
    <div className="certificate-page">

      {/* =====================================================
          TOP BAR
          ===================================================== */}

      <header className="certificate-topbar">

        <button
          className="certificate-back-button"
          onClick={() =>
            navigate("/donor/dashboard")
          }
        >
          ← Back to Dashboard
        </button>

        <div className="certificate-top-title">
          SevaSetu Certificate
        </div>

        <button
          className="certificate-download-button"
          onClick={downloadCertificate}
        >
          ↓ Download Certificate
        </button>

      </header>

      {/* =====================================================
          CERTIFICATE AREA
          ===================================================== */}

      <main className="certificate-main">

        <div
          className="certificate-paper"
          ref={certificateRef}
        >

          <div className="certificate-border">

            <div className="certificate-inner-border">

              {/* DECORATIVE CORNERS */}

              <div className="corner-decoration corner-top-left">
                ❧
              </div>

              <div className="corner-decoration corner-top-right">
                ❧
              </div>

              <div className="corner-decoration corner-bottom-left">
                ❧
              </div>

              <div className="corner-decoration corner-bottom-right">
                ❧
              </div>

              {/* LEFT LEAVES */}

              <div className="certificate-leaves leaves-left">

                <span>❧</span>
                <span>❧</span>
                <span>❧</span>
                <span>❧</span>
                <span>❧</span>

              </div>

              {/* RIGHT LEAVES */}

              <div className="certificate-leaves leaves-right">

                <span>❧</span>
                <span>❧</span>
                <span>❧</span>
                <span>❧</span>
                <span>❧</span>

              </div>

              {/* CONTENT */}

              <div className="certificate-content">

                {/* LOGO */}

                <div className="certificate-logo-area">

                  <div className="certificate-logo">
                    S
                  </div>

                  <div className="certificate-brand">

                    <h2>
                      SevaSetu
                    </h2>

                    <span>
                      Bridging Hearts, Building Communities
                    </span>

                  </div>

                </div>

                {/* TOP LABEL */}

                <div className="certificate-label-row">

                  <span></span>

                  <p>
                    CERTIFICATE OF CONTRIBUTION
                  </p>

                  <span></span>

                </div>

                {/* TITLE */}

                <h1 className="certificate-title">
                  Certificate of Appreciation
                </h1>

                <div className="gold-divider">
                  <span>◆</span>
                </div>

                {/* PRESENTED TO */}

                <p className="presented-text">
                  THIS CERTIFICATE IS PROUDLY PRESENTED TO
                </p>

                {/* REGISTERED USER NAME */}

                <h2 className="donor-name">
                  {userName}
                </h2>

                <div className="name-line"></div>

                {/* DESCRIPTION */}

                <p className="certificate-description">
                  In recognition of your valuable contribution
                  to SevaSetu and your commitment to supporting
                  communities through meaningful donations.
                </p>

                {/* THREE FEATURES */}

                <div className="certificate-features">

                  {/* COINS */}

                  <div className="certificate-feature">

                    <div className="feature-icon coins-feature">
                      100+
                    </div>

                    <strong>
                      SevaSetu Coins
                    </strong>

                    <span>
                      Earned
                    </span>

                  </div>

                  <div className="feature-divider"></div>

                  {/* COMMUNITY */}

                  <div className="certificate-feature">

                    <div className="feature-icon">
                      ♥
                    </div>

                    <strong>
                      Community
                    </strong>

                    <span>
                      Impact
                    </span>

                  </div>

                  <div className="feature-divider"></div>

                  {/* CONTRIBUTION */}

                  <div className="certificate-feature">

                    <div className="feature-icon shield-icon">
                      ✓
                    </div>

                    <strong>
                      Contribution
                    </strong>

                    <span>
                      Completed
                    </span>

                  </div>

                </div>

                {/* BOTTOM SECTION */}

                <div className="certificate-bottom">

                  {/* DATE */}

                  <div className="certificate-date">

                    <span>
                      DATE
                    </span>

                    <strong>
                      {certificateDate}
                    </strong>

                  </div>

                  {/* SEAL */}

                  <div className="certificate-seal">

                    <div className="seal-outer">

                      <div className="seal-inner">

                        <strong>
                          100
                        </strong>

                        <span>
                          COINS
                        </span>

                        <small>
                          ★
                        </small>

                      </div>

                    </div>

                  </div>

                  {/* SIGNATURE */}

                  <div className="certificate-signature">

                    <div className="signature-line">
                      SevaSetu Team
                    </div>

                    <strong>
                      SevaSetu Team
                    </strong>

                    <span>
                      Authorized Signature
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Certificate;