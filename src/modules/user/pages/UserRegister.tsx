import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../../../store/actions/user/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

import styles from '../../../schemas/css/UserRegister.module.css';

const UserRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', city: '', state: '', pincode: ''
  });

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.auth;

  const userAuth = useSelector((state: RootState) => state.userAuth);
  const { loading, error, isAuthenticated } = userAuth;

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles['register-box']}>
        
        {/* Brand Logo Placeholder */}
        <div className={styles['brand-logo']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
        </div>

        <h1 className={styles.title}>{text.registerTitle}</h1>
        <p className={styles.subtitle}>Create your account to get started.</p>
        
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
            <label htmlFor="name" className={styles.label}>{text.nameLabel}</label>
            <input 
              id="name"
              type="text" 
              name="name"
              className={styles.input}
              value={formData.name} 
              onChange={handleChange} 
              placeholder="John Doe"
              required 
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="email" className={styles.label}>{text.emailLabel}</label>
            <input 
              id="email"
              type="email" 
              name="email"
              className={styles.input}
              value={formData.email} 
              onChange={handleChange} 
              placeholder="name@example.com"
              required 
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="password" className={styles.label}>{text.passwordLabel}</label>
            <input 
              id="password"
              type="password" 
              name="password"
              className={styles.input}
              value={formData.password} 
              onChange={handleChange} 
              placeholder="••••••••"
              required 
            />
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="mobile" className={styles.label}>{text.mobileLabel}</label>
            <input 
              id="mobile"
              type="tel" 
              name="mobile"
              className={styles.input}
              value={formData.mobile} 
              onChange={handleChange} 
              placeholder="+1 (555) 000-0000"
              required 
            />
          </div>

          <div className={styles['form-grid']}>
            <div className={styles['form-group']}>
              <label htmlFor="city" className={styles.label}>{text.cityLabel}</label>
              <input 
                id="city"
                type="text" 
                name="city"
                className={styles.input}
                value={formData.city} 
                onChange={handleChange} 
                placeholder="New York"
                required 
              />
            </div>
            <div className={styles['form-group']}>
              <label htmlFor="state" className={styles.label}>{text.stateLabel}</label>
              <input 
                id="state"
                type="text" 
                name="state"
                className={styles.input}
                value={formData.state} 
                onChange={handleChange} 
                placeholder="NY"
                required 
              />
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="pincode" className={styles.label}>{text.pincodeLabel}</label>
            <input 
              id="pincode"
              type="text" 
              name="pincode"
              className={styles.input}
              value={formData.pincode} 
              onChange={handleChange} 
              placeholder="10001"
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
                Creating Account...
              </>
            ) : (
              text.registerBtn
            )}
          </button>
        </form>

        <div className={styles.divider}>Already a member?</div>
        
        <div className={styles['footer-text']}>
          {text.hasAccount} 
          <Link to="/login" className={styles['footer-link']}>
            {text.loginBtn}
          </Link>
        </div>

      </div>
    </main>
  );
};

export default UserRegister;