import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Common Imports
import Layout from './common/components/Layout';

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

function App() {
  return (
    <BrowserRouter>
      {/* We wrap the Routes in the Layout so every page gets the Header and Footer */}
      <Layout>
        <Routes>
          {/* comman routes */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* User */}
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />

          {/* admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin/products/new" element={<ProductForm />} />
          <Route path="/admin/products/:id/edit" element={<ProductForm />} />
          <Route path="/admin/categories/new" element={<CategoryForm />} />
          <Route path="/admin/products" element={<ProductList />} />
          <Route path="/admin/categories" element={<CategoryList />} />
          <Route path="/admin/categories/:id/edit" element={<CategoryForm />} />
          
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;