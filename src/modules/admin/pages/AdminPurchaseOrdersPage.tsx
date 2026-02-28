import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { listPurchaseOrders } from '../../../store/actions/admin/purchaseActions';

import styles from '../../../schemas/css/AdminPurchaseOrdersPage.module.css'; 

const AdminPurchaseOrdersPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const purchaseList = useSelector((state: RootState) => state.purchaseList || {});
    const { loading, error, orders = [] } = purchaseList as any;

    useEffect(() => {
        if (userInfo && userInfo.token) {
            dispatch(listPurchaseOrders());
        }
    }, [dispatch, userInfo]);

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Purchase Orders (Procurement)</h1>
                    <Link to="/admin/purchase/create" className={`${styles.btn} ${styles['btn-primary']}`}>
                        + Create Purchase Order
                    </Link>
                </header>

                {error && (
                    <div className={`${styles.alert} ${styles['alert--error']}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <div className={styles.card}>
                    {loading ? (
                        <div className={styles['spinner-container']}>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : (
                        <div className={styles['table-responsive']}>
                            <table className={styles['admin-table']}>
                                <thead>
                                    <tr>
                                        <th>PO Number</th>
                                        <th>Date</th>
                                        <th>Vendor</th>
                                        <th className={styles['align-right']}>Total Amount</th>
                                        <th className={styles['align-center']}>Status</th>
                                        <th className={styles['align-center']}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order: any) => (
                                        <tr key={order._id}>
                                            <td className={styles['text-code']}>
                                                <Link to={`/admin/purchase/${order._id}`}>
                                                    {order.orderNumber}
                                                </Link>
                                            </td>
                                            <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td>
                                                <div className={styles['fw-bold']}>{order.vendor?.name || 'Unknown'}</div>
                                                <div className={`${styles['text-muted']} ${styles.small}`}>{order.vendor?.email}</div>
                                            </td>
                                            <td className={`${styles['fw-bold']} ${styles['align-right']}`}>
                                                ₹{order.totalAmount.toFixed(2)}
                                            </td>
                                            <td className={styles['align-center']}>
                                                <span className={`${styles.badge} ${
                                                    order.status === 'billed' ? styles['badge--success'] : 
                                                    order.status === 'confirmed' ? styles['badge--warning'] : styles['badge--neutral']
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className={styles['align-center']}>
                                                <Link to={`/admin/purchase/${order._id}`} className={`${styles.btn} ${styles['btn-outline']}`}>
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className={styles['align-center']} style={{ padding: 'var(--space-12)' }}>
                                                <span className={styles['text-muted']}>No purchase orders found.</span>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </main>
    );
};

export default AdminPurchaseOrdersPage;