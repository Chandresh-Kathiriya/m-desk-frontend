import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getUserOrderDetails } from '../../../store/actions/user/orderActions';

import styles from '../../../schemas/css/OrderDetailsPage.module.css';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();

  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  const userOrderDetails = useSelector((state: RootState) => state.userOrderDetails || {});
  const { order, loading, error } = userOrderDetails as any;

  useEffect(() => {
    if (userInfo && userInfo.token && id) {
      if (!order || order._id !== id) {
        dispatch(getUserOrderDetails(id));
      }
    }
  }, [dispatch, id, userInfo, order]);

  const formatOrderId = (orderId: string) => `ORD-${orderId.slice(-6).toUpperCase()}`;

  if (loading) return (
    <div className={styles['state-container']}>
      <div className={styles.spinner}></div>
    </div>
  );
  
  if (error) return (
    <div className={`${styles['state-container']} ${styles['state-container--error']}`}>
      <p className={styles['state-message']}>{error}</p>
    </div>
  );
  
  if (!order) return (
    <div className={`${styles['state-container']} ${styles['state-container--empty']}`}>
      <p className={styles['state-message']}>Order not found.</p>
    </div>
  );

  return (
    <main className={styles['order-page']}>
      <div className={styles['order-page__container']}>
        
        <header className={styles['order-header']}>
          <div className={styles['order-header__info']}>
            <Link to="/orders" className={styles['order-header__back']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Orders
            </Link>
            <h1 className={styles['order-title']}>Order {formatOrderId(order._id)}</h1>
            <span className={styles['order-date']}>
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </header>

        <div className={styles['order-layout']}>
          
          {/* LEFT COLUMN: Order Details */}
          <section className={styles['order-main']}>
            
            {/* Shipping & Delivery Card */}
            <div className={styles['info-card']}>
              <div className={styles['info-card__header']}>
                <h2 className={styles['info-card__title']}>Shipping Details</h2>
                {order.isDelivered ? (
                  <span className={`${styles.badge} ${styles['badge--success']}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles['badge--warning']}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    Processing / Not Delivered
                  </span>
                )}
              </div>
              <div className={styles['info-card__body']}>
                <div className={styles['info-grid']}>
                  <div className={styles['info-group']}>
                    <span className={styles['info-label']}>Contact Name</span>
                    <span className={styles['info-value']}>{order.user?.name}</span>
                  </div>
                  <div className={styles['info-group']}>
                    <span className={styles['info-label']}>Email Address</span>
                    <a href={`mailto:${order.user?.email}`} className={styles['info-link']}>{order.user?.email}</a>
                  </div>
                  <div className={`${styles['info-group']} ${styles['info-group--full']}`}>
                    <span className={styles['info-label']}>Shipping Address</span>
                    <span className={styles['info-value']}>
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Card */}
            <div className={styles['info-card']}>
              <div className={styles['info-card__header']}>
                <h2 className={styles['info-card__title']}>Payment Details</h2>
                {order.isPaid ? (
                  <span className={`${styles.badge} ${styles['badge--success']}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    Paid
                  </span>
                ) : (
                  <span className={`${styles.badge} ${styles['badge--error']}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                    Not Paid
                  </span>
                )}
              </div>
              <div className={styles['info-card__body']}>
                <div className={styles['info-grid']}>
                  <div className={styles['info-group']}>
                    <span className={styles['info-label']}>Payment Method</span>
                    <span className={styles['info-value']}>
                      <span className={styles['payment-method-badge']}>{order.paymentMethod}</span>
                    </span>
                  </div>
                  {order.isPaid && (
                    <div className={styles['info-group']}>
                      <span className={styles['info-label']}>Payment Date</span>
                      <span className={styles['info-value']}>{new Date(order.paidAt || order.createdAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className={styles['info-card']}>
              <div className={styles['info-card__header']}>
                <h2 className={styles['info-card__title']}>Order Items</h2>
              </div>
              <ul className={styles['item-list']}>
                {order.orderItems?.map((item: any, index: number) => (
                  <li key={index} className={styles['item-card']}>
                    <div className={styles['item-card__image-wrapper']}>
                      <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} className={styles['item-card__image']} />
                    </div>
                    <div className={styles['item-card__details']}>
                      <Link to={`/product/${item.product}`} className={styles['item-card__title']}>
                        {item.name}
                      </Link>
                      <div className={styles['item-card__meta']}>
                        <span>Color: {item.color}</span>
                        <span className={styles['item-card__meta-divider']}>|</span>
                        <span>Size: {item.size}</span>
                      </div>
                    </div>
                    <div className={styles['item-card__pricing']}>
                      <span className={styles['item-card__calculation']}>
                        {item.qty} × ₹{item.price.toFixed(2)}
                      </span>
                      <span className={styles['item-card__total']}>
                        ₹{(item.qty * item.price).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </section>

          {/* RIGHT COLUMN: Order Summary */}
          <aside className={styles['order-sidebar']}>
            <div className={styles['summary-card']}>
              <h2 className={styles['summary-card__title']}>Order Summary</h2>
              
              <div className={styles['summary-card__body']}>
                <div className={styles['summary-row']}>
                  <span className={styles['summary-label']}>Items Subtotal</span>
                  <span className={styles['summary-value']}>₹{order.itemsPrice?.toFixed(2)}</span>
                </div>
                <div className={styles['summary-row']}>
                  <span className={styles['summary-label']}>Shipping</span>
                  <span className={styles['summary-value']}>
                    {order.shippingPrice === 0 ? <span className={styles['summary-value--free']}>Free</span> : `₹${order.shippingPrice?.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className={styles['summary-card__footer']}>
                <div className={styles['summary-total-row']}>
                  <span className={styles['summary-total-label']}>Total</span>
                  {/* Fixed markup mapping for Flexbox alignment */}
                  <span className={styles['summary-total-value']}>
                    <span className={styles['summary-currency']}>INR</span>
                    <span>₹{order.totalPrice?.toFixed(2)}</span>
                  </span>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
};

export default OrderDetailsPage;