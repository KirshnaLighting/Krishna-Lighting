import React from 'react'
import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (

    <footer className="bg-slate-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="text-2xl font-bold mb-4">Krishna Lighting</div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your trusted partner for premium lighting solutions. We bring elegance and functionality
              to every space with our curated collection of modern and traditional lighting fixtures.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><NavLink to="/" className="text-gray-300 hover:text-amber-400 transition-colors">Home</NavLink></li>
              <li><NavLink to="/products" className="text-gray-300 hover:text-amber-400 transition-colors">Products</NavLink></li>
              <li><NavLink to="/about" className="text-gray-300 hover:text-amber-400 transition-colors">About Us</NavLink></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 Krishna Lighting. All rights reserved. | Designed with ❤️ for better lighting solutions.
          </p>
        </div>
      </div>
    </footer>)
}

export default Footer
