import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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

  const getActiveClass = ({ isActive }: { isActive: boolean }) =>
    `${styles['header__nav-link']} ${isActive ? styles['header__nav-link--active'] : ''}`;

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

        {/* --- BRAND LOGO --- */}
        <Link to="/" className={styles['header__brand']} style={{ textDecoration: 'none' }}>
          <div className={styles['header__brand-icon']} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Swapped inline styles for the responsive CSS class */}
            <img
              src="/logo_big.png"
              alt="MDesk Logo"
              className={styles['header__brand-img']}
            />
          </div>
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

            {isAdminAuth ? (
              <>
                <li className={styles['header__nav-item']}>
                  <NavLink to="/admin/dashboard" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    {text.dashboard || 'Dashboard'}
                  </NavLink>
                </li>

                <li className={`${styles['header__nav-item']} ${styles['header__dropdown-wrapper']}`}>
                  <div className={styles['header__nav-link']}>
                    <svg
                      className={styles['header__nav-icon']}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="6" rx="2"></rect>
                      <rect x="3" y="14" width="18" height="6" rx="2"></rect>
                    </svg>
                    {text.products || 'Products'}
                    <svg className={styles['header__chevron']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ marginLeft: '-5px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <ul className={styles['header__dropdown-menu']}>
                    <li><NavLink to="/admin/products" className={getActiveClass}>{text.products || 'All Products'}</NavLink></li>
                    <li><NavLink to="/admin/inventory" className={getActiveClass}>{text.inventory || 'Inventory'}</NavLink></li>
                    <li><NavLink to="/admin/master-data" className={getActiveClass}>{text.masterData || 'Master Data'}</NavLink></li>
                  </ul>
                </li>

                <li className={`${styles['header__nav-item']} ${styles['header__dropdown-wrapper']}`}>
                  <div className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <path d="M3.29 7 12 12l8.71-5"></path><path d="M12 22V12"></path>
                    </svg>
                    {text.orders || 'Orders'}
                    <svg className={styles['header__chevron']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ marginLeft: '-5px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <ul className={styles['header__dropdown-menu']}>
                    <li className={styles['header__nav-item']}>
                      <NavLink to="/admin/orders" className={getActiveClass}>
                        {text.orders || 'Orders'}
                      </NavLink>
                    </li>
                    <li className={styles['header__nav-item']}>
                      <NavLink to="/admin/invoices" className={getActiveClass}>
                        {text.invoices || 'Invoices'}
                      </NavLink>
                    </li>
                  </ul>
                </li>

                <li className={`${styles['header__nav-item']} ${styles['header__dropdown-wrapper']}`}>
                  <div className={styles['header__nav-link']}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {text.purchases || 'Purchases'}
                    <svg className={styles['header__chevron']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ marginLeft: '-5px' }}>
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                  <ul className={styles['header__dropdown-menu']}>
                    <li className={styles['header__nav-item']}>
                      <NavLink to="/admin/purchases" className={getActiveClass}>
                        {text.purchases || 'Purchases'}
                      </NavLink>
                    </li>

                    <li className={styles['header__nav-item']}>
                      <NavLink to="/admin/bills" className={getActiveClass}>
                        {text.bills || 'Bills'}
                      </NavLink>
                    </li>
                  </ul>
                </li>

                <li className={styles['header__nav-item']}>
                  <NavLink to="/admin/contacts" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    {text.contacts || 'Contacts'}
                  </NavLink>
                </li>

                <li className={styles['header__nav-item']}>
                  <NavLink to="/admin/coupons" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 12l-8 8-8-8 8-8 8 8z"></path><circle cx="12" cy="12" r="2"></circle>
                    </svg>
                    {text.coupons || 'Coupons'}
                  </NavLink>
                </li>

                <li className={styles['header__nav-item']}>
                  <NavLink to="/admin/reports" className={getActiveClass}>
                    <svg
                      className={styles['header__nav-icon']}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="20" x2="12" y2="10"></line>
                      <line x1="18" y1="20" x2="18" y2="4"></line>
                      <line x1="6" y1="20" x2="6" y2="16"></line>
                    </svg>
                    {text.reports || 'Reports'}
                  </NavLink>
                </li>

                <li className={styles['header__nav-item']}>
                  <NavLink to="/admin/profile" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {text.profile || 'Profile'}
                  </NavLink>
                </li>

                <li className={styles['header__nav-item']}>
                  <NavLink to="/admin/settings" className={getActiveClass}>
                    <svg
                      className={styles['header__nav-icon']}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06 a2 2 0 1 1-2.83 2.83l-.06-.06 a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.82V22 a2 2 0 1 1-4 0v-.18 a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06 a2 2 0 1 1-2.83-2.83l.06-.06 a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.82-.33H2 a2 2 0 1 1 0-4h.18 a1.65 1.65 0 0 0 1.82-.33 1.65 1.65 0 0 0 .6-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06 a2 2 0 1 1 2.83-2.83l.06.06 a1.65 1.65 0 0 0 1.82.33h0 a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.82V2 a2 2 0 1 1 4 0v.18 a1.65 1.65 0 0 0 .33 1.82 1.65 1.65 0 0 0 1 .6h0 a1.65 1.65 0 0 0 1.82-.33l.06-.06 a2 2 0 1 1 2.83 2.83l-.06.06 a1.65 1.65 0 0 0-.33 1.82v0 c0 .39.14.77.33 1.1 .2.33.5.57.87.7H22 a2 2 0 1 1 0 4h-.18 c-.37.13-.67.37-.87.7 -.19.33-.33.71-.33 1.1z">
                      </path>
                    </svg>
                    {text.settings || 'Settings'}
                  </NavLink>
                </li>

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
              <>
                <li className={styles['header__nav-item']}>
                  <NavLink to="/" end className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    {text.home}
                  </NavLink>
                </li>
                <li className={styles['header__nav-item']}>
                  <NavLink to="/cart" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    {text.cart}
                  </NavLink>
                </li>
                <li className={styles['header__nav-item']}>
                  <NavLink to="/orders" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <path d="M3.29 7 12 12l8.71-5"></path><path d="M12 22V12"></path>
                    </svg>
                    {text.orders}
                  </NavLink>
                </li>
                <li className={styles['header__nav-item']}>
                  <NavLink to="/invoices" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"></path>
                      <path d="M14 2v6h6"></path><path d="M8 13h8"></path><path d="M8 17h8"></path><path d="M8 9h4"></path>
                    </svg>
                    {text.invoices}
                  </NavLink>
                </li>

                <li className={styles['header__nav-item']}>
                  <NavLink to="/profile" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {text.profile || 'Profile'}
                  </NavLink>
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
              <>
                <li className={styles['header__nav-item']}>
                  <NavLink to="/login" className={getActiveClass}>
                    <svg className={styles['header__nav-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                    User Login
                  </NavLink>
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