const express = require("express");
const router = express.Router();
const { upload } = require("../utils/multer");
const {
  addProduct,
  editProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProductStock,

} = require("../controllers/product.controller");

// Product CRUD routes
router.post("/", upload.any(), addProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.any(), editProduct);
router.patch("/:id/stock", updateProductStock);
router.delete("/:id", deleteProduct);


module.exports = router;
