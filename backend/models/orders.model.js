const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantIndex: {
    type: Number,
    required: true
  },
  colorTemperature: String,
  bodyColor: String,
  priceType: {
    type: String,
    enum: ['threeInOne', 'tAndD', 'custom'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  name: {
    type: String,
    required: true
  },
  wattage: {
    type: String,
    required: true
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please provide a valid 10-digit phone number']
  },
  deliveryInstructions: {
    type: String,
    trim: true
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentMethod: {
    type: String,
    enum: ['COD'],
    default: 'COD',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingFee: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  deliveredAt: Date,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  try {
    // Generate order number like ORD-YYYYMMDD-XXXX
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      }
    });
    
    this.orderNumber = `ORD-${datePart}-${(count + 1).toString().padStart(4, '0')}`;
    next();
  } catch (err) {
    next(err);
  }
});

// Update product stock when order is created
orderSchema.post('save', async function(doc) {
  try {
    const Product = mongoose.model('Product');
    
    for (const item of doc.items) {
      await Product.updateOne(
        { _id: item.product, 'variants.stock.quantity': { $gte: item.quantity } },
        { $inc: { 'variants.$[elem].stock.quantity': -item.quantity } },
        { 
          arrayFilters: [{ 'elem.stock.quantity': { $gte: item.quantity } }]
        }
      );
    }
  } catch (err) {
    console.error('Error updating product stock:', err);
  }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;