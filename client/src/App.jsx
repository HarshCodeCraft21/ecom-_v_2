import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext.jsx';
import { ProductProvider } from './context/ProductContext.jsx';
import { CategoryProvider } from './context/CategoryContext.jsx';
import { CartProvider } from './context/CartContext.jsx';

// Component Layouts
import { Layout } from './components/Layout.jsx';
import { AdminLayout } from './components/AdminLayout.jsx';

// Route guards
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { AdminRoute } from './components/AdminRoute.jsx';

// Pages
import { Home } from './pages/Home.jsx';
import { Shop } from './pages/Shop.jsx';
import { ProductDetails } from './pages/ProductDetails.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { Cart } from './pages/Cart.jsx';
import { NotFound } from './pages/NotFound.jsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.jsx';
import { AdminProducts } from './pages/admin/AdminProducts.jsx';
import { AdminCategories } from './pages/admin/AdminCategories.jsx';
import { AdminCoupons } from './pages/admin/AdminCoupons.jsx';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <CategoryProvider>
            <CartProvider>
              
              {/* Global Toast Alert Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  className: 'font-sans text-xs font-bold tracking-wider',
                  style: {
                    borderRadius: '16px',
                    background: '#1A253C',
                    color: '#FFFFFF',
                  },
                }}
              />

              <Routes>
                
                {/* Public Storefront Layout */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="product/:id" element={<ProductDetails />} />
                  <Route path="login" element={<Login />} />
                  <Route path="register" element={<Register />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Secure Admin Control Layout */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }
                >
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="coupons" element={<AdminCoupons />} />
                </Route>

              </Routes>

            </CartProvider>
          </CategoryProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
