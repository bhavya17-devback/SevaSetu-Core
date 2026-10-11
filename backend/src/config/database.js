const mongoose = require('mongoose');
const { normalizeLegacyData } = require('../utils/migrations');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error(
      "MONGO_URI is not set. Copy .env.example to .env and set MONGO_URI (e.g. mongodb://127.0.0.1:27017/sevasetu for a local database)."
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Fold old status spellings into the single convention (no-op once done).
    await normalizeLegacyData();
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    if (process.env.MONGO_URI.startsWith("mongodb+srv")) {
      console.error(
        "Check that your Atlas username/password are correct and that your current IP is allow-listed under Atlas > Network Access."
      );
    } else {
      console.error(
        "Check that MongoDB (mongod) is actually running on your machine - it's the same server MongoDB Compass connects to."
      );
    }
    process.exit(1);
  }
};

module.exports = connectDB;