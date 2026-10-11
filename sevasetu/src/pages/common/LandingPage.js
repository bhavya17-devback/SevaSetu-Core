import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useFetch } from "../../hooks/useSeva";
import { useAuth } from "../../context/AuthContext";
import { getPlatformStats } from "../../utils/storage";
import { CATEGORIES } from "../../utils/categories";
import "./LandingPage.css";

const EMPTY_STATS = {
  donors: 0,
  ngos: 0,
  totalDonations: 0,
  pending: 0,
  claimed: 0,
  completed: 0,
  cities: 0,
};

/* =========================================================
   LANDING PAGE
   The public face of SevaSetu.
   ========================================================= */

const STEPS = [
  {
    number: "01",
    icon: "📝",
    title: "List what you can spare",
    text: "Pick a category, add the quantity and where it can be collected from. It takes less than a minute.",
    image:
      "https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=800&q=80",
  },
  {
    number: "02",
    icon: "🔍",
    title: "An NGO claims it",
    text: "Verified organisations see your listing in their live feed and claim the items their programmes need.",
    image:
      "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=800&q=80",
  },
  {
    number: "03",
    icon: "🚚",
    title: "It reaches the right hands",
    text: "The NGO collects the donation, marks it delivered, and you earn Seva Coins towards your certificate.",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=800&q=80",
  },
];

function LandingPage() {
  const navigate = useNavigate();

  const { data: fetchedStats } = useFetch(getPlatformStats, []);
  const stats = fetchedStats || EMPTY_STATS;
  const { user } = useAuth();

  const goToDashboard = () => {
    if (!user) {
      navigate("/register");
      return;
    }

    navigate(user.role === "ngo" ? "/ngo/dashboard" : "/donor/dashboard");
  };

  return (
    <div className="landing">
      <Navbar />

      {/* ================= HERO ================= */}

      <header className="hero" id="home">
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-chip">
              <i>●</i> A bridge between surplus and need
            </span>

            <h1>
              Turn what you
              <br />
              no longer need into
              <br />
              <span>someone's essential.</span>
            </h1>

            <p>
              SevaSetu connects everyday donors with verified NGOs across India.
              Food, clothes, books, furniture, devices — list it once and watch
              it reach a community that has been waiting for exactly that.
            </p>

            <div className="hero-actions">
              <button
                type="button"
                className="sv-btn sv-btn-primary"
                onClick={goToDashboard}
              >
                {user ? "Go to my dashboard" : "Start donating"} →
              </button>

              <button
                type="button"
                className="sv-btn sv-btn-ghost"
                onClick={() => navigate("/register")}
              >
                Register your NGO
              </button>
            </div>

            <div className="hero-trust">
              <div className="hero-avatars">
                <span>🙋</span>
                <span>🤝</span>
                <span>🏢</span>
                <span>❤️</span>
              </div>

              <p>
                <strong>{stats.donors + stats.ngos} members</strong> already
                building the bridge
              </p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-photo main">
              <img
                src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=900&q=80"
                alt="Volunteers packing relief kits"
                loading="lazy"
              />
            </div>

            <div className="hero-photo small">
              <img
                src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80"
                alt="Books collected for a study centre"
                loading="lazy"
              />
            </div>

            <div className="hero-float card-a">
              <div className="float-icon saffron">🍲</div>
              <div>
                <strong>{stats.totalDonations}</strong>
                <small>Donations listed</small>
              </div>
            </div>

            <div className="hero-float card-b">
              <div className="float-icon teal">✓</div>
              <div>
                <strong>{stats.completed}</strong>
                <small>Delivered to NGOs</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= STATS STRIP ================= */}

      <section className="strip" id="impact">
        <div className="strip-inner">
          <div className="strip-item">
            <strong>{stats.donors}</strong>
            <span>Registered donors</span>
          </div>

          <div className="strip-item">
            <strong>{stats.ngos}</strong>
            <span>Partner NGOs</span>
          </div>

          <div className="strip-item">
            <strong>{stats.totalDonations}</strong>
            <span>Items listed</span>
          </div>

          <div className="strip-item">
            <strong>{stats.cities}</strong>
            <span>Cities reached</span>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="section" id="how-it-works">
        <div className="section-head">
          <span className="section-label">How it works</span>
          <h2>Three steps, one bridge</h2>
          <p>
            No paperwork, no phone calls, no guesswork about where your donation
            ended up.
          </p>
        </div>

        <div className="steps">
          {STEPS.map((step) => (
            <article className="step" key={step.number}>
              <div className="step-image">
                <img src={step.image} alt={step.title} loading="lazy" />
                <span className="step-number">{step.number}</span>
              </div>

              <div className="step-body">
                <div className="step-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="section categories-section" id="categories">
        <div className="section-head">
          <span className="section-label">What you can give</span>
          <h2>Eight ways to make a difference</h2>
          <p>
            Every category is matched to the NGOs that work in that area, so the
            right people see your listing.
          </p>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <article
              className="category-card"
              key={category.id}
              style={{ "--tint": category.tint }}
            >
              <div className="category-image">
                <img src={category.image} alt={category.label} loading="lazy" />
              </div>

              <div className="category-body">
                <span className="category-icon">{category.icon}</span>
                <h3>{category.label}</h3>
                <p>{category.blurb}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ================= FOR NGOS ================= */}

      <section className="section ngo-band">
        <div className="ngo-band-inner">
          <div className="ngo-band-photo">
            <img
              src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80"
              alt="NGO team distributing supplies"
              loading="lazy"
            />
          </div>

          <div className="ngo-band-copy">
            <span className="section-label teal">For organisations</span>

            <h2>Stop chasing donations. Start claiming them.</h2>

            <p>
              Register your organisation once and get a live feed of everything
              available near you. Claim an item and the donor's contact details
              and pickup address unlock immediately.
            </p>

            <ul className="ngo-band-points">
              <li>
                <span>✓</span> A live feed filtered by city and category
              </li>
              <li>
                <span>✓</span> One-click claiming, no double bookings
              </li>
              <li>
                <span>✓</span> A dashboard of everything you have received
              </li>
            </ul>

            <button
              type="button"
              className="sv-btn sv-btn-teal"
              onClick={() => navigate("/register")}
            >
              Register your NGO →
            </button>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}

      <section className="cta">
        <div className="cta-inner">
          <h2>Something in your home is someone else's necessity.</h2>

          <p>
            Join SevaSetu today and turn surplus into support. It takes a minute
            to sign up and less than that to list your first donation.
          </p>

          <div className="cta-actions">
            <button
              type="button"
              className="sv-btn sv-btn-primary"
              onClick={() => navigate("/register")}
            >
              Create a free account
            </button>

            <button
              type="button"
              className="sv-btn sv-btn-ghost"
              onClick={() => navigate("/login")}
            >
              I already have one
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default LandingPage;
