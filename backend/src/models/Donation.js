const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    itemName: {
      type: String,
      required: [true, 'Please specify item name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
    },
    quantity: {
      type: String,
      required: [true, 'Please specify quantity'],
    },
    unit: {
      type: String,
      default: 'Items',
    },
    condition: {
      type: String,
      default: 'Gently Used',
    },
    description: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please specify the city'],
      trim: true,
    },
    address: {
      type: String,
    },
    pickupAddress: {
      type: String,
    },
    pickupDate: {
      type: Date,
    },
    contactPhone: {
      type: String,
    },
    coins: {
      type: Number,
      default: 10,
    },
    // ONE convention: Available -> Claimed -> Completed, or Cancelled / Expired.
    // The setter folds old spellings ("pending", "available"...) into it, and
    // normalizeLegacyData() fixes existing records when the server starts.
    status: {
      type: String,
      enum: ['Available', 'Claimed', 'Completed', 'Cancelled', 'Expired'],
      default: 'Available',
      set: (value) => {
        const key = String(value || '').trim().toLowerCase();
        const map = {
          pending: 'Available',
          available: 'Available',
          claimed: 'Claimed',
          completed: 'Completed',
          cancelled: 'Cancelled',
          expired: 'Expired',
        };
        return map[key] || value;
      },
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // 6-digit code the donor shows the NGO at pickup. Never sent in
    // normal queries - only the donor's own list asks for it explicitly.
    otp: {
      type: String,
      select: false,
    },
    claimedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Donation', donationSchema);