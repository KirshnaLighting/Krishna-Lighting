import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { Menu, Search, ChevronDown, ChevronUp, MoreVertical, Truck, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import moment from 'moment';

const Orders = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/orders', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setOrders(response.data.orders);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching orders:', error);
                setError('Failed to load orders. Please try again.');
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedOrders = React.useMemo(() => {
        let sortableOrders = [...orders];
        if (sortConfig.key) {
            sortableOrders.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableOrders;
    }, [orders, sortConfig]);

    const filteredOrders = sortedOrders.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.user?.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ?? false) ||
        order.shippingAddress.phone.includes(searchTerm)
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'processing':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Clock className="w-3 h-3 mr-1" /> Processing
                </span>;
            case 'shipped':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Truck className="w-3 h-3 mr-1" /> Shipped
                </span>;
            case 'delivered':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" /> Delivered
                </span>;
            case 'cancelled':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" /> Cancelled
                </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {status}
                </span>;
        }
    };

    const getPaymentStatusBadge = (status) => {
        return status === 'completed' ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Paid
            </span>
        ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
            </span>
        );
    };

    const toggleOrderExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/orders/${orderId}/status`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setOrders(orders.map(order => 
                    order._id === orderId ? { ...order, orderStatus: newStatus } : order
                ));
            } else {
                setError('Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setError(error.response?.data?.message || 'Failed to update order status');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />
            <div className="w-full flex flex-col">
                {/* Top bar */}
                <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
                        <div className="flex items-center">
                            <button
                                className="lg:hidden text-gray-500 hover:text-gray-600 mr-2"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open sidebar"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                                Orders Management
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="hidden sm:block text-right">
                                <div className="text-sm font-medium text-gray-900">Admin</div>
                                <div className="text-xs text-gray-500">Krishna Lighting</div>
                            </div>
                            <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">A</span>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="flex-1 p-4 sm:p-6">
                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                            <button 
                                onClick={() => setError(null)}
                                className="float-right font-bold"
                            >
                                &times;
                            </button>
                        </div>
                    )}

                    {/* Search and filter bar */}
                    <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Search orders..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <RefreshCw className="animate-spin h-8 w-8 text-gray-500" />
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('orderNumber')}>
                                                <div className="flex items-center">
                                                    Order #
                                                    {sortConfig.key === 'orderNumber' && (
                                                        sortConfig.direction === 'asc' ? 
                                                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                                                        <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                                                <div className="flex items-center">
                                                    Date
                                                    {sortConfig.key === 'createdAt' && (
                                                        sortConfig.direction === 'asc' ? 
                                                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                                                        <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('totalAmount')}>
                                                <div className="flex items-center">
                                                    Amount
                                                    {sortConfig.key === 'totalAmount' && (
                                                        sortConfig.direction === 'asc' ? 
                                                        <ChevronUp className="ml-1 h-4 w-4" /> : 
                                                        <ChevronDown className="ml-1 h-4 w-4" />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredOrders.length > 0 ? (
                                            filteredOrders.map((order) => (
                                                <React.Fragment key={order._id}>
                                                    <tr className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            {order.orderNumber}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {moment(order.createdAt).format('DD MMM YYYY, h:mm A')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            <div>
                                                                <div className="font-medium text-gray-900">{order.user?.name || 'Guest'}</div>
                                                                <div className="text-gray-500">{order.shippingAddress.phone}</div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                            ₹{order.totalAmount.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getPaymentStatusBadge(order.paymentStatus)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {getStatusBadge(order.orderStatus)}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => toggleOrderExpand(order._id)}
                                                                className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                            >
                                                                {expandedOrder === order._id ? 'Hide' : 'View'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedOrder === order._id && (
                                                        <tr>
                                                            <td colSpan="7" className="px-6 py-4 bg-gray-50">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div>
                                                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Order Details</h3>
                                                                        <div className="bg-gray-100 rounded-lg p-4">
                                                                            {order.items.map((item, index) => (
                                                                                <div key={index} className="mb-4 pb-4 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0">
                                                                                    <div className="flex justify-between">
                                                                                        <div>
                                                                                            <p className="font-medium">{item.name}</p>
                                                                                            <p className="text-sm text-gray-600">Wattage: {item.wattage}</p>
                                                                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                                                                        </div>
                                                                                        <p className="font-medium">₹{item.price.toLocaleString()}</p>
                                                                                    </div>
                                                                                    {item.colorTemperature && (
                                                                                        <p className="text-sm text-gray-600 mt-1">Color Temp: {item.colorTemperature}</p>
                                                                                    )}
                                                                                    {item.bodyColor && (
                                                                                        <p className="text-sm text-gray-600">Body Color: {item.bodyColor}</p>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                                                <div className="flex justify-between py-1">
                                                                                    <span>Subtotal:</span>
                                                                                    <span>₹{order.subtotal.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="flex justify-between py-1">
                                                                                    <span>Shipping:</span>
                                                                                    <span>₹{order.shippingFee.toLocaleString()}</span>
                                                                                </div>
                                                                                <div className="flex justify-between py-1 font-medium">
                                                                                    <span>Total:</span>
                                                                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Shipping Information</h3>
                                                                        <div className="bg-gray-100 rounded-lg p-4">
                                                                            <p className="font-medium">{order.user?.name || 'Guest'}</p>
                                                                            <p className="text-gray-600">{order.shippingAddress.street}</p>
                                                                            <p className="text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                                                                            <p className="text-gray-600">Phone: {order.shippingAddress.phone}</p>
                                                                            {order.shippingAddress.deliveryInstructions && (
                                                                                <div className="mt-2">
                                                                                    <p className="text-sm font-medium text-gray-900">Delivery Instructions:</p>
                                                                                    <p className="text-sm text-gray-600">{order.shippingAddress.deliveryInstructions}</p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="mt-4">
                                                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Update Status</h3>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                <button
                                                                                    onClick={() => updateOrderStatus(order._id, 'processing')}
                                                                                    className={`px-3 py-1 text-xs rounded-md ${order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                                                >
                                                                                    Processing
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => updateOrderStatus(order._id, 'shipped')}
                                                                                    className={`px-3 py-1 text-xs rounded-md ${order.orderStatus === 'shipped' ? 'bg-purple-100 text-purple-800 border border-purple-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                                                >
                                                                                    Shipped
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => updateOrderStatus(order._id, 'delivered')}
                                                                                    className={`px-3 py-1 text-xs rounded-md ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                                                >
                                                                                    Delivered
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                                                                    className={`px-3 py-1 text-xs rounded-md ${order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                                                                >
                                                                                    Cancel
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                    No orders found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Orders;