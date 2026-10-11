const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().min(10),
    // Admin accounts are NOT self-service - they are created with the seed
    // script or by an existing admin.
    role: z.enum(["donor", "ngo", "Donor", "NGO"]).optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    regNumber: z.string().optional(),
    focusArea: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};