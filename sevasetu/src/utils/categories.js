/* =========================================================
   DONATION CATEGORIES
   ---------------------------------------------------------
   Each category carries its own NGO-style cover photograph.
   The donor no longer uploads a picture: the artwork comes
   from the category, so every listing looks consistent.
   ========================================================= */

export const CATEGORIES = [
  {
    id: "food",
    label: "Food & Groceries",
    icon: "🍲",
    tint: "#f97316",
    blurb: "Meals, grains and dry rations for community kitchens",
    image:
      "https://images.unsplash.com/photo-1604742760885-05f1900cd2c2?auto=format&fit=crop&w=900&q=80",
    items: [
      "Rice",
      "Wheat Flour",
      "Pulses / Dal",
      "Cooking Oil",
      "Sugar",
      "Packaged Food",
      "Fresh Vegetables",
      "Fruits",
      "Biscuits & Snacks",
      "Baby Food",
      "Cooked Meals",
      "Other Food Item",
    ],
  },
  {
    id: "clothes",
    label: "Clothing",
    icon: "👕",
    tint: "#0d9488",
    blurb: "Wearable clothing and blankets for families in need",
    image:
      "https://images.unsplash.com/photo-1544522857-b7288ac171dd?auto=format&fit=crop&w=900&q=80",
    items: [
      "Shirts",
      "T-Shirts",
      "Trousers / Jeans",
      "Saree",
      "Kurta / Salwar Suit",
      "Children's Clothing",
      "Winter Wear",
      "Blankets",
      "Bedsheets",
      "Footwear",
      "Other Clothing",
    ],
  },
  {
    id: "books",
    label: "Books & Stationery",
    icon: "📚",
    tint: "#2563eb",
    blurb: "Learning material for schools and study centres",
    image:
      "https://images.unsplash.com/photo-1608993469718-e39b07fc7041?auto=format&fit=crop&w=900&q=80",
    items: [
      "School Textbooks",
      "Notebooks",
      "Story Books",
      "Competitive Exam Books",
      "Stationery Kit",
      "School Bags",
      "Art Supplies",
      "Other Study Material",
    ],
  },
  {
    id: "furniture",
    label: "Furniture & Household",
    icon: "🪑",
    tint: "#9333ea",
    blurb: "Usable furniture and utensils for shelters and homes",
    image:
      "https://images.unsplash.com/photo-1689055033181-ff7a82a39936?auto=format&fit=crop&w=900&q=80",
    items: [
      "Chairs",
      "Tables",
      "Study Desk",
      "Bed / Mattress",
      "Cupboard",
      "Kitchen Utensils",
      "Fans",
      "Other Household Item",
    ],
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: "💻",
    tint: "#0ea5e9",
    blurb: "Working devices that help learners get online",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80",
    items: [
      "Laptop",
      "Desktop Computer",
      "Tablet",
      "Mobile Phone",
      "Printer",
      "Monitor",
      "Keyboard / Mouse",
      "Other Electronics",
    ],
  },
  {
    id: "medical",
    label: "Medical Supplies",
    icon: "🩺",
    tint: "#dc2626",
    blurb: "Aids and supplies for health camps and clinics",
    image:
      "https://images.unsplash.com/photo-1642055514517-7b52288890ec?auto=format&fit=crop&w=900&q=80",
    items: [
      "Wheelchair",
      "Walking Stick",
      "Crutches",
      "First Aid Kit",
      "Sanitary Supplies",
      "Spectacles",
      "Other Medical Item",
    ],
  },
  {
    id: "toys",
    label: "Toys & Sports",
    icon: "🧸",
    tint: "#db2777",
    blurb: "Play and sports gear for children's programmes",
    image:
      "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=900&q=80",
    items: [
      "Soft Toys",
      "Board Games",
      "Puzzles",
      "Cricket Kit",
      "Football",
      "Badminton Set",
      "Other Toy / Sports Item",
    ],
  },
  {
    id: "other",
    label: "Other Essentials",
    icon: "🎁",
    tint: "#64748b",
    blurb: "Anything else a community organisation can put to use",
    image:
      "https://images.unsplash.com/photo-1732800577634-f2e5c4d43995?auto=format&fit=crop&w=900&q=80",
    items: [
      "Hygiene Kit",
      "Toiletries",
      "Umbrella",
      "Water Bottles",
      "Solar Lamp",
      "Other Item",
    ],
  },
];

/* =========================================================
   LIVE CATEGORY LIST
   ---------------------------------------------------------
   The list above is the built-in set (photos, colours). The
   real list lives in the database, where an admin can add or
   remove categories and subcategories. CategoriesContext
   fetches it and hands it to registerCategories(), so every
   getCategory() call in the app sees the admin's changes.
   ========================================================= */

export const DEFAULT_TINT = "#0d9488";

let registered = null;

export const registerCategories = (list) => {
  registered = list && list.length ? list : null;
};

export const getAllCategories = () => registered || CATEGORIES;

/* Combines the database categories/subcategories with the built-in
   photos and colours. Categories an admin created have no photo, so
   they get a plain icon tile instead. */
export const mergeDbCategories = (dbCategories, dbSubcategories) => {
  if (!dbCategories || dbCategories.length === 0) return CATEGORIES;

  const builtIn = {};
  CATEGORIES.forEach((category) => {
    builtIn[category.id] = category;
  });

  const merged = dbCategories.map((category) => {
    const base = builtIn[category.slug];

    const subs = (dbSubcategories || [])
      .filter((sub) => sub.categoryId === category.id)
      .map((sub) => sub.name);

    return {
      id: category.slug,
      dbId: category.id,
      label: category.name,
      icon: category.icon || (base && base.icon) || "🏷",
      tint: (base && base.tint) || DEFAULT_TINT,
      blurb: category.blurb || (base && base.blurb) || "",
      image: (base && base.image) || null,
      items: subs.length > 0 ? subs : (base && base.items) || [],
    };
  });

  const order = (id) => {
    const index = CATEGORIES.findIndex((category) => category.id === id);
    return index === -1 ? 1000 : index;
  };

  return merged.sort(
    (a, b) => order(a.id) - order(b.id) || a.label.localeCompare(b.label)
  );
};

const prettify = (id) =>
  String(id || "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Other";

export const getCategory = (id) =>
  getAllCategories().find((category) => category.id === id) ||
  CATEGORIES.find((category) => category.id === id) || {
    id,
    label: prettify(id),
    icon: "🎁",
    tint: DEFAULT_TINT,
    blurb: "",
    image: null,
    items: [],
  };

export const getCategoryImage = (id) => getCategory(id).image;

export const getCategoryLabel = (id) => getCategory(id).label;

export const CONDITIONS = [
  "Brand New",
  "Like New",
  "Gently Used",
  "Used - Good",
  "Needs Minor Repair",
];

export const UNITS = ["Items", "Kg", "Packets", "Boxes", "Sets", "Pairs"];
