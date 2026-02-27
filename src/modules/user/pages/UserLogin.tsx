import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../../../store/actions/user/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

import styles from '../../../schemas/css/UserLogin.module.css';

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.auth; 

  const userAuth = useSelector((state: RootState) => state.userAuth);
  const { loading, error, isAuthenticated } = userAuth;

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles['login-box']}>
        
        {/* Brand Logo Placeholder - Adds a premium anchor point */}
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
            <label htmlFor="email" className={styles.label}>{text.emailLabel}</label>
            <input 
              id="email"
              type="email" 
              className={styles.input}
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@example.com"
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