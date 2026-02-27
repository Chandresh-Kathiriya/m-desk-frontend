import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getOrderDetails, deliverOrder } from '../../../store/actions/admin/orderActions';
import { ORDER_DELIVER_RESET } from '../../../store/constants/admin/orderConstants';

import styles from '../../../schemas/css/AdminOrderDetailsPage.module.css';

const AdminOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<any>();

    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const orderDetails = useSelector((state: RootState) => state.orderDetails || {});
    const { order, loading, error } = orderDetails as any;

    const orderDeliver = useSelector((state: RootState) => state.orderDeliver || {});
    const { loading: loadingDeliver, success: successDeliver, error: errorDeliver } = orderDeliver as any;

    useEffect(() => {
        if (!order || order._id !== id || successDeliver) {
            dispatch({ type: ORDER_DELIVER_RESET });
            if (id) {
                dispatch(getOrderDetails(id));
            }
        }
    }, [dispatch, id, order, successDeliver]);

    const deliverHandler = () => {
        if (order) {
            dispatch(deliverOrder(order));
        }
    };

    const formatOrderId = (orderId: string) => `ORD-${orderId.slice(-6).toUpperCase()}`;

    if (loading) return (
        <div className={styles['spinner-container']}>
            <div className={`${styles.spinner} ${styles['spinner--large']}`}></div>
        </div>
    );
    
    if (error) return (
        <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}>
            <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>
        </div>
    );
    
    if (!order) return (
        <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}>
            <h4 style={{ color: 'var(--color-neutral-600)' }}>Order not found.</h4>
        </div>
    );

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Manage Order {formatOrderId(order._id)}</h1>
                    <Link to="/admin/orders" className={`${styles.btn} ${styles['btn-outline']}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                            <line x1="19" y1="12" x2="5" y2="12"></line>
                            <polyline points="12 19 5 12 12 5"></polyline>
                        </svg>
                        Back to Orders
                    </Link>
                </header>
                
                <div className={styles.layout}>
                    
                    {/* LEFT COLUMN */}
                    <div className={styles['main-column']}>
                        
                        {/* Customer & Shipping Details */}
                        <div className={styles.card}>
                            <div className={styles['card-header']}>
                                <h2 className={styles['card-title']}>Customer & Shipping Details</h2>
                            </div>
                            <div className={styles['card-body']}>
                                <div className={styles['info-grid']}>
                                    <div className={styles['info-group']}>
                                        <span className={styles['info-label']}>Customer Name</span>
                                        <span className={styles['info-value']}>{order.user?.name}</span>
                                    </div>
                                    <div className={styles['info-group']}>
                                        <span className={styles['info-label']}>Email Address</span>
                                        <a href={`mailto:${order.user?.email}`} className={styles['info-link']}>{order.user?.email}</a>
                                    </div>
                                    <div className={`${styles['info-group']} ${styles['info-group--full']}`}>
                                        <span className={styles['info-label']}>Shipping Address</span>
                                        <span className={styles['info-value']}>
                                            {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                                        </span>
                                    </div>
                                    <div className={`${styles['info-group']} ${styles['info-group--full']}`}>
                                        <span className={styles['info-label']}>Delivery Status</span>
                                        <div>
                                            {order.isDelivered ? (
                                                <span className={`${styles.badge} ${styles['badge--success']}`}>
                                                    Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className={`${styles.badge} ${styles['badge--warning']}`}>
                                                    Processing Delivery
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className={styles.card}>
                            <div className={styles['card-header']}>
                                <h2 className={styles['card-title']}>Order Items</h2>
                            </div>
                            <div className={styles['card-body']}>
                                <ul className={styles['item-list']}>
                                    {order.orderItems?.map((item: any, index: number) => (
                                        <li key={index} className={styles['item-row']}>
                                            <img src={item.image} alt={item.name} className={styles['item-image']} />
                                            
                                            <div className={styles['item-details']}>
                                                <Link to={`/product/${item.product}`} className={styles['item-name']}>
                                                    {item.name}
                                                </Link>
                                                <div className={styles['item-meta']}>
                                                    SKU: {item.sku} | Color: {item.color}
                                                </div>
                                            </div>
                                            
                                            <div className={styles['item-price-block']}>
                                                <div className={styles['item-calculation']}>
                                                    {item.qty} x ₹{item.price.toFixed(2)}
                                                </div>
                                                <div className={styles['item-total']}>
                                                    ₹{(item.qty * item.price).toFixed(2)}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: ACTION PANEL */}
                    <div>
                        <div className={`${styles.card} ${styles['action-panel']}`}>
                            <div className={styles['card-header']}>
                                <h2 className={styles['card-title']}>Action Panel</h2>
                            </div>
                            <div className={styles['card-body']}>
                                
                                <div className={styles['summary-row']}>
                                    <span className={styles['summary-label']}>Payment Status</span>
                                    <span className={styles['summary-value']}>
                                        {order.isPaid ? (
                                            <span className={`${styles.badge} ${styles['badge--success']}`}>Paid</span>
                                        ) : (
                                            <span className={`${styles.badge} ${styles['badge--error']}`}>Unpaid</span>
                                        )}
                                    </span>
                                </div>

                                <div className={styles['summary-total-row']}>
                                    <span className={styles['summary-total-label']}>Total</span>
                                    <span className={styles['summary-total-value']}>₹{order.totalPrice.toFixed(2)}</span>
                                </div>

                                {!order.isDelivered && (
                                    <>
                                        {errorDeliver && (
                                            <div className={`${styles.alert} ${styles['alert--error']}`}>
                                                {errorDeliver}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            className={`${styles.btn} ${styles['btn-primary']}`}
                                            onClick={deliverHandler}
                                            disabled={loadingDeliver}
                                        >
                                            {loadingDeliver ? (
                                                <><div className={`${styles.spinner} ${styles['spinner--light']}`}></div> Processing...</>
                                            ) : (
                                                "Mark As Delivered"
                                            )}
                                        </button>
                                    </>
                                )}

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default AdminOrderDetailsPage;