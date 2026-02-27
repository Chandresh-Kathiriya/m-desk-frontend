import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Common Imports
import Layout from './common/components/Layout';
import HomePage from './modules/storefront/pages/HomePage';

import ProductDetailsPage from './modules/storefront/pages/ProductDetailsPage';

// User Imports
import UserLogin from './modules/user/pages/UserLogin';
import UserRegister from './modules/user/pages/UserRegister';
import CartPage from './modules/user/pages/CartPage';
import OrderHistoryPage from './modules/user/pages/OrderHistoryPage';
import CheckoutPage from './modules/user/pages/CheckoutPage';
import OrderSuccessPage from './modules/user/pages/OrderSuccessPage';
import OrderDetailsPage from './modules/user/pages/OrderDetailsPage';

// Admin Imports
import AdminLogin from './modules/admin/pages/AdminLogin';
import AdminRegister from './modules/admin/pages/AdminRegister';
import AdminDashboardPage from './modules/admin/pages/AdminDashboardPage';
import ProductList from './modules/admin/pages/ProductList';
import ProductForm from './modules/admin/pages/ProductForm';
import MasterDataManagement from './modules/admin/pages/MasterDataManagement';
import InventoryManagement from './modules/admin/pages/InventoryManagement';
import OrdersPage from './modules/admin/pages/AdminOrdersPage';
import AdminOrderDetailsPage from './modules/admin/pages/AdminOrderDetailsPage';
import AdminCouponsPage from './modules/admin/pages/AdminCouponsPage';

function App() {
  return (
    <BrowserRouter>
      {/* We wrap the Routes in the Layout so every page gets the Header and Footer */}
      <Layout>
        <Routes>
          {/* comman routes */}
          <Route path="/" element={<HomePage />} />

          {/* User */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route path="/order/:id" element={<OrderDetailsPage />} />

          <Route path="/product/:id" element={<ProductDetailsPage />} />

          {/* admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/master-data" element={<MasterDataManagement />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          <Route path="/admin/orders" element={<OrdersPage />} />
          <Route path="/admin/order/:id" element={<AdminOrderDetailsPage />} />
          <Route path="/admin/coupons" element={<AdminCouponsPage />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;