const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getOrder,
  getMyOrders,
  getAllOrders,updateOrderStatus
} = require("../controllers/order.controller");

router.route("/").post(protect, placeOrder);

router.route("/").get(getAllOrders);

router.route("/myorders").get(protect, getMyOrders);

router
  .route("/:orderId/status")
  .put(updateOrderStatus);
router.route("/:id").get(protect, getOrder);

module.exports = router;
