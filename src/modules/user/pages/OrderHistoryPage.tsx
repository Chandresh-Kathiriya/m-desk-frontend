import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listMyOrders } from '../../../store/actions/user/orderActions';

import styles from '../../../schemas/css/OrderHistoryPage.module.css';

const OrderHistoryPage: React.FC = () => {
  const dispatch = useDispatch<any>();

  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  const orderListMy = useSelector((state: RootState) => state.orderListMy || {});
  const { loading, error, orders = [] } = orderListMy as any;

  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (redirectStatus === 'succeeded') {
      setPaymentMessage("Payment successful! Your order is being processed.");
    }

    if (userInfo && userInfo.token) {
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo, paymentIntent, redirectStatus]);

  const formatOrderId = (id: string) => `ORD-${id.slice(-6).toUpperCase()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <main className={styles['history-page']}>
      <div className={styles['history-page__container']}>

        <header className={styles['history-header']}>
          <h1 className={styles['history-title']}>My Orders</h1>
        </header>

        {paymentMessage && (
          <div className={`${styles.alert} ${styles['alert--success']}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            {paymentMessage}
          </div>
        )}

        {loading ? (
          <div className={styles['state-container']}>
            <div className={styles.spinner}></div>
          </div>
        ) : error ? (
          <div className={`${styles.alert} ${styles['alert--error']}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles['empty-state']}>
            <svg className={styles['empty-state__icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            <h2 className={styles['empty-state__title']}>No orders placed yet</h2>
            <p className={styles['empty-state__text']}>Looks like you haven't made your first purchase. Discover our latest collections and start shopping.</p>
            <Link to="/" className={styles['btn-primary']}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles['table-card']}>
            <div className={styles['table-responsive']}>
              <table className={styles['orders-table']}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th className={styles['align-right']}>Total</th>
                    <th className={styles['align-center']}>Payment</th>
                    <th className={styles['align-center']}>Fulfillment</th>
                    <th className={styles['align-right']}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order: any) => (
                    <tr key={order._id}>
                      <td className={styles['text-mono']}>{formatOrderId(order._id)}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td className={`${styles['text-price']} ${styles['align-right']}`}>
                        ₹{order.totalPrice.toFixed(2)}
                      </td>
                      <td className={styles['align-center']}>
                        {order.isPaid ? (
                          <span className={`${styles.badge} ${styles['badge--success']}`}>
                            Paid
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles['badge--error']}`}>
                            Not Paid
                          </span>
                        )}
                      </td>
                      <td className={styles['align-center']}>
                        {order.isDelivered ? (
                          <span className={`${styles.badge} ${styles['badge--success']}`}>
                            Delivered
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles['badge--warning']}`}>
                            Processing
                          </span>
                        )}
                      </td>
                      <td className={styles['align-right']}>
                        <Link to={`/order/${order._id}`} className={styles['btn-details']}>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrderHistoryPage;