const Product = require("../models/Product");
const Category = require("../models/Category");

// =====================================================
// SLUG HELPERS
// =====================================================

const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const getUniqueSlug = async (name, productId = null) => {
  const baseSlug = createSlug(name) || "product";

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = {
      slug,
    };

    if (productId) {
      query._id = {
        $ne: productId,
      };
    }

    const existingProduct =
      await Product.findOne(query).lean();

    if (!existingProduct) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
};

// =====================================================
// SKU HELPERS
// =====================================================

const createSkuBase = (name) => {
  const cleaned = name
    .toString()
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const base = cleaned
    .replace(/-/g, "")
    .slice(0, 10);

  return base || "ADW";
};

const getUniqueSku = async (name, productId = null) => {
  const baseSku = `ADW-${createSkuBase(name)}`;

  let sku = baseSku;
  let counter = 1;

  while (true) {
    const query = {
      sku,
    };

    if (productId) {
      query._id = {
        $ne: productId,
      };
    }

    const existingProduct =
      await Product.findOne(query).lean();

    if (!existingProduct) {
      return sku;
    }

    sku = `${baseSku}-${String(counter).padStart(3, "0")}`;
    counter++;
  }
};

// =====================================================
// NORMALIZE IMAGE DATA
// =====================================================

const normalizeImages = (images) => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        const url = image.trim();

        if (!url) {
          return null;
        }

        return {
          url,
          alt: "",
        };
      }

      if (
        image &&
        typeof image === "object" &&
        typeof image.url === "string"
      ) {
        const url = image.url.trim();

        if (!url) {
          return null;
        }

        return {
          url,
          alt:
            typeof image.alt === "string"
              ? image.alt.trim()
              : "",
        };
      }

      return null;
    })
    .filter(Boolean);
};

