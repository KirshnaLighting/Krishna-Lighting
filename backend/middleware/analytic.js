// middleware/trackViews.js
const Analytics = require('../models/analytical.model');

const trackViews = async (req, res, next) => {
  try {
    // Skip tracking for admin routes
    if (req.path.startsWith('/admin')) return next();
    
    // Update total views
    await Analytics.findOneAndUpdate(
      { type: 'totalViews' },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );
    
    // Update page-specific views
    if (req.path !== '/') {
      await Analytics.findOneAndUpdate(
        { type: 'pageViews', pageUrl: req.path },
        { $inc: { count: 1 } },
        { upsert: true, new: true }
      );
    }
    
    next();
  } catch (error) {
    console.error('Error tracking views:', error);
    next(); // Don't block the request if tracking fails
  }
};

module.exports = trackViews;