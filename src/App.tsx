import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './common/components/Layout';
import UserLogin from './modules/user/pages/UserLogin';
import UserRegister from './modules/user/pages/UserRegister';

function App() {
  return (
    <BrowserRouter>
      {/* We wrap the Routes in the Layout so every page gets the Header and Footer */}
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          
          {/* Future Admin Routes */}
          {/* <Route path="/admin/login" element={<AdminLogin />} /> */}
          {/* <Route path="/admin/register" element={<AdminRegister />} /> */}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;