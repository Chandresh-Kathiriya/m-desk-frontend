import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Common Imports
import Layout from './common/components/Layout.tsx';
import HomePage from './modules/storefront/pages/HomePage.tsx';

import ProductDetailsPage from './modules/storefront/pages/ProductDetailsPage.tsx';

// User Imports
import UserLogin from './modules/user/pages/UserLogin.tsx';
import UserRegister from './modules/user/pages/UserRegister.tsx';
import CartPage from './modules/user/pages/CartPage.tsx';
import OrderHistoryPage from './modules/user/pages/OrderHistoryPage.tsx';
import CheckoutPage from './modules/user/pages/CheckoutPage.tsx';
import OrderSuccessPage from './modules/user/pages/OrderSuccessPage.tsx';
import OrderDetailsPage from './modules/user/pages/OrderDetailsPage.tsx';
import MyInvoicesPage from './modules/user/pages/MyInvoicesPage.tsx';
import InvoiceDetailsPage from './modules/user/pages/InvoiceDetailsPage.tsx';

// Admin Imports
import AdminLogin from './modules/admin/pages/AdminLogin.tsx';
import AdminRegister from './modules/admin/pages/AdminRegister.tsx';
import AdminDashboardPage from './modules/admin/pages/AdminDashboardPage.tsx';
import ProductList from './modules/admin/pages/ProductList.tsx';
import ProductForm from './modules/admin/pages/ProductForm.tsx';
import MasterDataManagement from './modules/admin/pages/MasterDataManagement.tsx';
import InventoryManagement from './modules/admin/pages/InventoryManagement.tsx';
import OrdersPage from './modules/admin/pages/AdminOrdersPage.tsx';
import AdminOrderDetailsPage from './modules/admin/pages/AdminOrderDetailsPage.tsx';
import AdminCouponsPage from './modules/admin/pages/AdminCouponsPage.tsx';
import AdminSettingsPage from './modules/admin/pages/AdminSettingsPage.tsx';
import AdminInvoicesPage from './modules/admin/pages/AdminInvoicesPage.tsx';
import AdminInvoiceDetailsPage from './modules/admin/pages/AdminInvoiceDetailsPage';
import AdminCreatePurchaseOrderPage from './modules/admin/pages/AdminCreatePurchaseOrderPage.tsx';
import AdminPurchaseOrderDetailsPage from './modules/admin/pages/AdminPurchaseOrderDetailsPage.tsx';
import AdminContactsPage from './modules/admin/pages/AdminContactsPage.tsx';
import AdminPurchaseOrdersPage from './modules/admin/pages/AdminPurchaseOrdersPage.tsx';

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
          <Route path="/invoices" element={<MyInvoicesPage />} />
          <Route path="/invoice/:id" element={<InvoiceDetailsPage />} />

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
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
          <Route path="/admin/invoice/:id" element={<AdminInvoiceDetailsPage />} />
          <Route path="/admin/purchase/create" element={<AdminCreatePurchaseOrderPage />} />
          <Route path="/admin/purchase/:id" element={<AdminPurchaseOrderDetailsPage />} />
          <Route path="/admin/contacts" element={<AdminContactsPage />} />
          <Route path="/admin/purchases" element={<AdminPurchaseOrdersPage />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;