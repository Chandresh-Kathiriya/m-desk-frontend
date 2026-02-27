import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { verifyOrderPayment } from '../../../store/actions/user/orderActions';
import { clearUserCart } from '../../../store/actions/user/cartActions';

import styles from '../../../schemas/css/OrderSuccessPage.module.css';

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');

  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  useEffect(() => {
    // 1. Clear cart & VERIFY PAYMENT in the background
    const handleSuccessLogic = () => {
      if (paymentIntent && userInfo?.token) {
        // Tell the backend to verify Stripe and mark the order as PAID
        dispatch(verifyOrderPayment(paymentIntent));

        // Clear the cart in both DB and Redux
        dispatch(clearUserCart());
      }
    };

    handleSuccessLogic();

    // 2. Start the countdown to redirect
    const redirectTimer = setTimeout(() => {
      navigate('/orders');
    }, 4000); 

    return () => clearTimeout(redirectTimer); 
  }, [paymentIntent, userInfo, dispatch, navigate]);

  return (
    <main className={styles['success-page']}>
      <div className={styles['success-card']}>
        
        <div className={styles['icon-wrapper']}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        
        <h1 className={styles.title}>Payment Successful!</h1>
        
        <p className={styles.message}>
          Thank you for your purchase. We are preparing your order for shipment.
        </p>
        
        <div className={styles['redirect-container']}>
          <div className={styles.spinner}></div>
          <span>Redirecting to your orders...</span>
        </div>

      </div>
    </main>
  );
};

export default OrderSuccessPage;