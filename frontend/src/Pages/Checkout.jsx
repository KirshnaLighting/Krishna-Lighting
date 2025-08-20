import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/UserContext';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Truck, Shield, MapPin, Phone, Check, Loader2 } from 'lucide-react';

const CheckoutPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderSummary, setOrderSummary] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 0,
    total: 0,
    itemsCount: 0
  });
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    deliveryInstructions: ''
  });

  useEffect(() => {
    const fetchCart = async () => {
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
        setCartItems(data.cart.items || []);

        // Calculate order summary with 20% discount
        const subtotal = data.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = subtotal * 0.2; // 20% discount
        const discountedSubtotal = subtotal - discount;
        const shipping = discountedSubtotal >= 2000 ? 0 : 199;
        const total = discountedSubtotal + shipping;

        setOrderSummary({
          subtotal,
          discount,
          shipping,
          total,
          itemsCount: data.cart.items.reduce((sum, item) => sum + item.quantity, 0)
        });

        // Safely set default address from user profile if available
        if (user?.address) {
          setAddress(prev => ({
            ...prev,
            street: user.address.street || '',
            city: user.address.city || '',
            state: user.address.state || '',
            zipCode: user.address.zipCode || '',
            phone: user.phone || ''
          }));
        }

      } catch (err) {
        toast.error(err.message || 'Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePlaceOrder = async () => {
    // Validate address
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.phone) {
      toast.error('Please fill all required address fields');
      return;
    }

    if (!/^\d{10}$/.test(address.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    if (!/^\d{5,6}$/.test(address.zipCode)) {
      toast.error('Please enter a valid ZIP code (5 or 6 digits)');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacingOrder(true);

    try {
      console.log(cartItems)
      // Prepare order items data with discounted prices
      const items = cartItems.map(item => ({
        product: item.product._id,
        variantIndex: item.variantIndex,
        colorTemperature: item.colorTemperature,
        bodyColor: item.bodyColor,
        priceType: item.priceType,
        quantity: item.quantity,
        price: item.price * 0.8, // Apply 20% discount to each item
        originalPrice: item.price, // Store original price for reference
        name: item.product.name,
        wattage: item.product.variant.watt
      }));

      const orderData = {
        items,
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          phone: address.phone,
          instructions: address.deliveryInstructions
        },
        paymentMethod: 'COD',
        subtotal: orderSummary.subtotal,
        discount: orderSummary.discount,
        shippingFee: orderSummary.shipping,
        totalAmount: orderSummary.total
      };

      const response = await fetch('https://krishna-lighting-backend.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
        },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Clear cart after successful order
      await fetch('https://krishna-lighting-backend.onrender.com/api/cart/clear', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
        }
      });

      toast.success('Order placed successfully!', {
        icon: <Check className="text-green-500" />,
        duration: 4000
      });

      // Redirect to order confirmation page
      navigate(`/order-confirmation/${data.order._id}`);

    } catch (err) {
      console.error('Order placement error:', err);
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

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

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some items to your cart before checkout</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-grow py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Shipping Address */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="text-amber-600" size={20} />
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="street"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={address.city}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={address.state}
                      onChange={handleAddressChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={address.zipCode}
                      onChange={handleAddressChange}
                      required
                      pattern="\d{5,6}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      required
                      pattern="[0-9]{10}"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deliveryInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Instructions (Optional)
                  </label>
                  <textarea
                    id="deliveryInstructions"
                    name="deliveryInstructions"
                    rows={3}
                    value={address.deliveryInstructions}
                    onChange={handleAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

                <div className="space-y-4">
                  <div className="space-y-4">
                    {cartItems.map((item, index) => {
                      // Safely access nested properties with fallbacks
                      const productName = item.product?.name || "Product";
                      const variant = item.product?.variants?.[item.variantIndex] || {};
                      const wattage = variant.wattage || "";
                      const originalPrice = item.price || 0;
                      const discountedPrice = originalPrice * 0.8; // 20% discount
                      const quantity = item.quantity || 1;

                      return (
                        <div key={index} className="border-b pb-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{productName}</p>
                              <p className="text-sm text-gray-600">
                                {wattage && `${wattage} • `}Qty: {quantity}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="font-medium">₹{(discountedPrice * quantity).toLocaleString()}</span>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="line-through">₹{(originalPrice * quantity).toLocaleString()}</span>
                                <span className="text-green-600 font-medium">20% off</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({orderSummary.itemsCount} items)</span>
                    <span className="font-medium">₹{orderSummary.subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-green-600">
                    <span>Discount (20%)</span>
                    <span className="font-medium">-₹{orderSummary.discount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${orderSummary.shipping === 0 ? 'text-green-600' : ''}`}>
                      {orderSummary.shipping === 0 ? 'FREE' : `₹${orderSummary.shipping}`}
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>₹{orderSummary.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-amber-500 rounded-lg bg-amber-50">
                    <div className="flex items-center gap-3">
                      <Truck className="text-amber-600" size={20} />
                      <span className="font-medium">Cash on Delivery (COD)</span>
                    </div>
                    <div className="w-5 h-5 rounded-full border-2 border-amber-600 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Pay in cash when your order is delivered. No online payment required.
                  </p>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors shadow-md disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placingOrder ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Placing Order...
                  </>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Security Info */}
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="text-green-600" size={16} />
                <span>Your information is secure with us</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;