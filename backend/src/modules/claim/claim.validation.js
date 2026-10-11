const { z } = require("zod");

const claimDonationSchema = z.object({
  body: z.object({
    donationId: z.string().min(1, "Donation ID is required"),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(["Claimed", "Picked", "Completed"], {
      required_error: "Status is required",
    }),
    otp: z.string().optional(),
  }),
});

module.exports = {
  claimDonationSchema,
  updateStatusSchema,
};