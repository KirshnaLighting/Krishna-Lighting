import React from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  X,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';

const AdminSidebar = ({ setSidebarOpen, sidebarOpen }) => {
  const navigate = useNavigate();
  const verify = localStorage.getItem("Admin")
  if (verify != "admin@krishna.com") {
    return navigate("/login")
  }

  const navigation = [
    { name: 'Dashboard', icon: Home, link: '/admin/dashboard' },
    { name: 'Products', icon: Package, link: '/admin/products' },
    { name: 'Orders', icon: ShoppingCart, link: '/admin/orders' },
    { name: 'Customers', icon: Users, link: '/admin/customers' },
  ];

  const handleLogout = () => {
    // Perform logout actions here
    localStorage.removeItem('token'); // Remove authentication token
    localStorage.removeItem('Admin'); // Remove user data
    navigate('/admin/login'); // Redirect to login page
    // Close sidebar on mobile after logout
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out bg-gray-900 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo and close button */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img
                  src={logo}
                  alt="Krishna Lighting Logo"
                  className="h-10 w-auto"
                />
              </div>
            </div>
            <button
              className="lg:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto mt-4 px-2">
            <ul className="space-y-1">
              {navigation.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <li key={idx}>
                    <button
                      onClick={() => {
                        navigate(item.link);
                        // Close sidebar on mobile after navigation
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors 
                        text-gray-300 hover:bg-gray-800 hover:text-white
                        ${window.location.pathname === item.link ? 'bg-gray-800 text-white' : ''}
                      `}
                    >
                      <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Bottom section with user info and logout */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-white">Admin</p>
                  <p className="text-xs text-gray-400">Krishna Lighting</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;