const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  productName: { type: String, required: true },
  bodyColour: { type: String, required: true },
  material: { type: String, required: true },
  variants: [
    {
      watt: { type: String, required: true },
      dimensions: { type: String, required: true },
      cutout: { type: String, required: true },
      beamAngle: { type: String, required: true },
      colorTemperature: { type: [String], required: true },
      cri: { type: String, required: true },
      images: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true }
        }
      ],
      price: {
        threeInOne: { type: Number, required: true },
        tAndD: { type: Number, required: true },
        custom: { type: Number, required: true }
      },
      stock: {
        quantity: { type: Number, default: 0 },
        threshold: { type: Number, default: 10 },
        status: {
          type: String,
          enum: ['in-stock', 'low-stock', 'out-of-stock'],
          default: 'out-of-stock'
        }
      }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt before save
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', productSchema);
