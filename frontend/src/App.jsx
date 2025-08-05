import React from 'react'
import Homepage from "./Pages/Homepage"
import { Route, Routes } from 'react-router-dom'
import AboutUs from './Pages/About'
import ProductsPage from './Pages/Products'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminProducts from './Pages/Admin/AdminProduct'
import ProductDetails from './Pages/ViewProduct'
import AddToCart from './Pages/AddToCart'
import Login from './Pages/Login'
import SignupPage from './Pages/Signup'
import ForgotPassword from './Pages/ForgotPassword'
import ResetPassword from './Pages/ResetPassword'
import ProfilePage from './Pages/ProfilePage'
import Checkout from './Pages/Checkout'
import OrderConfirmation from './Pages/OrderConfirmation'
import Orders from './Pages/Admin/Orders'
import Customers from './Pages/Admin/Customers'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/add-to-cart" element={<AddToCart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/orders" element={<Orders />} />
      <Route path="/admin/customers" element={<Customers />} />
    </Routes>
  )
}

export default App
