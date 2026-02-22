import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-default)' }}>
      <Header />
      
      {/* The 'children' will be your page content (Login, Register, Dashboard, etc.) */}
      <main className="py-3" style={{ flex: 1 }}>
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;