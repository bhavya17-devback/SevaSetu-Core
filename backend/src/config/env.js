/**
 * Fails fast at startup if a required setting is missing, instead of
 * running with an insecure default.
 */
const PLACEHOLDER_SECRETS = [
  "secretkey",
  "default_secret",
  "change_this_to_a_long_random_string",
];

const validateEnv = () => {
  const problems = [];
  const isProduction = process.env.NODE_ENV === "production";

  if (!process.env.MONGO_URI) {
    problems.push(
      "MONGO_URI is missing (e.g. mongodb://127.0.0.1:27017/sevasetu)"
    );
  }

  const secret = process.env.JWT_SECRET || "";
  if (!secret) {
    problems.push(
      "JWT_SECRET is missing - set a long random string in your .env file"
    );
  } else if (secret.length < 16) {
    problems.push(
      "JWT_SECRET is too short - use at least 16 characters (32+ is better)"
    );
  } else if (PLACEHOLDER_SECRETS.includes(secret)) {
    if (isProduction) {
      problems.push("JWT_SECRET is still a placeholder value - generate a real one");
    } else {
      console.warn("WARNING: JWT_SECRET is a placeholder. Change it before deploying.");
    }
  }

  if (isProduction && !process.env.CLIENT_URL) {
    problems.push(
      "CLIENT_URL is missing - set the website address (used for CORS in production)"
    );
  }

  if (problems.length > 0) {
    console.error("Server cannot start:\n - " + problems.join("\n - "));
    process.exit(1);
  }
};

module.exports = { validateEnv };
