const { z } = require("zod");

const createReportSchema = z.object({
  body: z.object({
    donationId: z.string().min(1, "Donation ID is required"),
    reason: z.enum(["Fake Donation", "Spam", "Incorrect Information", "Inappropriate Content"], {
      required_error: "Valid reason is required",
    }),
    description: z.string().optional(),
  }),
});

module.exports = {
  createReportSchema,
};