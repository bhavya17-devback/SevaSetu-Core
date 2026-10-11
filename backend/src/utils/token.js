const jwt = require("jsonwebtoken");

// One place that signs and verifies tokens, so user login and admin login
// can never drift onto different secrets. There is NO fallback secret:
// validateEnv() stops the server at startup if JWT_SECRET is missing.
const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const signToken = (user, expiresIn = "7d") =>
  jwt.sign({ id: user._id, role: user.role }, getSecret(), { expiresIn });

const verifyToken = (token) => jwt.verify(token, getSecret());

module.exports = { signToken, verifyToken };
