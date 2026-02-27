import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerAdmin } from '../../../store/actions/admin/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

import styles from '../../../schemas/css/AdminRegister.module.css';

const AdminRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', city: '', state: '', pincode: ''
  });

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.auth;
  const adminText = textSchema.en.adminAuth;

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { loading, error, isAuthenticated } = adminAuth;

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerAdmin(formData));
  };

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles['register-box']}>
        
        {/* Admin Shield Logo */}
        <div className={styles['admin-logo']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            <path d="M12 8v4"></path>
            <path d="M12 16h.01"></path>
          </svg>
        </div>

        <h1 className={styles.title}>{adminText.registerTitle}</h1>
        <p className={styles.subtitle}>Create a new administrator account.</p>
        
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
              placeholder="Admin Name"
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
              placeholder="admin@example.com"
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
              placeholder="+91 00000 00000"
              required 
            />
          </div>

          {/* Grid Layout for City and State */}
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
                Registering...
              </>
            ) : (
              text.registerBtn
            )}
          </button>
        </form>

        <div className={styles.divider}>System Access</div>
        
        <div className={styles['footer-text']}>
          {text.hasAccount} 
          <Link to="/admin/login" className={styles['footer-link']}>
            {text.loginBtn}
          </Link>
        </div>

      </div>
    </main>
  );
};

export default AdminRegister;