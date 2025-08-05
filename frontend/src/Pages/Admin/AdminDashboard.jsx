import {
  Package,
  ShoppingCart,
  Menu,
  Eye,
  Star,
  Loader2
} from 'lucide-react';
import AdminSidebar from '../../components/Admin/AdminSidebar';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all data in parallel
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          fetch('http://localhost:5000/api/dashboard-stats'),
          fetch('http://localhost:5000/api/recent-orders'),
          fetch('http://localhost:5000/api/top-products')
        ]);

        if (!statsRes.ok || !ordersRes.ok || !productsRes.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const [statsData, ordersData, productsData] = await Promise.all([
          statsRes.json(),
          ordersRes.json(),
          productsRes.json()
        ]);
        console.log(ordersData)
        setStats(statsData);
        setRecentOrders(ordersData);
        setTopProducts(productsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


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
                Dashboard Overview
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
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600">{stat.name}</p>
                      <p className="text-lg sm:text-xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                      <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'} mt-1`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className="bg-gray-100 p-2 rounded-full">
                      {Icon ? (
                        <Icon className="w-5 h-5 text-gray-600" />
                      ) : (
                        <div className='w-5 h-5 flex justify-center items-center text-gray-600 font-semibold text-xl'>₹</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Orders - Takes full width on mobile, 2/3 on desktop */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="overflow-auto">
                <div className="min-w-[600px] sm:min-w-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm text-gray-900">{order.product}</td>
                          <td className="px-3 py-2 sm:px-4 sm:py-3 whitespace-nowrap text-sm font-medium text-gray-900">{order.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Products - Takes full width on mobile, 1/3 on desktop */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.name} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500">{product.sales} sales</span>
                          <div className="flex items-center ml-2">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-500 ml-1">{product.rating}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">{product.revenue}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;