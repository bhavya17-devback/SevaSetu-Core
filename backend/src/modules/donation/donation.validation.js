const { z } = require("zod");

const createDonationSchema = z.object({
  body: z.object({
    itemName: z.string().optional(),
    title: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    quantity: z.string().min(1, "Quantity is required"),
    unit: z.string().optional(),
    condition: z.string().optional(),
    description: z.string().optional(),
    city: z.string().min(1, "City is required"),
    address: z.string().optional(),
    pickupAddress: z.string().optional(),
    pickupDate: z.string().optional(),
    contactPhone: z.string().optional(),
  }),
});

module.exports = {
  createDonationSchema,
};