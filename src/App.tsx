import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Common Imports
import Layout from './common/components/Layout';
import HomePage from './modules/storefront/pages/HomePage';

import ProductDetailsPage from './modules/storefront/pages/ProductDetailsPage';

// User Imports
import UserLogin from './modules/user/pages/UserLogin';
import UserRegister from './modules/user/pages/UserRegister';

// Admin Imports
import AdminLogin from './modules/admin/pages/adminLogin';
import AdminRegister from './modules/admin/pages/adminRegister';
import CategoryList from './modules/admin/pages/CategoryList';
import ProductList from './modules/admin/pages/ProductList';
import ProductForm from './modules/admin/pages/ProductForm';
import CategoryForm from './modules/admin/pages/CategoryForm';
import MasterDataManagement from './modules/admin/pages/MasterDataManagement';
import InventoryManagement from './modules/admin/pages/InventoryManagement';

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

          <Route path="/product/:id" element={<ProductDetailsPage />} />

          {/* admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />
          <Route path="/admin/categories/new" element={<CategoryForm />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/categories" element={<CategoryList />} />
          <Route path="/admin/categories/:id/edit" element={<CategoryForm />} />
          <Route path="/admin/master-data" element={<MasterDataManagement />} />
          <Route path="/admin/inventory" element={<InventoryManagement />} />
          
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;