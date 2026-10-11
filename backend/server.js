const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./src/config/database");
const { validateEnv } = require("./src/config/env");

// Load Environment Variables
dotenv.config();

// Stop right here if JWT_SECRET / MONGO_URI (and CLIENT_URL in production)
// are missing, rather than running with an insecure default.
validateEnv();

// Connect Database
connectDB();

const app = express();

// Behind nginx (Docker) every request arrives from the proxy's IP. Setting
// TRUST_PROXY=1 makes Express/rate-limiter use the real client IP instead,
// so one user hitting the limit doesn't lock out everybody.
if (process.env.TRUST_PROXY) {
  app.set("trust proxy", Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

// Global Express Middleware
app.use(helmet());
// Only the website's own address may call the API from a browser.
// CLIENT_URL can hold several addresses separated by commas.
// (Without it, local development falls back to http://localhost:3000.)
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Simple health check, useful to confirm the API + DB are up
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "SevaSetu API is running" });
});

// Feature-Based Modular Routes
app.use("/api/auth", require("./src/modules/auth/auth.routes"));
app.use("/api/donations", require("./src/modules/donation/donation.routes"));
app.use("/api/claims", require("./src/modules/claim/claim.routes"));
app.use("/api/admin", require("./src/modules/admin/admin.routes"));
app.use("/api/reports", require("./src/modules/report/report.routes"));
app.use("/api/subcategories", require("./src/modules/subcategory/subcategory.routes"));
app.use("/api/categories", require("./src/modules/category/category.routes"));
app.use("/api/stats", require("./src/modules/stats/stats.routes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});