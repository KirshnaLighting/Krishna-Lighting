import React, { useState, useEffect, useContext } from 'react';
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Truck, Shield, Tag, Gift, AlertCircle, Check } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/UserContext';
import { toast } from 'react-hot-toast';
import Footer from '../components/Footer';

const AddToCart = () => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Promo codes configuration
  const promoCodes = {
    'SAVE10': { discount: 10, type: 'percentage', minOrder: 5000 },
    'FLAT500': { discount: 500, type: 'fixed', minOrder: 3000 },
    'NEWUSER': { discount: 15, type: 'percentage', minOrder: 2000 },
    'SPECIAL20': { discount: 20, type: 'percentage', minOrder: 1000 }
  };

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const response = await fetch('https://krishna-lighting-backend.onrender.com/api/cart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();

        // Transform the data to match expected structure
        const transformedItems = data.cart.items.map(item => ({
          ...item,
          product: {
            ...item.product,
            // Ensure variants exists and is an array
            variants: item.product.variant ? [item.product.variant] : []
          }
        }));

        setCartItems(transformedItems || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    try {
      const response = await fetch(`https://krishna-lighting-backend.onrender.com/api/cart/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update quantity');
      }

      // Preserve existing product data by merging with the updated items
      setCartItems(prevItems => {
        return prevItems.map(item => {
          if (item._id === itemId) {
            return {
              ...item,
              quantity: newQuantity
            };
          }
          return item;
        });
      });

      toast.success('Quantity updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };
  
  const removeItem = async (itemId) => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    try {
      const response = await fetch(`https://krishna-lighting-backend.onrender.com/api/cart/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to remove item');
      }

      // Remove the item while preserving others
      setCartItems(prevItems => prevItems.filter(item => item._id !== itemId));
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const applyPromoCode = () => {
    const promo = promoCodes[promoCode.toUpperCase()];
    if (promo && subtotal >= promo.minOrder) {
      setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
      setPromoCode('');
      toast.success('Promo code applied successfully');
    } else {
      toast.error('Invalid promo code or minimum order not met');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    toast.info('Promo code removed');
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    if (cartItems.some(item => !item.product.variants[item.variantIndex]?.stock?.status === 'out-of-stock')) {
      toast.error('Please remove out of stock items before checkout');
      return;
    }

    navigate('/checkout');
  };

  // Calculate discounted price for each item (20% off)
  const calculateDiscountedPrice = (price) => {
    return price * 0.8; // 20% discount
  };

  // Calculate order summary values
  const subtotal = cartItems.reduce((sum, item) => sum + (calculateDiscountedPrice(item.price) * item.quantity), 0);
  const shipping = subtotal >= 2000 ? 0 : 199;

  let discount = 0;
  if (appliedPromo) {
    discount = appliedPromo.type === 'percentage'
      ? (subtotal * appliedPromo.discount) / 100
      : appliedPromo.discount;
  }

  const total = subtotal - discount + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalDiscount = cartItems.reduce((sum, item) => sum + ((item.price * 0.2) * item.quantity), 0);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view your cart</h2>
              <button
                onClick={() => navigate('/login', { state: { from: '/cart' } })}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium"
              >
                Login
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 text-gray-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Continue Shopping</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} className="text-amber-600" />
              <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-sm font-semibold">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-6">
                <ShoppingCart size={64} className="mx-auto text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">Discover our amazing lighting solutions and add some items to your cart</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => {
                  // Safely access variant data
                  const variant = item.product.variants?.[0] || {};
                  const isOutOfStock = variant.stock?.status === 'out-of-stock';
                  const image = item.product.image || 'https://via.placeholder.com/300';
                  const discountedPrice = calculateDiscountedPrice(item.price);

                  return (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={image}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-slate-900 truncate pr-4">
                              {item.product.name}
                            </h3>
                            <button
                              onClick={() => removeItem(item._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1 mb-3">
                            <div>Wattage: {variant.watt}</div>
                            {item.colorTemperature && (
                              <div>Color Temperature: {item.colorTemperature}</div>
                            )}
                            <div>Body Color: {item.bodyColor || item.product.bodyColor}</div>
                            <div>Type: {item.priceType}</div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            {/* Price */}
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <span className="text-xl font-bold text-slate-900">
                                  ₹{discountedPrice.toLocaleString()}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500 line-through">
                                    ₹{item.price.toLocaleString()}
                                  </span>
                                  <span className="text-green-600 text-sm font-semibold">
                                    (20% off)
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-4">
                              {isOutOfStock && (
                                <div className="flex items-center gap-1 text-red-600 text-sm">
                                  <AlertCircle size={16} />
                                  <span>Out of Stock</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                                  disabled={isOutOfStock}
                                >
                                  <Minus size={16} />
                                </button>
                                <span className={`px-3 py-1 rounded-md font-semibold min-w-[3rem] text-center ${isOutOfStock ? 'bg-gray-100 text-gray-400' : 'bg-gray-50'}`}>
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                                  disabled={isOutOfStock}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6">Order Summary</h3>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-green-600">
                      <span>Item Discount (20% off)</span>
                      <span className="font-semibold">-₹{totalDiscount.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className={`font-semibold ${shipping === 0 ? 'text-green-600' : ''}`}>
                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                      </span>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>₹{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {shipping > 0 && (
                    <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 text-sm">
                        <Truck size={16} />
                        <span>Add ₹{(2000 - subtotal).toLocaleString()} more for FREE delivery</span>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleCheckout}
                    disabled={cartItems.some(item => {
                      // Safely check stock status
                      const variant = item.product.variants?.[item.variantIndex ?? 0];
                      return variant?.stock?.status === 'out-of-stock';
                    })}
                    className={`w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors mb-4 ${cartItems.some(item => {
                      const variant = item.product.variants?.[item.variantIndex ?? 0];
                      return variant?.stock?.status === 'out-of-stock';
                    })
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                      }`}
                  >
                    Proceed to Checkout
                  </button>

                  <button
                    onClick={() => navigate('/products')}
                    className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    Continue Shopping
                  </button>

                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield size={16} className="text-green-600" />
                      <span>Secure checkout with SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Gift size={16} className="text-amber-600" />
                      <span>Free gift wrapping available</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Truck size={16} className="text-blue-600" />
                      <span>Express delivery in 2-3 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div> 
      <Footer />
    </div>
  );
};

export default AddToCart;