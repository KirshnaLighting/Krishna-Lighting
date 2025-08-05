const Order = require("../models/orders.model");
const Cart = require("../models/user.model");
const Product = require("../models/product.model");
const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // For self-signed certificates if needed
  },
});

const sendOrderConfirmationEmail = async (email, order) => {
try {
    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Thank you for your order!</h2>
          <p>Your order #${
            order.orderNumber
          } has been received and is being processed.</p>
          
          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Summary</h3>
          ${order.items
            .map(
              (item) => `
            <div style="margin-bottom: 15px;">
              <p style="margin: 5px 0; font-weight: bold;">${item.name} (${
                item.wattage
              })</p>
              <p style="margin: 5px 0; color: #666;">Qty: ${item.quantity} × ₹${
                item.price
              } = ₹${item.quantity * item.price}</p>
            </div>
          `
            )
            .join("")}
          
          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Shipping Information</h3>
          <p>${order.shippingAddress.street}</p>
          <p>${order.shippingAddress.city}, ${order.shippingAddress.state} - ${
        order.shippingAddress.zipCode
      }</p>
          <p>Phone: ${order.shippingAddress.phone}</p>
          
          <h3 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">Order Total</h3>
          <p>Subtotal: ₹${order.subtotal}</p>
          <p>Shipping: ₹${order.shippingFee}</p>
          <p style="font-weight: bold;">Total: ₹${order.totalAmount}</p>
          
          <p style="margin-top: 20px;">We'll notify you when your order ships!</p>
        </div>
      `,
    };

    // Verify connection configuration
    await transporter.verify();

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send confirmation email");
  }
};

exports.placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    // Validate required fields
    if (
      !items ||
      !items.length ||
      !shippingAddress ||
      !paymentMethod ||
      !totalAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required order details",
      });
    }

    // Validate shipping address
    if (
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete shipping address",
      });
    }

    // Validate phone number
    if (!/^\d{10}$/.test(shippingAddress.phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    // Validate ZIP code
    if (!/^\d{5,6}$/.test(shippingAddress.zipCode)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid ZIP code (5 or 6 digits)",
      });
    }

    // Calculate subtotal and validate items
    let subtotal = 0;
    const productUpdates = [];
    const validatedItems = [];

    for (const item of items) {
      // Validate item structure
      if (
        !item.product ||
        !item.quantity ||
        !item.price ||
        !item.name ||
        !item.wattage
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid item in order",
        });
      }

      // Check product exists and has sufficient stock
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`,
        });
      }

      // Find the specific variant
      const variant = product.variants[item.variantIndex];
      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Invalid variant for product: ${item.name}`,
        });
      }

      // Check stock availability
      if (variant.stock.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${item.name} (${item.wattage})`,
        });
      }

      // Add to validated items
      validatedItems.push({
        product: item.product,
        variantIndex: item.variantIndex,
        colorTemperature: item.colorTemperature,
        bodyColor: item.bodyColor,
        priceType: item.priceType,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        wattage: item.wattage,
      });

      subtotal += item.price * item.quantity;

      // Prepare stock update
      productUpdates.push({
        updateOne: {
          filter: {
            _id: item.product,
            "variants.stock.quantity": { $gte: item.quantity },
          },
          update: {
            $inc: {
              [`variants.${item.variantIndex}.stock.quantity`]: -item.quantity,
              totalSold: item.quantity,
            },
          },
        },
      });
    }

    // Calculate shipping fee (free for orders over ₹2000)
    const shippingFee = subtotal >= 2000 ? 0 : 199;

    // Verify total amount matches calculated amount
    const calculatedTotal = subtotal + shippingFee;
    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Order total does not match calculated amount",
      });
    }

    const order = await Order.create({
      user: userId,
      items: validatedItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingFee,
      totalAmount,
      orderNumber: generateOrderNumber(),
    });

    // Update product stocks in bulk
    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates);
    }

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [], totalItems: 0, totalPrice: 0 } }
    );

    // Send order confirmation email (async)
    sendOrderConfirmationEmail(req.user.email, order).catch((error) =>
      console.error("Email sending failed:", error)
    );

    res.status(201).json({
      success: true,
      order,
      message: "Order placed successfully!",
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort("-createdAt")
      .select("-items.product"); // Don't include full product details in list view

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    next(err);
  }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid status value' 
            });
        }

        // Find and update order
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ 
                success: false,
                message: 'Order not found' 
            });
        }

        // Update status and timestamps if needed
        order.orderStatus = status;
        
        if (status === 'delivered') {
            order.deliveredAt = new Date();
        } else if (status === 'cancelled') {
            order.cancelledAt = new Date();
        }

        await order.save();

        res.json({ 
            success: true,
            order 
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while updating order status' 
        });
    }
};

// Get all orders (for admin)
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.json({ 
            success: true,
            orders 
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error while fetching orders' 
        });
    }
};

function generateOrderNumber() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
}