// =====================================================
// CREATE PRODUCT
// =====================================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      category,
      price,
      salePrice,
      bookingPrice,
      stock,
      sku,
      images,
      variants,
      tags,
      isFeatured,
      isActive,
    } = req.body;

    // ---------------------------------------------
    // REQUIRED FIELDS
    // ---------------------------------------------

    if (
      !name ||
      !String(name).trim() ||
      !description ||
      !String(description).trim() ||
      !category ||
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, description, category and price are required",
      });
    }

    // ---------------------------------------------
    // PRICE VALIDATION
    // ---------------------------------------------

    const regularPrice = Number(price);

    if (
      !Number.isFinite(regularPrice) ||
      regularPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid regular price enter karo.",
      });
    }

    // ---------------------------------------------
    // CATEGORY VALIDATION
    // ---------------------------------------------

    const categoryExists =
      await Category.findById(category);

    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message:
          "Selected category does not exist",
      });
    }

    // ---------------------------------------------
    // SALE PRICE
    // ---------------------------------------------

    let finalSalePrice = null;

    if (
      salePrice !== null &&
      salePrice !== undefined &&
      salePrice !== ""
    ) {
      finalSalePrice = Number(salePrice);

      if (
        !Number.isFinite(finalSalePrice) ||
        finalSalePrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid sale price enter karo.",
        });
      }

      if (finalSalePrice > regularPrice) {
        return res.status(400).json({
          success: false,
          message:
            "Sale price cannot be greater than regular price",
        });
      }
    }

    // ---------------------------------------------
    // BOOKING PRICE
    // ---------------------------------------------

    let finalBookingPrice = 500;

    if (
      bookingPrice !== undefined &&
      bookingPrice !== null &&
      bookingPrice !== ""
    ) {
      finalBookingPrice = Number(
        bookingPrice
      );

      if (
        !Number.isFinite(finalBookingPrice) ||
        finalBookingPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid booking price enter karo.",
        });
      }
    }

    // ---------------------------------------------
    // STOCK
    // ---------------------------------------------

    let finalStock = 0;

    if (
      stock !== undefined &&
      stock !== null &&
      stock !== ""
    ) {
      finalStock = Number(stock);

      if (
        !Number.isFinite(finalStock) ||
        finalStock < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Valid stock enter karo.",
        });
      }
    }

    // ---------------------------------------------
    // UNIQUE SLUG
    // ---------------------------------------------

    const slug = await getUniqueSlug(
      name
    );

    // ---------------------------------------------
    // UNIQUE SKU
    // ---------------------------------------------

    let finalSku = "";

    if (sku && String(sku).trim()) {
      finalSku = String(sku)
        .trim()
        .toUpperCase();

      const existingSku =
        await Product.findOne({
          sku: finalSku,
        }).lean();

      if (existingSku) {
        return res.status(409).json({
          success: false,
          message:
            `SKU "${finalSku}" already exists. ` +
            `Different SKU use karo.`,
        });
      }
    } else {
      finalSku = await getUniqueSku(
        name
      );
    }

    // ---------------------------------------------
    // IMAGES
    // ---------------------------------------------

    const finalImages =
      normalizeImages(images);

    // ---------------------------------------------
    // VARIANTS
    // ---------------------------------------------

    const finalVariants =
      Array.isArray(variants)
        ? variants
        : [];

    // ---------------------------------------------
    // TAGS
    // ---------------------------------------------

    const finalTags =
      Array.isArray(tags)
        ? tags
            .filter(
              (tag) =>
                typeof tag === "string" &&
                tag.trim()
            )
            .map((tag) => tag.trim())
        : [];

    // ---------------------------------------------
    // CREATE PRODUCT
    // ---------------------------------------------

    const product =
      await Product.create({
        name: String(name).trim(),

        slug,

        description:
          String(description).trim(),

        shortDescription:
          shortDescription
            ? String(
                shortDescription
              ).trim()
            : "",

        category,

        price: regularPrice,

        salePrice: finalSalePrice,

        bookingPrice:
          finalBookingPrice,

        stock: finalStock,

        sku: finalSku,

        images: finalImages,

        variants: finalVariants,

        tags: finalTags,

        isFeatured:
          Boolean(isFeatured),

        isActive:
          isActive === undefined
            ? true
            : Boolean(isActive),
      });

    // ---------------------------------------------
    // POPULATE CATEGORY
    // ---------------------------------------------

    const populatedProduct =
      await Product.findById(
        product._id
      ).populate(
        "category",
        "name slug"
      );

    // ---------------------------------------------
    // SUCCESS
    // ---------------------------------------------

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "CREATE PRODUCT ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "================================="
    );

    // ---------------------------------------------
    // DUPLICATE KEY
    // ---------------------------------------------

    if (error?.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      const duplicateValue =
        error.keyValue?.[
          duplicateField
        ];

      return res.status(409).json({
        success: false,
        message:
          duplicateField === "sku"
            ? `SKU "${duplicateValue || ""}" already exists. Different SKU use karo.`
            : duplicateField === "slug"
            ? "Product slug already exists. Dobara try karo."
            : "Duplicate product data found.",
      });
    }

    // ---------------------------------------------
    // MONGOOSE VALIDATION ERROR
    // ---------------------------------------------

    if (
      error?.name ===
      "ValidationError"
    ) {
      const validationMessages =
        Object.values(
          error.errors || {}
        )
          .map(
            (item) =>
              item.message
          )
          .filter(Boolean);

      return res.status(400).json({
        success: false,
        message:
          validationMessages.length
            ? validationMessages.join(
                " "
              )
            : "Product validation failed.",
      });
    }

    // ---------------------------------------------
    // CAST ERROR
    // ---------------------------------------------

    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid ${error.path || "product"} value.`,
      });
    }

    // ---------------------------------------------
    // DOCUMENT TOO LARGE
    // ---------------------------------------------

    if (
      error?.name ===
        "BSONError" ||
      error?.message?.includes(
        "document is larger than the maximum allowed BSON size"
      ) ||
      error?.message?.includes(
        "BSONObj size"
      )
    ) {
      return res.status(413).json({
        success: false,
        message:
          "Product image bohat large hai. 5MB se choti image use karo.",
      });
    }

    // ---------------------------------------------
    // GENERAL ERROR
    // ---------------------------------------------

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error while creating product",
    });
  }
};

// =====================================================
// GET PRODUCTS
// =====================================================

const getProducts = async (
  req,
  res
) => {
  try {
    const {
      search,
      category,
      featured,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      limit = 12,
      admin,
    } = req.query;

    const filter = {};

    if (admin !== "true") {
      filter.isActive = true;
    }

    if (category) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      filter.price = {};

      if (minPrice !== undefined) {
        filter.price.$gte =
          Number(minPrice);
      }

      if (maxPrice !== undefined) {
        filter.price.$lte =
          Number(maxPrice);
      }
    }

    let sortOption = {
      createdAt: -1,
    };

    if (sort === "oldest") {
      sortOption = {
        createdAt: 1,
      };
    }

    if (sort === "price-low") {
      sortOption = {
        price: 1,
      };
    }

    if (sort === "price-high") {
      sortOption = {
        price: -1,
      };
    }

    if (sort === "rating") {
      sortOption = {
        rating: -1,
      };
    }

    if (sort === "name") {
      sortOption = {
        name: 1,
      };
    }

    const currentPage =
      Math.max(
        Number(page) || 1,
        1
      );

    const perPage =
      Math.min(
        Math.max(
          Number(limit) || 12,
          1
        ),
        100
      );

    const skip =
      (currentPage - 1) *
      perPage;

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .populate(
          "category",
          "name slug"
        )
        .sort(sortOption)
        .skip(skip)
        .limit(perPage),

      Product.countDocuments(
        filter
      ),
    ]);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        page: currentPage,
        limit: perPage,
        total,
        totalPages:
          Math.ceil(
            total / perPage
          ),
      },
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error while getting products",
    });
  }
};

// =====================================================
// GET PRODUCT BY ID
// =====================================================

const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      ).populate(
        "category",
        "name slug"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    if (
      !product.isActive &&
      req.user?.role !== "admin"
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error while getting product",
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// =====================================================

const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    const allowedFields = [
      "name",
      "description",
      "shortDescription",
      "category",
      "price",
      "salePrice",
      "bookingPrice",
      "stock",
      "sku",
      "images",
      "variants",
      "tags",
      "isFeatured",
      "isActive",
    ];

    for (const field of allowedFields) {
      if (
        req.body[field] !==
        undefined
      ) {
        product[field] =
          req.body[field];
      }
    }

    // ---------------------------------------------
    // CATEGORY
    // ---------------------------------------------

    if (req.body.category) {
      const categoryExists =
        await Category.findById(
          req.body.category
        );

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message:
            "Selected category does not exist",
        });
      }
    }

    // ---------------------------------------------
    // NAME / SLUG
    // ---------------------------------------------

    if (
      req.body.name &&
      String(
        req.body.name
      ).trim()
    ) {
      product.name =
        String(
          req.body.name
        ).trim();

      product.slug =
        await getUniqueSlug(
          product.name,
          product._id
        );
    }

    // ---------------------------------------------
    // SKU
    // ---------------------------------------------

    if (
      req.body.sku !==
      undefined
    ) {
      const requestedSku =
        String(
          req.body.sku || ""
        )
          .trim()
          .toUpperCase();

      if (!requestedSku) {
        product.sku =
          await getUniqueSku(
            product.name,
            product._id
          );
      } else {
        const existingSku =
          await Product.findOne({
            sku: requestedSku,
            _id: {
              $ne: product._id,
            },
          }).lean();

        if (existingSku) {
          return res.status(409).json({
            success: false,
            message:
              `SKU "${requestedSku}" already exists. Different SKU use karo.`,
          });
        }

        product.sku =
          requestedSku;
      }
    }

    // ---------------------------------------------
    // IMAGES
    // ---------------------------------------------

    if (
      req.body.images !==
      undefined
    ) {
      product.images =
        normalizeImages(
          req.body.images
        );
    }

    // ---------------------------------------------
    // NUMERIC VALUES
    // ---------------------------------------------

    if (
      req.body.price !==
      undefined
    ) {
      const value =
        Number(
          req.body.price
        );

      if (
        !Number.isFinite(
          value
        ) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid regular price enter karo.",
        });
      }

      product.price = value;
    }

    if (
      req.body.salePrice !==
      undefined
    ) {
      if (
        req.body.salePrice ===
          null ||
        req.body.salePrice ===
          ""
      ) {
        product.salePrice =
          null;
      } else {
        const value =
          Number(
            req.body.salePrice
          );

        if (
          !Number.isFinite(
            value
          ) ||
          value < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Valid sale price enter karo.",
          });
        }

        product.salePrice =
          value;
      }
    }

    if (
      req.body.bookingPrice !==
      undefined
    ) {
      const value =
        Number(
          req.body.bookingPrice
        );

      if (
        !Number.isFinite(
          value
        ) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid booking price enter karo.",
        });
      }

      product.bookingPrice =
        value;
    }

    if (
      req.body.stock !==
      undefined
    ) {
      const value =
        Number(
          req.body.stock
        );

      if (
        !Number.isFinite(
          value
        ) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid stock enter karo.",
        });
      }

      product.stock = value;
    }

    // ---------------------------------------------
    // SALE PRICE CHECK
    // ---------------------------------------------

    if (
      product.salePrice !==
        null &&
      product.salePrice !==
        undefined &&
      Number(
        product.salePrice
      ) >
        Number(
          product.price
        )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Sale price cannot be greater than regular price",
      });
    }

    // ---------------------------------------------
    // SAVE
    // ---------------------------------------------

    await product.save();

    const updatedProduct =
      await Product.findById(
        product._id
      ).populate(
        "category",
        "name slug"
      );

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product:
        updatedProduct,
    });
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "UPDATE PRODUCT ERROR:"
    );

    console.error(
      error
    );

    console.error(
      "================================="
    );

    if (error?.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      return res.status(409).json({
        success: false,
        message:
          duplicateField === "sku"
            ? "This SKU already exists. Different SKU use karo."
            : "Duplicate product data found.",
      });
    }

    if (
      error?.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(
          error.errors || {}
        )
          .map(
            (item) =>
              item.message
          )
          .filter(Boolean);

      return res.status(400).json({
        success: false,
        message:
          messages.join(" ") ||
          "Product validation failed.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error while updating product",
    });
  }
};

// =====================================================
// DELETE PRODUCT
// =====================================================

const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    await Product.findByIdAndDelete(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete product error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error while deleting product",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};