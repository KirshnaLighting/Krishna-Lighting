import React, { useContext, useState } from 'react'
import { Menu, X, MapPin, Phone, Mail, Clock, Star, ShoppingCart, Eye } from 'lucide-react';
import { NavLink } from "react-router-dom"
import logo from '../assets/logo.png';
import { AuthContext } from '../Context/UserContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="bg-slate-900 shadow-lg sticky top-0 p-2 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src={logo} alt="Krishna Lighting Logo" className="h-10 w-auto" />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <NavLink to="/" className="text-white hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors">Home</NavLink>
              <NavLink to="/products" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors">Products</NavLink>
              <NavLink to="/about" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors">About</NavLink>
              <NavLink to="/add-to-cart" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium flex items-center gap-1 transition-colors">
                <ShoppingCart size={18} />
                Cart
              </NavLink>

              {user ? (
                <>
                  <NavLink to="/profile" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors">
                    My Profile
                  </NavLink>
                  <button
                    onClick={logout}
                    className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <NavLink to="/login" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-sm font-medium transition-colors">
                  Login
                </NavLink>
              )}</div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-amber-400 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/" className="text-white block px-3 py-2 text-base font-medium">Home</NavLink>
            <NavLink to="/products" className="text-gray-300 hover:text-amber-400 block px-3 py-2 text-base font-medium">Products</NavLink>
            <NavLink to="/about" className="text-gray-300 hover:text-amber-400 block px-3 py-2 text-base font-medium">About</NavLink>
            <NavLink to="/add-to-cart" className="text-gray-300 hover:text-amber-400 px-3 py-2 text-base font-medium flex">Cart</NavLink>
            {user ? (
              <>
                <NavLink to="/profile" className="text-gray-300 hover:text-amber-400 block px-3 py-2 text-base font-medium">My Profile</NavLink>
                <button
                  onClick={logout} className="text-gray-300 hover:text-amber-400 block px-3 py-2 text-base font-medium">Logout</button>
              </>)
              :
              <NavLink to="/login" className="text-gray-300 hover:text-amber-400 block px-3 py-2 text-base font-medium">Login</NavLink>
            }
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
