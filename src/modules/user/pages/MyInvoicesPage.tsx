import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listMyInvoices, downloadUserInvoice } from '../../../store/actions/user/invoiceActions';
import { USER_INVOICE_DOWNLOAD_RESET } from '../../../store/constants/user/invoiceConstants';

import styles from '../../../schemas/css/AdminCouponsPage.module.css';

const MyInvoicesPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const userAuth = useSelector((state: RootState) => state.userAuth || {});
    const { userInfo } = userAuth as any;

    const userInvoiceList = useSelector((state: RootState) => state.userInvoiceList || {});
    const { loading, error, invoices = [] } = userInvoiceList as any;

    const userInvoiceDownload = useSelector((state: RootState) => state.userInvoiceDownload || {});
    const { loadingId: downloadingId, success: downloadSuccess, error: downloadError } = userInvoiceDownload as any;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }

        if (userInfo && userInfo.token) {
            dispatch(listMyInvoices());
        }
    }, [dispatch, userInfo, navigate]);

    // Handle Download Success/Error resets
    useEffect(() => {
        if (downloadSuccess) {
            dispatch({ type: USER_INVOICE_DOWNLOAD_RESET });
        }
        if (downloadError) {
            alert(downloadError);
            dispatch({ type: USER_INVOICE_DOWNLOAD_RESET });
        }
    }, [downloadSuccess, downloadError, dispatch]);

    const downloadPDFHandler = (id: string, invoiceNumber: string) => {
        dispatch(downloadUserInvoice(id, invoiceNumber));
    };

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                <h1 className={styles['page-title']}>My Invoices</h1>
                <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-6)' }}>
                    View and download your official tax invoices for completed orders.
                </p>

                {error && <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>}

                <div className={`${styles.card} ${styles['table-card']}`}>
                    {loading ? (
                        <div className={styles['spinner-container']}><div className={styles.spinner}></div></div>
                    ) : (
                        <div className={styles['table-responsive']}>
                            <table className={styles['admin-table']}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Invoice ID</th>
                                        <th>Linked Order</th>
                                        <th className={styles['align-right']}>Total</th>
                                        <th className={styles['align-right']}>Discount</th>
                                        <th className={styles['align-right']}>Paid</th>
                                        <th className={styles['align-center']}>Status</th>
                                        <th className={styles['align-center']}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv: any) => {
                                        // --- SMART MATH FOR THE TABLE ---
                                        const subtotal = inv.items?.reduce((acc: number, item: any) => acc + item.totalAmount, 0) || 0;
                                        const shipping = inv.salesOrder?.shippingPrice || 0;

                                        // Calculate actual discount
                                        let displayDiscount = inv.discountAmount > 0 ? inv.discountAmount : (subtotal + shipping) - inv.totalAmount;
                                        if (displayDiscount < 0.01) displayDiscount = 0; // Fixes minor decimal rounding issues

                                        // Calculate the "Base Total" before discount
                                        const baseTotal = inv.totalAmount + displayDiscount;

                                        return (
                                            <tr key={inv._id}>
                                                <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>

                                                <td className={styles['text-code']}>
                                                    <Link to={`/invoice/${inv._id}`} style={{ textDecoration: 'none', color: 'var(--color-primary-600)', fontWeight: 'bold' }}>
                                                        {inv.invoiceNumber}
                                                    </Link>
                                                </td>

                                                <td>
                                                    {inv.salesOrder ? (
                                                        <Link to={`/order/${inv.salesOrder._id}`} style={{ textDecoration: 'none', color: 'var(--color-primary-600)', fontWeight: '500' }}>
                                                            ORD-{inv.salesOrder._id.slice(-6).toUpperCase()}
                                                        </Link>
                                                    ) : (
                                                        <span className="text-muted">N/A</span>
                                                    )}
                                                </td>

                                                <td className={styles['align-right']}>
                                                    ₹{baseTotal.toFixed(2)}
                                                </td>
                                                <td className={styles['align-right']} style={{ color: 'var(--color-success-600)' }}>
                                                    {displayDiscount > 0 ? `- ₹${displayDiscount.toFixed(2)}` : '-'}
                                                </td>
                                                <td className={styles['align-right']}>
                                                    <strong>₹{inv.totalAmount.toFixed(2)}</strong>
                                                </td>

                                                <td className={styles['align-center']}>
                                                    <span className={`${styles.badge} ${inv.status === 'paid' ? styles['badge--success'] : styles['badge--error']}`}>
                                                        {inv.status.toUpperCase()}
                                                    </span>
                                                </td>

                                                <td className={styles['align-center']}>
                                                    <button
                                                        onClick={() => downloadPDFHandler(inv._id, inv.invoiceNumber)}
                                                        disabled={downloadingId === inv._id}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--color-primary-600)',
                                                            cursor: downloadingId === inv._id ? 'not-allowed' : 'pointer',
                                                            fontWeight: 'bold',
                                                            textDecoration: 'underline'
                                                        }}
                                                    >
                                                        {downloadingId === inv._id ? 'Downloading...' : 'Download PDF'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {invoices.length === 0 && (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No invoices available.</td></tr>
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

export default MyInvoicesPage;