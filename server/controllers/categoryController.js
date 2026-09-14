const Category = require("../models/Category");
const Product = require("../models/Product");

const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    const slug = createSlug(name);

    const existingCategory = await Category.findOne({
      $or: [{ name: name.trim() }, { slug }],
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "This category already exists",
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      description: description || "",
      image: image || "",
      isActive: isActive === undefined ? true : Boolean(isActive),
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while creating category",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const filter = {};

    if (req.query.admin !== "true") {
      filter.isActive = true;
    }

    const categories = await Category.find(filter).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting categories",
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Get category error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while getting category",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (req.body.name !== undefined) {
      category.name = req.body.name.trim();
      category.slug = createSlug(req.body.name);
    }

    if (req.body.description !== undefined) {
      category.description = req.body.description;
    }

    if (req.body.image !== undefined) {
      category.image = req.body.image;
    }

    if (req.body.isActive !== undefined) {
      category.isActive = Boolean(req.body.isActive);
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A category with this name or slug already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Server error while updating category",
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({
      category: category._id,
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "This category contains products. Move or delete those products first.",
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error while deleting category",
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};