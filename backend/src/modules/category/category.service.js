const Category = require("../../models/Category");
const Subcategory = require("../../models/Subcategory");

const getCategories = async () => {
  return await Category.find().sort({ name: 1 });
};

const slugify = (name) =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const createCategory = async ({ name, icon, blurb }) => {
  if (!name || !name.trim()) {
    throw new Error("Category name is required");
  }

  const slug = slugify(name);

  const existing = await Category.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });
  if (existing) {
    throw new Error("A category with this name already exists");
  }

  return await Category.create({
    name: name.trim(),
    slug,
    icon: icon || "",
    blurb: blurb || "",
  });
};

const deleteCategory = async (categoryId) => {
  const inUse = await Subcategory.exists({ category: categoryId });
  if (inUse) {
    throw new Error(
      "This category still has subcategories under it. Delete those first."
    );
  }

  const category = await Category.findByIdAndDelete(categoryId);
  if (!category) {
    throw new Error("Category not found");
  }
  return category;
};

module.exports = { getCategories, createCategory, deleteCategory };
