import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listOrders } from '../../../store/actions/admin/orderActions';

import styles from '../../../schemas/css/AdminOrdersPage.module.css';

const AdminOrdersPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const [timeRange, setTimeRange] = useState('all'); 

  const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
  const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

  const orderList = useSelector((state: RootState) => state.orderList || {});
  const { loading, error, orders = [] } = orderList as any;

  useEffect(() => {
    if (userInfo && userInfo.token) {
      dispatch(listOrders());
    }
  }, [dispatch, userInfo]);

  const formatOrderId = (orderId: string) => `ORD-${orderId.slice(-6).toUpperCase()}`;

  const filteredOrders = orders.filter((order: any) => {
    if (timeRange === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    
    if (timeRange === 'today') return orderDate.toDateString() === now.toDateString();
    if (timeRange === 'week') return orderDate >= new Date(now.setDate(now.getDate() - 7));
    if (timeRange === 'month') return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles.container}>
        
        <header className={styles.header}>
          <h1 className={styles['page-title']}>Manage Orders</h1>
          
          <div className={styles['filter-bar']}>
            <div className={styles['filter-icon']}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <span className={styles['filter-label']}>Order Date:</span>
            <select 
              value={timeRange} 
              onChange={(e) => setTimeRange(e.target.value)} 
              className={styles['filter-select']}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </header>

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
            <span>{error}</span>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles['table-responsive']}>
              <table className={styles['admin-table']}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Cus Name</th>
                    <th>Cus Email</th>
                    <th>Cus Mobile No.</th>
                    <th>Date</th>
                    <th className={styles['align-right']}>Total</th>
                    <th className={styles['align-right']}>Earnings</th> {/* NEW COLUMN */}
                    <th className={styles['align-center']}>Paid</th>
                    <th className={styles['align-center']}>Delivered</th>
                    <th className={styles['align-right']}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => {
                    // Calculate Earnings safely
                    // (Old orders without totalCost will result in 0 instead of NaN)
                    const totalCost = order.totalCost || order.totalPrice; 
                    const earnings = order.totalPrice - totalCost;

                    return (
                    <tr key={order._id}>
                      <td className={styles['text-code']}>{formatOrderId(order._id)}</td>
                      
                      {/* --- NEW: Stacked Customer Data --- */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles['text-user']} style={{ fontWeight: '600' }}>
                            {order.user?.name || 'Deleted User'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles['text-user']} style={{ fontWeight: '600' }}>
                            {order.user?.email || 'Deleted User'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span className={styles['text-user']} style={{ fontWeight: '600' }}>
                            {order.user?.mobile || 'Deleted User'}
                          </span>
                        </div>
                      </td>
                      
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className={`${styles['text-price']} ${styles['align-right']}`}>₹{order.totalPrice.toFixed(2)}</td>
                      
                      {/* --- NEW: Earnings Display --- */}
                      <td className={`${styles['text-price']} ${styles['align-right']}`} style={{ color: 'var(--color-success-600)' }}>
                        ₹{earnings > 0 ? earnings.toFixed(2) : '0.00'}
                      </td>

                      <td className={styles['align-center']}>
                        {order.isPaid ? (
                          <span className={`${styles.badge} ${styles['badge--success']}`}>Paid</span>
                        ) : (
                          <span className={`${styles.badge} ${styles['badge--error']}`}>No</span>
                        )}
                      </td>
                      <td className={styles['align-center']}>
                        {order.isDelivered ? (
                          <span className={`${styles.badge} ${styles['badge--success']}`}>Yes</span>
                        ) : (
                          <span className={`${styles.badge} ${styles['badge--warning']}`}>Pending</span>
                        )}
                      </td>
                      <td className={styles['align-right']}>
                        <Link to={`/admin/order/${order._id}`} className={styles['btn-details']}>
                          Details
                        </Link>
                      </td>
                    </tr>
                  )})}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-8)' }} className="text-muted">
                        No orders found for this time range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default AdminOrdersPage;