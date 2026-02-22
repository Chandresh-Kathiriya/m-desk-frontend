import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to MDesk</h1>
          <p className="text-gray-600 mb-8">Store, Orders & Bills</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">MDesk</h1>
            <p className="text-gray-600">Store, Orders & Bills</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600 capitalize">{user.role}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user.name}!</h2>
          <p className="text-gray-600 mb-4">
            You are logged in as a {user.role === 'internal' ? 'Backend' : 'Portal'} user.
          </p>
          <p className="text-gray-600">
            More features coming soon. This is the foundation of the MDesk e-commerce system.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
