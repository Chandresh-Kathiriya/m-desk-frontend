import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../../store/actions/user/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';
import { useLocation, useNavigate, Link } from 'react-router-dom';

import styles from '../../../schemas/css/UserLogin.module.css';
import { addToCart } from '../../../store/actions/user/cartActions';

const UserLogin: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  // Redux State for Auth
  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo, loading, error, isAuthenticated } = userAuth as any;

  const alertMessage = location.state?.message; 
  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect') || '/';

  // --- AUTO-ADD TO CART ON SUCCESSFUL LOGIN ---
  useEffect(() => {
      const processLoginSuccess = async () => {
          if (userInfo && userInfo.token) {
              const pendingItemStr = sessionStorage.getItem('pendingCartItem');

              if (pendingItemStr) {
                  try {
                      const { product, variant, qty } = JSON.parse(pendingItemStr);
                      sessionStorage.removeItem('pendingCartItem');
                      await dispatch(addToCart(product, variant, qty));
                  } catch (err) {
                      console.error("Failed to auto-add item after login", err);
                      sessionStorage.removeItem('pendingCartItem');
                  }
              }
              navigate(redirectUrl);
          }
      };

      processLoginSuccess();
  }, [userInfo, navigate, dispatch, redirectUrl, alertMessage]);

  // --- NEW: Using 'loginId' instead of 'email' to support both Email and Mobile ---
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const text = textSchema.en.auth;

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    // Dispatching loginId - backend will figure out if it's an email or mobile
    dispatch(loginUser(loginId, password));
  };

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles['login-box']}>
        {alertMessage && (
          <div style={{
            padding: '1rem',
            marginBottom: '1.5rem',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #f87171',
            borderRadius: '8px',
            fontWeight: '500'
          }}>
            ⚠️ {alertMessage}
          </div>
        )}

        <div className={styles['brand-logo']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>

        <h1 className={styles.title}>{text.loginTitle}</h1>
        <p className={styles.subtitle}>Welcome back! Please enter your details.</p>

        {error && (
          <div className={styles.alert}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submitHandler}>
          <div className={styles['form-group']}>
            <label htmlFor="loginId" className={styles.label}>Email or Mobile Number</label>
            {/* Changed type to "text" so it accepts both formats */}
            <input
              id="loginId"
              type="text"
              className={styles.input}
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder="name@example.com or 9876543210"
              required
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles.label}>{text.passwordLabel}</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className={styles['btn-submit']}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Signing in...
              </>
            ) : (
              text.loginBtn
            )}
          </button>
        </form>

        <div className={styles.divider}>New to our store?</div>

        <div className={styles['footer-text']}>
          {text.noAccount}
          <Link to="/register" className={styles['footer-link']}>
            {text.registerBtn}
          </Link>
        </div>

      </div>
    </main>
  );
};

export default UserLogin;