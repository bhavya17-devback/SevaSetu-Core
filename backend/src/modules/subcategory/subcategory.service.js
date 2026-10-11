const Subcategory = require("../../models/Subcategory");
const Category = require("../../models/Category");

const getSubcategories = async (categoryId) => {
  const filter = categoryId ? { category: categoryId } : {};
  return await Subcategory.find(filter).populate("category", "name slug");
};

const createSubcategory = async ({ name, category }) => {
  if (!name || !name.trim()) {
    throw new Error("Subcategory name is required");
  }
  if (!category) {
    throw new Error("A parent category is required");
  }

  const parent = await Category.findById(category);
  if (!parent) {
    throw new Error("Category not found");
  }

  const existing = await Subcategory.findOne({ name: name.trim(), category });
  if (existing) {
    throw new Error("This subcategory already exists under this category");
  }

  const subcategory = await Subcategory.create({ name: name.trim(), category });
  return await subcategory.populate("category", "name slug");
};

const deleteSubcategory = async (subcategoryId) => {
  const subcategory = await Subcategory.findByIdAndDelete(subcategoryId);
  if (!subcategory) {
    throw new Error("Subcategory not found");
  }
  return subcategory;
};

module.exports = { getSubcategories, createSubcategory, deleteSubcategory };
