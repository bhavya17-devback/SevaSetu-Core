/**
 * Creates the first Admin account so you can log in at /admin/login.
 *
 * Run once, after your .env is filled in:
 *   npm run seed:admin
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME from .env
 * (falls back to admin@sevasetu.com / admin@123 if not set).
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Fill in your .env file first.");
    process.exit(1);
  }

  const email = (process.env.ADMIN_EMAIL || "admin@sevasetu.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "admin@123";
  const name = process.env.ADMIN_NAME || "Administrator";

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`An account with ${email} already exists (role: ${existing.role}). Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    phone: "9999999999",
    role: "Admin",
    status: "active",
  });

  console.log(`Admin account created: ${email} / ${password}`);
  console.log("You can now log in at /admin/login with these credentials.");

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Failed to seed admin:", error.message);
  process.exit(1);
});
