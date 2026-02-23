import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Common Imports
import Layout from './common/components/Layout';

// User Imports
import UserLogin from './modules/user/pages/UserLogin';
import UserRegister from './modules/user/pages/UserRegister';

// Admin Imports
import AdminLogin from './modules/admin/pages/adminLogin';
import AdminRegister from './modules/admin/pages/adminRegister';

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
          
          {/* Future Admin Routes */}
          {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
          {/* <Route path="/admin/register" element={<AdminRegister />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;