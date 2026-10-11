const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function run() {
  try {
    const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    const name = process.env.ADMIN_NAME || "Administrator";

    if (!MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required.");
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error("Admin password must be at least 12 characters.");
    }

    const email = ADMIN_EMAIL.trim().toLowerCase();

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Account already exists. No changes made.");
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name,
      email,
      password: hashedPassword,
      phone: "9999999999",
      role: "admin",
      status: "active",
    });

    console.log("Admin account created successfully.");
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

run();
