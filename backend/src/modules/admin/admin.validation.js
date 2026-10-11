const { z } = require("zod");

const updateNgoStatusSchema = z.object({
  body: z.object({
    status: z.enum(["Approved", "Rejected"], {
      required_error: "Status must be Approved or Rejected",
    }),
  }),
});

module.exports = {
  updateNgoStatusSchema,
};