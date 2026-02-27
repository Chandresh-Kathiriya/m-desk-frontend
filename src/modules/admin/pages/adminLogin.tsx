import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../../../store/actions/admin/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

import styles from '../../../schemas/css/AdminLogin.module.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.auth;
  const adminText = textSchema.en.adminAuth;

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { loading, error, isAuthenticated } = adminAuth;

  useEffect(() => {
    // Redirect to a specific admin dashboard upon successful login
    if (isAuthenticated) navigate('/admin/dashboard');
  }, [isAuthenticated, navigate]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginAdmin(email, password));
  };

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles['login-box']}>
        
        {/* Admin Shield Logo - Visual cue for backend access */}
        <div className={styles['admin-logo']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
        </div>

        <h1 className={styles.title}>{adminText.loginTitle}</h1>
        <p className={styles.subtitle}>Secure portal access for administrators.</p>
        
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
            <label htmlFor="admin-email" className={styles.label}>{text.emailLabel}</label>
            <input 
              id="admin-email"
              type="email" 
              className={styles.input}
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="admin@example.com"
              required 
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="admin-password" className={styles.label}>{text.passwordLabel}</label>
            <input 
              id="admin-password"
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
                Authenticating...
              </>
            ) : (
              text.loginBtn
            )}
          </button>
        </form>

        <div className={styles.divider}>System Access</div>
        
        <div className={styles['footer-text']}>
          {text.noAccount} 
          <Link to="/admin/register" className={styles['footer-link']}>
            {text.registerBtn}
          </Link>
        </div>

      </div>
    </main>
  );
};

export default AdminLogin;