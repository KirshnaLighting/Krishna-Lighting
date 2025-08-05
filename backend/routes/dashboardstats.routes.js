// routes/admin/dashboard.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/orders.model');
const Product = require('../models/product.model');
const Analytics = require('../models/analytical.model');

// Helper function to calculate percentage change
const calculateChange = (current, previous) => {
  if (previous === 0) return 100;
  return ((current - previous) / previous * 100).toFixed(1);
};

// Format currency for Indian Rupees
const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

router.get('/dashboard-stats', async (req, res) => {
  try {
    // Current period (last 30 days)
    const currentPeriodStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Previous period (30-60 days ago)
    const previousPeriodStart = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const previousPeriodEnd = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get revenue data for both periods
    const [currentRevenueData, previousRevenueData, currentOrderCount, previousOrderCount] = await Promise.all([
      // Current period revenue
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: currentPeriodStart },
            orderStatus: 'delivered'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Previous period revenue
      Order.aggregate([
        {
          $match: {
            createdAt: { 
              $gte: previousPeriodStart,
              $lt: previousPeriodEnd
            },
            orderStatus: 'delivered'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      
      // Current period order count
      Order.countDocuments({
        createdAt: { $gte: currentPeriodStart }
      }),
      
      // Previous period order count
      Order.countDocuments({
        createdAt: { 
          $gte: previousPeriodStart,
          $lt: previousPeriodEnd
        }
      })
    ]);

    const totalRevenue = currentRevenueData[0]?.total || 0;
    const prevRevenue = previousRevenueData[0]?.total || 0;
    const revenueChange = calculateChange(totalRevenue, prevRevenue);

    const orderChange = calculateChange(currentOrderCount, previousOrderCount);

    // Get product and analytics data
    const [productCount, websiteViews] = await Promise.all([
      Product.countDocuments({ 
        'variants.stock.status': 'in-stock' 
      }),
      Analytics.findOne({ type: 'totalViews' })
    ]);

    res.json([
      {
        name: 'Total Revenue',
        value: formatINR(totalRevenue),
        change: `${revenueChange}%`,
        changeType: revenueChange >= 0 ? 'positive' : 'negative'
      },
      {
        name: 'Total Orders',
        value: currentOrderCount,
        change: `${orderChange}%`,
        changeType: orderChange >= 0 ? 'positive' : 'negative',
        icon: 'ShoppingCart'
      },
      {
        name: 'Active Products',
        value: productCount,
        change: '+0%', // Not tracking product count change in this example
        changeType: 'positive',
        icon: 'Package'
      }
    ]);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/recent-orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate('items.product', 'productName');
    
    const formattedOrders = orders.map(order => ({
      id: order.orderNumber,
      customer: order.user?.name || 'Guest',
      product: order.items.length > 1 
        ? `${order.items[0]?.product?.productName} + ${order.items.length - 1} more` 
        : order.items[0]?.product?.productName || 'Unknown Product',
      amount: formatINR(order.totalAmount),
      status: order.orderStatus
    }));
    
    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/top-products', async (req, res) => {
  try {
    const products = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          salesCount: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
        }
      },
      { $sort: { salesCount: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $project: {
          name: '$product.productName',
          sales: '$salesCount',
          revenue: '$totalRevenue',
          rating: { $ifNull: ['$product.averageRating', 4.5] }
        }
      }
    ]);
    
    const formattedProducts = products.map(product => ({
      name: product.name,
      sales: product.sales,
      revenue: formatINR(product.revenue),
      rating: product.rating
    }));
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;