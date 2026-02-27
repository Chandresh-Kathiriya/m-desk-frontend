import React from 'react';
import { Link } from 'react-router-dom';
import { textSchema } from '../../schemas/text/schema';

// Import as a CSS Module
import styles from '../../schemas/css/Footer.module.css';

const Footer: React.FC = () => {
  const text = textSchema.en.common;
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      {/* Assuming 'container' is a global utility class. If it's defined inside Footer.module.css, change to styles.container */}
      <div className={`container ${styles['footer__container']}`}>
        
        {/* Main Multi-Column Footer Area */}
        <div className={styles['footer__main']}>
          
          {/* Column 1: Brand & About */}
          <div className={`${styles['footer__column']} ${styles['footer__column--brand']}`}>
            <h3 className={styles['footer__brand-name']}>{text.brandName || 'Storefront'}</h3>
            <p className={styles['footer__text']}>
              Curating the best products for your modern lifestyle. Quality and design at the forefront of everything we do.
            </p>
            <div className={styles['footer__socials']}>
              <a href="#" aria-label="Instagram" className={styles['footer__social-link']}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" aria-label="Twitter" className={styles['footer__social-link']}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
              </a>
              <a href="#" aria-label="Facebook" className={styles['footer__social-link']}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className={styles['footer__column']}>
            <h4 className={styles['footer__title']}>Shop</h4>
            <ul className={styles['footer__list']}>
              <li className={styles['footer__list-item']}><Link to="/" className={styles['footer__link']}>New Arrivals</Link></li>
              <li className={styles['footer__list-item']}><Link to="/" className={styles['footer__link']}>Best Sellers</Link></li>
              <li className={styles['footer__list-item']}><Link to="/" className={styles['footer__link']}>Categories</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className={styles['footer__column']}>
            <h4 className={styles['footer__title']}>Support</h4>
            <ul className={styles['footer__list']}>
              <li className={styles['footer__list-item']}><Link to="/contact" className={styles['footer__link']}>Contact Us</Link></li>
              <li className={styles['footer__list-item']}><Link to="/shipping" className={styles['footer__link']}>Shipping Info</Link></li>
              <li className={styles['footer__list-item']}><Link to="/returns" className={styles['footer__link']}>Returns & Exchanges</Link></li>
              <li className={styles['footer__list-item']}><Link to="/faq" className={styles['footer__link']}>FAQ</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className={`${styles['footer__column']} ${styles['footer__column--newsletter']}`}>
            <h4 className={styles['footer__title']}>Stay in the Loop</h4>
            <p className={`${styles['footer__text']} ${styles['footer__text--small']}`}>
              Subscribe for exclusive offers, new drops, and premium content.
            </p>
            <form className={styles['footer__form']} onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className={styles['footer__input']}
                required 
                aria-label="Email address"
              />
              <button type="submit" className={`${styles.btn} ${styles['btn--primary']} ${styles['footer__btn']}`}>
                Subscribe
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className={styles['footer__bottom']}>
          <p className={styles['footer__copyright']}>
            &copy; {currentYear} {text.brandName || 'Storefront'}. {text.footerRights || 'All rights reserved.'}
          </p>
          <div className={styles['footer__legal']}>
            <Link to="/privacy" className={styles['footer__legal-link']}>Privacy Policy</Link>
            <Link to="/terms" className={styles['footer__legal-link']}>Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;