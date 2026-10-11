const dns = require("node:dns");
dns.setServers(["8.8.8.8"]);

/**
 * Populates the Category and Subcategory collections.
 *
 * Run once (safe to re-run - it upserts, so it won't create
 * duplicates):
 *   npm run seed:categories
 */
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Category = require("../src/models/Category");
const Subcategory = require("../src/models/Subcategory");

// Same 8 categories the frontend shows in src/utils/categories.js,
// so the donation form and the database agree with each other.
const CATEGORIES = [
  {
    slug: "food",
    name: "Food & Groceries",
    icon: "🍲",
    blurb: "Meals, grains and dry rations for community kitchens",
    items: [
      "Rice", "Wheat Flour", "Pulses / Dal", "Cooking Oil", "Sugar",
      "Packaged Food", "Fresh Vegetables", "Fruits", "Biscuits & Snacks",
      "Baby Food", "Cooked Meals", "Other Food Item",
    ],
  },
  {
    slug: "clothes",
    name: "Clothing",
    icon: "👕",
    blurb: "Wearable clothing and blankets for families in need",
    items: [
      "Shirts", "T-Shirts", "Trousers / Jeans", "Saree", "Kurta / Salwar Suit",
      "Children's Clothing", "Winter Wear", "Blankets", "Bedsheets",
      "Footwear", "Other Clothing",
    ],
  },
  {
    slug: "books",
    name: "Books & Stationery",
    icon: "📚",
    blurb: "Learning material for schools and study centres",
    items: [
      "School Textbooks", "Notebooks", "Story Books",
      "Competitive Exam Books", "Stationery Kit", "School Bags",
      "Art Supplies", "Other Study Material",
    ],
  },
  {
    slug: "furniture",
    name: "Furniture & Household",
    icon: "🪑",
    blurb: "Usable furniture and utensils for shelters and homes",
    items: [
      "Chairs", "Tables", "Study Desk", "Bed / Mattress", "Cupboard",
      "Kitchen Utensils", "Fans", "Other Household Item",
    ],
  },
  {
    slug: "electronics",
    name: "Electronics",
    icon: "💻",
    blurb: "Working devices that help learners get online",
    items: [
      "Laptop", "Desktop Computer", "Tablet", "Mobile Phone", "Printer",
      "Monitor", "Keyboard / Mouse", "Other Electronics",
    ],
  },
  {
    slug: "medical",
    name: "Medical Supplies",
    icon: "🩺",
    blurb: "Aids and supplies for health camps and clinics",
    items: [
      "Wheelchair", "Walking Stick", "Crutches", "First Aid Kit",
      "Sanitary Supplies", "Spectacles", "Other Medical Item",
    ],
  },
  {
    slug: "toys",
    name: "Toys & Sports",
    icon: "🧸",
    blurb: "Play and sports gear for children's programmes",
    items: [
      "Soft Toys", "Board Games", "Puzzles", "Cricket Kit", "Football",
      "Badminton Set", "Other Toy / Sports Item",
    ],
  },
  {
    slug: "other",
    name: "Other Essentials",
    icon: "🎁",
    blurb: "Anything else a community organisation can put to use",
    items: [
      "Hygiene Kit", "Toiletries", "Umbrella", "Water Bottles",
      "Solar Lamp", "Other Item",
    ],
  },
];

const run = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is not set. Fill in your .env file first.");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB.");

  let categoryCount = 0;
  let subcategoryCount = 0;

  for (const cat of CATEGORIES) {
    const category = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { name: cat.name, slug: cat.slug, icon: cat.icon, blurb: cat.blurb },
      { upsert: true, new: true }
    );
    categoryCount += 1;

    for (const itemName of cat.items) {
      await Subcategory.findOneAndUpdate(
        { name: itemName, category: category._id },
        { name: itemName, category: category._id },
        { upsert: true, new: true }
      );
      subcategoryCount += 1;
    }
  }

  console.log(`Done. ${categoryCount} categories, ${subcategoryCount} subcategories.`);

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error("Failed to seed categories:", error.message);
  process.exit(1);
});
