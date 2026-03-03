import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getOrderDetails, deliverOrder, payOrderManual } from '../../../store/actions/admin/orderActions';
import { getAdminInvoiceByOrderId } from '../../../store/actions/admin/invoiceActions';
import { ORDER_DELIVER_RESET, ORDER_PAY_MANUAL_RESET } from '../../../store/constants/admin/orderConstants';
import { ADMIN_INVOICE_BY_ORDER_RESET } from '../../../store/constants/admin/invoiceConstants';

import styles from '../../../schemas/css/AdminOrderDetailsPage.module.css';

const AdminOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || state.userAuth);
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const orderDetails = useSelector((state: RootState) => state.orderDetails || {});
    const { order, loading, error } = orderDetails as any;

    const orderDeliver = useSelector((state: RootState) => state.orderDeliver || {});
    const { loading: loadingDeliver, success: successDeliver, error: errorDeliver } = orderDeliver as any;

    const adminInvoiceByOrder = useSelector((state: RootState) => state.adminInvoiceByOrder || {});
    const { invoice, loading: invoiceLoading, error: invoiceError } = adminInvoiceByOrder as any;

    const orderPayManual = useSelector((state: RootState) => state.orderPayManual || {});
    const { loading: isPaying, success: successPayManual, error: errorPayManual } = orderPayManual as any;

    // Local State for Manual Payment Date
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    // --- 🔍 ADDED DEBUGGING LOGS ---
    useEffect(() => {
        console.log("🔍 DEBUG [Order State]:", { loading, error, order });
    }, [order, loading, error]);

    useEffect(() => {
        console.log("🔍 DEBUG [Invoice State]:", { invoiceLoading, invoiceError, invoice });
    }, [invoice, invoiceLoading, invoiceError]);

    useEffect(() => {
        console.log("🔍 DEBUG [Manual Pay State]:", { isPaying, successPayManual, errorPayManual });
    }, [isPaying, successPayManual, errorPayManual]);
    // -------------------------------

    // Fetch Order Data
    useEffect(() => {
        if (!order || order._id !== id || successDeliver) {
            dispatch({ type: ORDER_DELIVER_RESET });
            if (id) {
                console.log(`🚀 DEBUG: Dispatching getOrderDetails for ID: ${id}`);
                dispatch(getOrderDetails(id));
            }
        }
    }, [dispatch, id, order, successDeliver]);

    // Check for an attached Customer Invoice
    useEffect(() => {
        if (id && userInfo) {
            console.log(`🚀 DEBUG: Dispatching getAdminInvoiceByOrderId for Order ID: ${id}`);
            dispatch(getAdminInvoiceByOrderId(id));
        }
        return () => {
            console.log(`🧹 DEBUG: Cleaning up Invoice State on unmount`);
            dispatch({ type: ADMIN_INVOICE_BY_ORDER_RESET });
        };
    }, [dispatch, id, userInfo]);

    // Handle Manual Payment Success/Error
    useEffect(() => {
        if (successPayManual) {
            alert("Payment recorded successfully!");
            dispatch({ type: ORDER_PAY_MANUAL_RESET });
            if (id) {
                console.log(`🔄 DEBUG: Payment Success! Re-fetching Order and Invoice...`);
                dispatch(getOrderDetails(id));
                dispatch(getAdminInvoiceByOrderId(id)); 
            }
        }
        if (errorPayManual) {
            alert(errorPayManual);
            dispatch({ type: ORDER_PAY_MANUAL_RESET });
        }
    }, [successPayManual, errorPayManual, dispatch, id]);

    const deliverHandler = () => {
        if (order) {
            dispatch(deliverOrder(order));
        }
    };

    const handleMarkAsPaid = () => {
        if (!paymentDate) return alert("Please select a payment date.");
        if (id) {
            console.log(`💸 DEBUG: Triggering Manual Pay for Date: ${paymentDate}`);
            dispatch(payOrderManual(id, paymentDate));
        }
    };

    const formatOrderId = (orderId: string) => `ORD-${orderId.slice(-6).toUpperCase()}`;

    if (loading) return <div className={styles['spinner-container']}><div className={`${styles.spinner} ${styles['spinner--large']}`}></div></div>;
    if (error) return <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}><div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div></div>;
    if (!order) return <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}><h4 style={{ color: 'var(--color-neutral-600)' }}>Order not found.</h4></div>;

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
                        
                        {/* Order & Customer Details */}
                        <div className={styles.card}>
                            <div className={styles['card-header']}>
                                <h2 className={styles['card-title']}>Order & Customer Details</h2>
                            </div>
                            <div className={styles['card-body']}>
                                <div className={styles['info-grid']}>
                                    
                                    <div className={styles['info-group']}>
                                        <span className={styles['info-label']}>Customer Name</span>
                                        <span className={styles['info-value']} style={{ fontWeight: 'bold' }}>{order.user?.name}</span>
                                    </div>
                                    <div className={styles['info-group']}>
                                        <span className={styles['info-label']}>Email Address</span>
                                        <a href={`mailto:${order.user?.email}`} className={styles['info-link']}>{order.user?.email}</a>
                                    </div>

                                    <div className={styles['info-group']}>
                                        <span className={styles['info-label']}>Order / Invoice Date</span>
                                        <span className={styles['info-value']}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className={styles['info-group']}>
                                        <span className={styles['info-label']}>Order Source</span>
                                        <span className={styles['info-value']}>
                                            {order.isManualEntry ? (
                                                <span className={`${styles.badge} ${styles['badge--info']}`}>Manual Entry</span>
                                            ) : (
                                                <span className={`${styles.badge} ${styles['badge--secondary']}`}>Storefront Checkout</span>
                                            )}
                                        </span>
                                    </div>

                                    {order.isManualEntry && (
                                        <div className={`${styles['info-group']} ${styles['info-group--full']}`}>
                                            <span className={styles['info-label']}>Created By (Admin)</span>
                                            <span className={styles['info-value']} style={{ color: 'var(--color-primary-600)' }}>
                                                {order.createdBy?.name || order.createdBy || 'Unknown Admin'}
                                            </span>
                                        </div>
                                    )}

                                    <div className={`${styles['info-group']} ${styles['info-group--full']}`} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                            <div>
                                                <span className={styles['info-label']}>Shipping Address</span>
                                                <div className={styles['info-value']} style={{ lineHeight: '1.6' }}>
                                                    {order.shippingAddress?.address}<br/>
                                                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br/>
                                                    {order.shippingAddress?.country}
                                                </div>
                                            </div>
                                            <div>
                                                <span className={styles['info-label']}>Billing Address</span>
                                                <div className={styles['info-value']} style={{ lineHeight: '1.6' }}>
                                                    {order.billingAddress && order.billingAddress.address ? (
                                                        <>
                                                            {order.billingAddress.address}<br/>
                                                            {order.billingAddress.city}, {order.billingAddress.postalCode}<br/>
                                                            {order.billingAddress.country}
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>
                                                            Same as Shipping Address
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`${styles['info-group']} ${styles['info-group--full']}`} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
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
                                                    SKU: {item.sku} | Color: {item.color} | Size: {item.size}
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

                                {order.paymentResult?.status && order.paymentResult.status.includes('Discount Applied') && (
                                    <div style={{ fontSize: '12px', color: 'var(--color-success-600)', marginTop: '8px', fontWeight: 'bold' }}>
                                        {order.paymentResult.status}
                                    </div>
                                )}

                                {/* Payment Collection Box (Only shows if Unpaid) */}
                                {!order.isPaid && (
                                    <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: '#1e293b', fontWeight: '600' }}>Record Customer Payment</h4>
                                        
                                        <label style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Date Payment Received:</label>
                                        <input 
                                            type="date" 
                                            value={paymentDate} 
                                            onChange={e => setPaymentDate(e.target.value)} 
                                            style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} 
                                            max={new Date().toISOString().split('T')[0]}
                                        />
                                        
                                        {order.manualPaymentDays > 0 && (
                                            <div style={{ fontSize: '12px', color: '#059669', marginBottom: '12px', background: '#ecfdf5', padding: '8px', borderRadius: '4px' }}>
                                                <strong style={{display:'block'}}>Opportunity: 2% Early Discount</strong>
                                                If paid within {order.manualPaymentDays} days of invoice creation, a 2% discount will be auto-calculated.
                                            </div>
                                        )}

                                        <button 
                                            onClick={handleMarkAsPaid} 
                                            disabled={isPaying} 
                                            className={`${styles.btn} ${styles['btn-success']}`} 
                                            style={{ width: '100%', justifyContent: 'center' }}
                                        >
                                            {isPaying ? 'Processing...' : 'Mark as Paid'}
                                        </button>
                                    </div>
                                )}

                                {/* Official Admin Invoice Button */}
                                {invoice?._id && (
                                    <div style={{ margin: 'var(--space-4) 0' }}>
                                        <Link 
                                            to={`/admin/invoice/${invoice._id}`} 
                                            style={{
                                                display: 'block', width: '100%', padding: '12px',
                                                backgroundColor: 'var(--color-neutral-900)', color: 'white',
                                                textAlign: 'center', borderRadius: 'var(--radius-md)',
                                                fontWeight: 'bold', textDecoration: 'none', boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            View ERP Invoice
                                        </Link>
                                    </div>
                                )}

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
                                            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
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