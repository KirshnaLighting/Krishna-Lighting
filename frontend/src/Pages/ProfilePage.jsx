import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../Context/UserContext';
import { toast } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Truck, Check, Clock, X, ChevronRight } from 'lucide-react';

const ProfilePage = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
        }
    });
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch profile');
                }

                const data = await response.json();
                setFormData({
                    name: data.user.name || '',
                    email: data.user.email || '',
                    phone: data.user.phone || '',
                    address: data.user.address || {
                        street: '',
                        city: '',
                        state: '',
                        zipCode: ''
                    }
                });

            } catch (err) {
                toast.error(err.message || 'Failed to load profile');
                if (user) {
                    setFormData({
                        name: user.name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        address: user.address || {
                            street: '',
                            city: '',
                            state: '',
                            zipCode: ''
                        }
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        const fetchOrders = async () => {
            try {
                setOrdersLoading(true);
                const response = await fetch('http://localhost:5000/api/orders/myorders', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                setOrders(data.orders || []);
            } catch (err) {
                toast.error(err.message || 'Failed to load orders');
            } finally {
                setOrdersLoading(false);
            }
        };

        if (user) {
            fetchProfile();
            fetchOrders();
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Name is required');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('Email is required');
            return;
        }
        if (!formData.phone.trim()) {
            toast.error('Phone number is required');
            return;
        }
        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }
        if (!formData.address.street.trim()) {
            toast.error('Street address is required');
            return;
        }
        if (!formData.address.city.trim()) {
            toast.error('City is required');
            return;
        }
        if (!formData.address.state.trim()) {
            toast.error('State is required');
            return;
        }
        if (!formData.address.zipCode.trim()) {
            toast.error('ZIP code is required');
            return;
        }
        if (!/^\d{5,6}$/.test(formData.address.zipCode)) {
            toast.error('Please enter a valid ZIP code (5 or 6 digits)');
            return;
        }

        try {
            setUpdating(true);
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('krishnaLightingToken')}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            setUser(prev => ({
                ...prev,
                name: data.user.name,
                email: data.user.email,
                phone: data.user.phone,
                address: data.user.address
            }));

            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'processing':
                return <Clock className="h-5 w-5 text-amber-500" />;
            case 'shipped':
                return <Truck className="h-5 w-5 text-blue-500" />;
            case 'delivered':
                return <Check className="h-5 w-5 text-green-500" />;
            case 'cancelled':
                return <X className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'processing':
                return 'bg-amber-100 text-amber-800';
            case 'shipped':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (!user) {
        return navigate("/login");
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

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-grow py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`${activeTab === 'profile' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`${activeTab === 'orders' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                My Orders
                            </button>
                        </nav>
                    </div>

                    {activeTab === 'profile' ? (
                        <div className="bg-white shadow rounded-lg p-6 md:p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            pattern="[0-9]{10}"
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                                                    Street Address
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.street"
                                                    name="address.street"
                                                    value={formData.address.street}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                                                    City
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.city"
                                                    name="address.city"
                                                    value={formData.address.city}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                                                    State
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.state"
                                                    name="address.state"
                                                    value={formData.address.state}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="address.zipCode" className="block text-sm font-medium text-gray-700">
                                                    ZIP Code
                                                </label>
                                                <input
                                                    type="text"
                                                    id="address.zipCode"
                                                    name="address.zipCode"
                                                    value={formData.address.zipCode}
                                                    onChange={handleChange}
                                                    required
                                                    pattern="\d{5,6}"
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {updating ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Updating...
                                            </>
                                        ) : 'Update Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="px-6 py-5 border-b border-gray-200">
                                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                            </div>

                            {ordersLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-16">
                                    <p className="text-gray-600 mb-8">You haven't placed any orders yet</p>
                                    <button
                                        onClick={() => navigate('/products')}
                                        className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                                    >
                                        Browse Products
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <div key={order._id} className="p-6 hover:bg-gray-50">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        Order #{order.orderNumber}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                                        {getStatusIcon(order.orderStatus)}
                                                        <span className="ml-1 capitalize">{order.orderStatus}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Total Amount</h4>
                                                    <p className="text-lg font-medium text-gray-900">
                                                        ₹{order.totalAmount.toLocaleString('en-IN')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                                                    <p className="text-sm text-gray-900 capitalize">
                                                        {order.paymentMethod}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-500">Items</h4>
                                                    <p className="text-sm text-gray-900">
                                                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => navigate(`/order-confirmation/${order._id}`)}
                                                    className="inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-500"
                                                >
                                                    View Order Details <ChevronRight className="ml-1 h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default ProfilePage;