const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['donor', 'ngo', 'admin', 'Donor', 'NGO', 'Admin'],
      default: 'donor',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'blocked', 'rejected'],
      default: 'active',
    },
    // Naye Frontend Fields:
    city: { type: String, trim: true },
    address: { type: String, trim: true },
    regNumber: { type: String, trim: true }, // NGO ke liye
    focusArea: { type: String, trim: true }, // NGO ke liye
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);