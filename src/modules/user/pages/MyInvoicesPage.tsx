import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listMyInvoices, downloadUserInvoice } from '../../../store/actions/user/invoiceActions';
import { USER_INVOICE_DOWNLOAD_RESET } from '../../../store/constants/user/invoiceConstants';

import styles from '../../../schemas/css/MyInvoicesPage.module.css';

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
                
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>My Invoices</h1>
                    <p className={styles['page-description']}>
                        View and download your official tax invoices for completed orders.
                    </p>
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
                            <table className={styles['user-table']}>
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
                                        if (displayDiscount < 0.01) displayDiscount = 0;

                                        // Calculate the "Base Total" before discount
                                        const baseTotal = inv.totalAmount + displayDiscount;

                                        return (
                                            <tr key={inv._id}>
                                                <td>{new Date(inv.invoiceDate).toLocaleDateString()}</td>

                                                <td className={styles['text-code']}>
                                                    <Link to={`/invoice/${inv._id}`} className={styles['link-bold']}>
                                                        {inv.invoiceNumber}
                                                    </Link>
                                                </td>

                                                <td className={styles['text-code']}>
                                                    {inv.salesOrder ? (
                                                        <Link to={`/order/${inv.salesOrder._id}`} className={styles['link-bold']} style={{ fontWeight: '500' }}>
                                                            ORD-{inv.salesOrder._id.slice(-6).toUpperCase()}
                                                        </Link>
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles['badge--neutral']}`}>N/A</span>
                                                    )}
                                                </td>

                                                <td className={styles['align-right']}>
                                                    ₹{baseTotal.toFixed(2)}
                                                </td>
                                                <td className={`${styles['align-right']} ${displayDiscount > 0 ? styles['text-success'] : styles['text-muted']}`}>
                                                    {displayDiscount > 0 ? `- ₹${displayDiscount.toFixed(2)}` : '-'}
                                                </td>
                                                <td className={`${styles['align-right']} ${styles['fw-bold']}`}>
                                                    ₹{inv.totalAmount.toFixed(2)}
                                                </td>

                                                <td className={styles['align-center']}>
                                                    <span className={`${styles.badge} ${inv.status === 'paid' ? styles['badge--success'] : styles['badge--error']}`}>
                                                        {inv.status}
                                                    </span>
                                                </td>

                                                <td className={styles['align-center']}>
                                                    <div className={styles['action-cell']}>
                                                        <button 
                                                            className={styles['btn-icon']}
                                                            onClick={() => downloadPDFHandler(inv._id, inv.invoiceNumber)}
                                                            disabled={downloadingId === inv._id}
                                                            title="Download PDF Invoice"
                                                        >
                                                            {downloadingId === inv._id ? (
                                                                <div className={`${styles.spinner} ${styles['spinner--sm']}`}></div>
                                                            ) : (
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                                    <polyline points="7 10 12 15 17 10"></polyline>
                                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                                </svg>
                                                            )}
                                                            PDF
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {invoices.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className={styles['align-center']} style={{ padding: 'var(--space-12)' }}>
                                                <span className={styles['text-muted']}>No invoices found.</span>
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

export default MyInvoicesPage;