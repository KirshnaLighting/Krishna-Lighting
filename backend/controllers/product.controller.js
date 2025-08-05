const Product = require("../models/product.model");
const cloudinary = require("../utils/cloudinary.config");

// Utility function to calculate stock status
const getStockStatus = (quantity, threshold) => {
  if (quantity <= 0) return "out-of-stock";
  if (quantity <= threshold) return "low-stock";
  return "in-stock";
};

const addProduct = async (req, res) => {
  try {
    const { productName, bodyColour, material, variants } = req.body;

    if (!productName || !bodyColour || !material || !variants) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Parse variants from JSON string (from frontend FormData)
    let parsedVariants;
    try {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;
    } catch (err) {
      return res.status(400).json({ message: "Invalid variants format" });
    }

    const files = req.files || [];

    // Group images by fieldname (e.g., variantImages_0, variantImages_1)
    const imageMap = {};
    for (const file of files) {
      const field = file.fieldname; // e.g., variantImages_0
      if (!imageMap[field]) imageMap[field] = [];
      imageMap[field].push({
        url: file.path,
        public_id: file.filename,
      });
    }

    // Process each variant
    const processedVariants = parsedVariants.map((variant, index) => {
      const fieldKey = `variantImages_${index}`;
      const images = imageMap[fieldKey] || [];

      return {
        ...variant,
        images,
        stock: {
          quantity: Number(variant.stock?.quantity || 0),
          threshold: Number(variant.stock?.threshold || 10),
          status: getStockStatus(
            Number(variant.stock?.quantity || 0),
            Number(variant.stock?.threshold || 10)
          ),
        },
      };
    });

    const product = new Product({
      productName,
      bodyColour,
      material,
      variants: processedVariants,
    });

    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({}).skip(skip).limit(limit),
      Product.countDocuments(),
    ]);

    res.json({
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

const editProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const { productName, bodyColour, material, variants } = req.body;
    const parsedVariants =
      typeof variants === "string" ? JSON.parse(variants) : variants;

    const files = req.files || [];

    // Group new images by variantImages_0, variantImages_1, etc.
    const imageMap = {};
    for (const file of files) {
      const field = file.fieldname;
      if (!imageMap[field]) imageMap[field] = [];
      imageMap[field].push({
        url: file.path,
        public_id: file.filename,
      });
    }

    // Store old variants before modifying
    const oldVariants = JSON.parse(JSON.stringify(product.variants));

    const processedVariants = parsedVariants.map((variant, index) => {
      const fieldKey = `variantImages_${index}`;
      const newVariantImages = imageMap[fieldKey] || [];

      const existingVariant = product.variants[index] || {};
      const oldImages = existingVariant.images || [];

      const imagesToUse = newVariantImages.length > 0
        ? newVariantImages
        : (variant.images || oldImages);

      return {
        ...variant,
        images: imagesToUse,
        stock: {
          quantity: Number(
            variant.stock?.quantity ?? existingVariant.stock?.quantity ?? 0
          ),
          threshold: Number(
            variant.stock?.threshold ?? existingVariant.stock?.threshold ?? 10
          ),
          status: getStockStatus(
            Number(
              variant.stock?.quantity ?? existingVariant.stock?.quantity ?? 0
            ),
            Number(
              variant.stock?.threshold ?? existingVariant.stock?.threshold ?? 10
            )
          ),
        },
      };
    });

    // Update product fields
    product.productName = productName || product.productName;
    product.bodyColour = bodyColour || product.bodyColour;
    product.material = material || product.material;
    product.variants = processedVariants;

    const updatedProduct = await product.save();

    // Delete replaced Cloudinary images
    for (let i = 0; i < oldVariants.length; i++) {
      const oldImages = oldVariants[i]?.images || [];
      const newImages = processedVariants[i]?.images || [];

      for (const oldImg of oldImages) {
        const isReplaced = !newImages.some(
          (newImg) => newImg.public_id === oldImg.public_id
        );
        if (isReplaced && oldImg.public_id) {
          try {
            await cloudinary.uploader.destroy(oldImg.public_id);
          } catch (err) {
            console.error("Cloudinary delete error:", err.message);
          }
        }
      }
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const updateProductStock = async (req, res) => {
  try {
    const { variantId, quantity, threshold } = req.body;

    if (!variantId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "Variant ID and quantity are required" });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.id(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }

    // Update stock values
    if (quantity !== undefined) variant.stock.quantity = quantity;
    if (threshold !== undefined) variant.stock.threshold = threshold;

    // Update status
    variant.stock.status = getStockStatus(
      variant.stock.quantity,
      variant.stock.threshold
    );

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error("Error updating stock:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product or variant ID" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary safely
    for (const variant of product.variants || []) {
      for (const image of variant.images || []) {
        if (image?.public_id) {
          await cloudinary.uploader
            .destroy(image.public_id)
            .catch((err) => console.error("Failed to delete image:", err));
        }
      }
    }

    await product.deleteOne(); // or await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};



module.exports = {
  addProduct,
  editProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProductStock,
};
