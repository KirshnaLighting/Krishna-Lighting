const User = require('../models/user.model');
const Product = require("../models/product.model");

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, variantIndex, colorTemperature, bodyColor, priceType, quantity, price } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!productId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get user with cart populated
    const user = await User.findById(userId);

    // Check if product already in cart
    const existingItemIndex = user.cart.items.findIndex(
      item => item.product.toString() === productId.toString() && 
             item.variantIndex === variantIndex &&
             item.priceType === priceType
    );

    let updatedCartItems = [...user.cart.items];
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      updatedCartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      updatedCartItems.push({
        product: productId,
        variantIndex,
        colorTemperature,
        bodyColor,
        priceType,
        quantity,
        price
      });
    }

    // Calculate totals
    const totalItems = updatedCartItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = updatedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Update user's cart
    user.cart = {
      items: updatedCartItems,
      totalItems,
      totalPrice
    };

    await user.save();

    // Populate product details for response
    await user.populate({
      path: 'cart.items.product',
      select: 'productName variants bodyColour'
    });

    res.status(200).json({
      success: true,
      cart: user.cart
    });

  } catch (err) {
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.items.product',
        select: 'productName variants bodyColour'
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Enhance cart items with product details
    const enhancedItems = user.cart.items.map(item => {
      const product = item.product;
      const variant = product.variants[item.variantIndex] || {};
      const image = variant.images?.[0]?.url || '';
      
      return {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.productName,
          image,
          variant: {
            watt: variant.watt,
            dimensions: variant.dimensions
          },
          bodyColor: product.bodyColour
        },
        variantIndex: item.variantIndex,
        colorTemperature: item.colorTemperature,
        bodyColor: item.bodyColor,
        priceType: item.priceType,
        quantity: item.quantity,
        price: item.price
      };
    });

    res.status(200).json({
      success: true,
      cart: {
        items: enhancedItems,
        totalItems: user.cart.totalItems,
        totalPrice: user.cart.totalPrice
      }
    });

  } catch (err) {
    next(err);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    const user = await User.findById(req.user.id);
    const itemIndex = user.cart.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Update quantity
    user.cart.items[itemIndex].quantity = quantity;

    // Recalculate totals
    user.cart.totalItems = user.cart.items.reduce((total, item) => total + item.quantity, 0);
    user.cart.totalPrice = user.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await user.save();

    res.status(200).json({
      success: true,
      cart: user.cart
    });

  } catch (err) {
    next(err);
  }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const user = await User.findById(req.user.id);

    // Filter out the item to remove
    user.cart.items = user.cart.items.filter(item => item._id.toString() !== itemId);

    // Recalculate totals
    user.cart.totalItems = user.cart.items.reduce((total, item) => total + item.quantity, 0);
    user.cart.totalPrice = user.cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    await user.save();

    res.status(200).json({
      success: true,
      cart: user.cart
    });

  } catch (err) {
    next(err);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Reset cart
    user.cart = {
      items: [],
      totalItems: 0,
      totalPrice: 0
    };

    await user.save();

    res.status(200).json({
      success: true,
      cart: user.cart
    });

  } catch (err) {
    next(err);
  }
};