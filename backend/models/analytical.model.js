// models/Analytics.js
const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['totalViews', 'pageViews', 'productViews']
  },
  count: {
    type: Number,
    default: 0
  },
  pageUrl: {
    type: String,
    required: function() { return this.type === 'pageViews'; }
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: function() { return this.type === 'productViews'; }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for page views and product views
analyticsSchema.index({ type: 1, pageUrl: 1 }, { unique: true, partialFilterExpression: { type: 'pageViews' } });
analyticsSchema.index({ type: 1, productId: 1 }, { unique: true, partialFilterExpression: { type: 'productViews' } });

module.exports = mongoose.model('Analytics', analyticsSchema);