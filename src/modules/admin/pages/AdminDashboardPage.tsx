import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RootState } from '../../../store/reducers';
import { listOrders } from '../../../store/actions/admin/orderActions';

import styles from '../../../schemas/css/AdminDashboardPage.module.css';

const AdminDashboardPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    // The time range dropdown for the payment date
    const [timeRange, setTimeRange] = useState('all');

    // Redux State
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const orderList = useSelector((state: RootState) => state.orderList || {});
    const { loading, error, orders = [] } = orderList as any;

    useEffect(() => {
        if (userInfo && userInfo.token) {
            dispatch(listOrders());
        }
    }, [dispatch, userInfo]);

    // --- FILTER LOGIC ---
    const filteredOrders = orders.filter((order: any) => {
        if (timeRange === 'all') return true;

        const orderDate = new Date(order.createdAt);
        const now = new Date();

        if (timeRange === 'today') return orderDate.toDateString() === now.toDateString();
        if (timeRange === 'week') return orderDate >= new Date(now.setDate(now.getDate() - 7));
        if (timeRange === 'month') return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
        return true;
    });

    // --- MATH CALCS FOR CARDS ---
    const totalRevenue = filteredOrders
        .filter((order: any) => order.isPaid)
        .reduce((acc: number, order: any) => acc + order.totalPrice, 0);

    const totalOrders = filteredOrders.length;

    // --- CHART DATA PREPARATION ---
    const salesByDate = filteredOrders
        .filter((order: any) => order.isPaid)
        .reduce((acc: any, order: any) => {
            const date = new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            if (!acc[date]) acc[date] = 0;
            acc[date] += order.totalPrice;
            return acc;
        }, {});

    const chartData = Object.keys(salesByDate).map(date => ({
        name: date,
        Revenue: salesByDate[date],
    }));

    const formatOrderId = (id: string) => `ORD-${id.slice(-6).toUpperCase()}`;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>

                {/* Header & Dropdown */}
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Analytics Dashboard</h1>

                    <div className={styles['filter-bar']}>
                        <div className={styles['filter-icon']}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <span className={styles['filter-label']}>Payment Date:</span>
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
                    <div className={styles['state-container']}><div className={styles.spinner}></div></div>
                ) : error ? (
                    <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>
                ) : (
                    <>
                        {/* --- TOP CARDS (Counts) --- */}
                        <div className={styles['kpi-grid']}>
                            <div className={`${styles['kpi-card']} ${styles['kpi-card--dark']}`}>
                                <div className={styles['kpi-icon-wrapper']}>
                                    ₹
                                </div>
                                <div>
                                    <div className={styles['kpi-label']}>Total Revenue</div>
                                    <div className={styles['kpi-value']}>₹{totalRevenue.toFixed(2)}</div>
                                </div>
                            </div>

                            <div className={`${styles['kpi-card']} ${styles['kpi-card--primary']}`}>
                                <div className={styles['kpi-icon-wrapper']}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="28" height="28">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                    </svg>
                                </div>
                                <div>
                                    <div className={styles['kpi-label']}>Total Orders</div>
                                    <div className={styles['kpi-value']}>{totalOrders}</div>
                                </div>
                            </div>
                        </div>

                        {/* --- REVENUE CHART --- */}
                        <div className={styles.card}>
                            <div className={styles['card-header']}>
                                <h2 className={styles['card-title']}>Revenue Overview</h2>
                            </div>
                            <div className={styles['card-body']}>
                                <div style={{ width: '100%', height: 300 }}>
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer>
                                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-neutral-200)" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-neutral-500)', fontSize: 12, fontFamily: 'var(--font-family-base)' }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-neutral-500)', fontSize: 12, fontFamily: 'var(--font-family-base)' }} tickFormatter={(val) => `₹${val}`} />
                                                <Tooltip
                                                    cursor={{ fill: 'var(--color-neutral-50)' }}
                                                    contentStyle={{
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--color-neutral-200)',
                                                        boxShadow: 'var(--shadow-md)',
                                                        fontFamily: 'var(--font-family-base)',
                                                        fontWeight: 'var(--font-weight-semibold)'
                                                    }}
                                                    formatter={(value: number | undefined) => [
                                                        `₹${(value ?? 0).toFixed(2)}`,
                                                        'Revenue'
                                                    ]}
                                                />
                                                <Bar dataKey="Revenue" fill="var(--color-neutral-900)" radius={[4, 4, 0, 0]} barSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className={styles['state-container']}>
                                            No paid orders found for this time range.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- RECENT ORDERS TABLE --- */}
                        <div className={styles.card}>
                            <div className={styles['card-header']}>
                                <h2 className={styles['card-title']}>Recent Transactions</h2>
                                <Link to="/admin/orders" className={styles['card-link']}>View All Orders &rarr;</Link>
                            </div>
                            <div className={styles['card-body--no-pad']}>
                                <div className={styles['table-responsive']}>
                                    <table className={styles['admin-table']}>
                                        <thead>
                                            <tr>
                                                <th>Order ID</th>
                                                <th>Date</th>
                                                <th>Total</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredOrders.slice(0, 5).map((order: any) => (
                                                <tr key={order._id}>
                                                    <td className={styles['text-code']}>{formatOrderId(order._id)}</td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td className={styles['text-price']}>₹{order.totalPrice.toFixed(2)}</td>
                                                    <td>
                                                        {order.isPaid ? (
                                                            <span className={`${styles.badge} ${styles['badge--success']}`}>Paid</span>
                                                        ) : (
                                                            <span className={`${styles.badge} ${styles['badge--error']}`}>Unpaid</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredOrders.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} style={{ textAlign: 'center', padding: 'var(--space-8)' }} className="text-muted">
                                                        No transactions found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default AdminDashboardPage;