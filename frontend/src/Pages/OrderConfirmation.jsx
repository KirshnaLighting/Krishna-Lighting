import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Truck, ShieldCheck, Home, Clock } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'react-hot-toast';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('krishnaLightingToken');
        const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch order details');
        }

        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        toast.error(err.message || 'Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, navigate]);

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

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-8">We couldn't find the order you're looking for</p>
            <button
              onClick={() => navigate('/orders')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View My Orders
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
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {/* Order Confirmation Header */}
            <div className="bg-green-50 px-6 py-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-gray-600">Thank you for your purchase</p>
              <p className="text-sm text-gray-500 mt-2">
                A confirmation email has been sent to your registered email address
              </p>
            </div>

            {/* Order Summary */}
            <div className="px-6 py-8 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Order Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Order Number:</span> {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> 
                      <span className="ml-1 px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-800">
                        {order.orderStatus}
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-2">Delivery Information</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Shipping To:</span> {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {order.shippingAddress.phone}
                    </p>
                    {order.shippingAddress.instructions && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Delivery Instructions:</span> {order.shippingAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-8 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start border-b pb-4 last:border-b-0">
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                      {/* Placeholder for product image - replace with actual image if available */}
                      <div className="h-full w-full flex items-center justify-center text-gray-400">
                        <Truck className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <h3 className="text-md font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.wattage}</p>
                      <p className="text-sm text-gray-600">
                        {item.colorTemperature && `${item.colorTemperature} • `}
                        {item.bodyColor}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{item.price.toLocaleString()} × {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="px-6 py-8">
              <div className="flex justify-between text-lg font-medium text-gray-900 mb-2">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-medium text-gray-900 mb-2">
                <span>Shipping</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 mt-4 pt-4 border-t">
                <span>Total</span>
                <span>₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 px-6 py-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900">Order Processing</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      We're preparing your order for shipment. This usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900">Shipping</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      You'll receive a notification when your order ships with tracking information.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900">Delivery</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Most orders arrive within 3-5 business days after shipping.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                >
                  View My Orders
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderConfirmationPage;