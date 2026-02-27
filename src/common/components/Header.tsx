import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import { logoutUser } from '../../store/actions/user/authActions';
import { logoutAdmin } from '../../store/actions/admin/authActions';
import { textSchema } from '../../schemas/text/schema';

// Import as a CSS Module
import styles from '../../schemas/css/Header.module.css';

const Header: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const text = textSchema.en.common;

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const userAuth = useSelector((state: RootState) => state.userAuth);
  const { isAuthenticated: isUserAuth, userInfo } = userAuth;

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { isAuthenticated: isAdminAuth, adminInfo } = adminAuth;

  // Close mobile menu automatically on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleUserLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleAdminLogout = () => {
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className={styles.header}>
      <div className={styles['header__container']}>

        {/* Premium Gradient Brand Logo */}
        <Link to="/" className={styles['header__brand']}>
          <div className={styles['header__brand-icon']}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span className={styles['header__brand-text']}>{text.brandName}</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className={styles['header__mobile-toggle']}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Navigation Links */}
        <nav className={`${styles['header__nav']} ${isMobileMenuOpen ? styles['header__nav--open'] : ''}`}>
          <ul className={styles['header__nav-list']}>

            {/* --- ADMIN NAVIGATION (Flat Structure) --- */}
            {isAdminAuth ? (
              <>
                <li className={styles['header__nav-item']}>
                  <Link to="/admin/dashboard" className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    {text.dashboard}
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/admin/products" className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    {text.products}
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/admin/inventory" className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 17 22 12"></polyline>
                    </svg>
                    {text.inventory}
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/admin/master-data" className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                    {text.masterData}
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/admin/orders" className={styles['header__nav-link']}>
                    <svg
                      className={styles['header__nav-icon']}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <path d="M3.29 7 12 12l8.71-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
                    {text.orders}
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/admin/coupons" className={styles['header__nav-link']}>
                    <svg
                      className={styles['header__nav-icon']}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 12l-8 8-8-8 8-8 8 8z"></path>
                      <circle cx="12" cy="12" r="2"></circle>
                    </svg>
                    {text.coupons}
                  </Link>
                </li>

                {/* Profile Controls */}
                <li className={`${styles['header__nav-item']} ${styles['header__user-profile']}`}>
                  <div className={styles['header__profile-info']}>
                    <span className={styles['header__badge']}>Admin</span>
                    <span className={styles['header__greeting']}>{adminInfo?.user?.name}</span>
                  </div>
                  <button className={`${styles.btn} ${styles['btn--secondary']} ${styles['btn--sm']}`} onClick={handleAdminLogout}>
                    {text.logout}
                  </button>
                </li>
              </>
            ) : isUserAuth ? (
              /* --- USER NAVIGATION --- */
              <>
                <li className={styles['header__nav-item']}>
                  <Link to="/" className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    {text.home}
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/cart" className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {text.cart}
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/orders" className={styles['header__nav-link']}>
                    <svg
                      className={styles['header__nav-icon']}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <path d="M3.29 7 12 12l8.71-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
                    {text.orders}
                  </Link>
                </li>

                <li className={`${styles['header__nav-item']} ${styles['header__user-profile']}`}>
                  <div className={styles['header__profile-info']}>
                    <span className={styles['header__greeting']}>Hello, {userInfo?.user?.name}</span>
                  </div>
                  <button className={`${styles.btn} ${styles['btn--secondary']} ${styles['btn--sm']}`} onClick={handleUserLogout}>
                    {text.logout}
                  </button>
                </li>
              </>
            ) : (
              /* --- PUBLIC NAVIGATION --- */
              <>
                <li className={styles['header__nav-item']}>
                  <Link to="/login" className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    User Login
                  </Link>
                </li>
                <li className={styles['header__nav-item']}>
                  <Link to="/admin/login" className={`${styles.btn} ${styles['btn--primary']} ${styles['btn--sm']} ${styles['header__btn-override']}`}>Admin Access</Link>
                </li>
              </>
            )}

          </ul>
        </nav>

        {/* Mobile Overlay */}
        <div
          className={`${styles['header__overlay']} ${isMobileMenuOpen ? styles['header__overlay--visible'] : ''}`}
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>

      </div>
    </header>
  );
};

export default Header;