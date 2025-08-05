import React, { useState, useEffect } from 'react';
import { 
  Menu, Search, X, ChevronDown, ChevronUp, 
  Mail, Phone, MapPin, User, Edit, Trash2, 
  Loader2, AlertCircle 
} from 'lucide-react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { toast } from 'react-hot-toast';

const Customers = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [expandedCustomer, setExpandedCustomer] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('http://localhost:5000/api/auth/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setCustomers(data.users);
        } catch (err) {
            console.error('Error fetching customers:', err);
            setError('Failed to load customers. Please try again later.');
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedCustomers = [...customers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    const filteredCustomers = sortedCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
    );

    const toggleCustomerDetails = (id) => {
        setExpandedCustomer(expandedCustomer === id ? null : id);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const handleDelete = async (customerId) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            try {
                setIsDeleting(true);
                const response = await fetch(`/api/admin/customers/${customerId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete customer');
                }

                setCustomers(customers.filter(customer => customer._id !== customerId));
                toast.success('Customer deleted successfully');
            } catch (error) {
                console.error('Error deleting customer:', error);
                toast.error('Failed to delete customer');
            } finally {
                setIsDeleting(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} />

            {/* Main content */}
            <div className="flex flex-col w-full">
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
                                Customers
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

                {/* Dashboard content */}
                <main className="flex-1 p-4 sm:p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
                            <AlertCircle className="h-5 w-5 mr-2" />
                            {error}
                        </div>
                    )}

                    {/* Search and filter bar */}
                    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Customers table */}
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                        {loading ? (
                            <div className="p-8 flex flex-col items-center justify-center">
                                <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                                <p className="mt-2 text-gray-600">Loading customers...</p>
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                {searchTerm ? 'No customers match your search' : 'No customers found'}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('name')}
                                            >
                                                <div className="flex items-center">
                                                    Customer
                                                    {sortConfig.key === 'name' && (
                                                        sortConfig.direction === 'asc' ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        )
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Contact
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                                onClick={() => handleSort('createdAt')}
                                            >
                                                <div className="flex items-center">
                                                    Joined
                                                    {sortConfig.key === 'createdAt' && (
                                                        sortConfig.direction === 'asc' ? (
                                                            <ChevronUp className="ml-1 h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="ml-1 h-4 w-4" />
                                                        )
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                                Cart Activity
                                            </th>
                                            <th scope="col" className="relative px-6 py-3">
                                                <span className="sr-only">Actions</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredCustomers.map((customer) => (
                                            <React.Fragment key={customer._id}>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                                                <User className="h-5 w-5 text-amber-600" />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {customer.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {customer.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            <div className="flex items-center">
                                                                <Phone className="h-4 w-4 mr-1 text-gray-500" />
                                                                {customer.phone || 'N/A'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {formatDate(customer.createdAt)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {customer.cart?.totalItems || 0} items 
                                                            (₹{customer.cart?.totalPrice || 0})
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => toggleCustomerDetails(customer._id)}
                                                            className="text-amber-600 hover:text-amber-900 mr-4"
                                                        >
                                                            {expandedCustomer === customer._id ? (
                                                                <ChevronUp className="h-5 w-5" />
                                                            ) : (
                                                                <ChevronDown className="h-5 w-5" />
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedCustomer === customer._id && (
                                                    <tr>
                                                        <td colSpan="5" className="px-6 py-4 bg-gray-50">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div>
                                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                                                        Shipping Address
                                                                    </h3>
                                                                    <div className="text-sm text-gray-900 space-y-1">
                                                                        {customer.address ? (
                                                                            <div className="flex items-start">
                                                                                <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
                                                                                <div>
                                                                                    <p>{customer.address.street}</p>
                                                                                    <p>{customer.address.city}, {customer.address.state}</p>
                                                                                    <p>India - {customer.address.zipCode}</p>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <p className="text-gray-400">No address provided</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                                                                        Contact Information
                                                                    </h3>
                                                                    <div className="text-sm text-gray-900 space-y-2">
                                                                        <div className="flex items-center">
                                                                            <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                                                            {customer.email}
                                                                        </div>
                                                                        <div className="flex items-center">
                                                                            <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                                                            {customer.phone || 'N/A'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Customers;