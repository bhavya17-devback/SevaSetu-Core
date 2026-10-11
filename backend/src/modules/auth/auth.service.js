const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const { signToken } = require("../../utils/token");

const registerUser = async (userData) => {
  const { name, email, password, phone, role, city, address, regNumber, focusArea } = userData;

  const cleanEmail = String(email).trim().toLowerCase();

  const existingUser = await User.findOne({ email: cleanEmail });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // Only donor and NGO accounts can be created here. Anything else
  // (including a spoofed "admin") becomes a donor.
  const safeRole = String(role || "donor").toLowerCase() === "ngo" ? "ngo" : "donor";

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email: cleanEmail,
    password: hashedPassword,
    phone, // <-- Ye add kar diya hai
    role: safeRole,
    city,
    address,
    regNumber,
    focusArea,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
};

const STATUS_MESSAGES = {
  blocked: "Your account has been suspended. Please contact the admin.",
  rejected: "Your account was not approved. Please contact the admin.",
  pending: "Your account is waiting for admin approval.",
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Checked after the password so we never reveal whether an email exists.
  if (user.status && user.status !== "active") {
    throw new Error(STATUS_MESSAGES[user.status] || "Your account is not active.");
  }

  const token = signToken(user, "7d");

  return {
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  registerUser,
  loginUser,
};