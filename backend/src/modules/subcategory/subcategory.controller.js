const subcategoryService = require("./subcategory.service");

const getAll = async (req, res) => {
  try {
    const { category } = req.query;
    const subcategories = await subcategoryService.getSubcategories(category);
    res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const subcategory = await subcategoryService.createSubcategory(req.body);
    res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subcategory,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await subcategoryService.deleteSubcategory(req.params.id);
    res.status(200).json({ success: true, message: "Subcategory deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAll, create, remove };
