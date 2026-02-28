import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listInvoices, downloadAdminInvoice } from '../../../store/actions/admin/invoiceActions';
import { INVOICE_DOWNLOAD_RESET } from '../../../store/constants/admin/invoiceConstants';

// Reusing your premium table styles!
import styles from '../../../schemas/css/AdminCouponsPage.module.css'; 

const AdminInvoicesPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const invoiceList = useSelector((state: RootState) => state.invoiceList || {});
    const { loading, error, invoices = [] } = invoiceList as any;

    const invoiceDownload = useSelector((state: RootState) => state.invoiceDownload || {});
    const { loadingId: downloadingId, success: downloadSuccess, error: downloadError } = invoiceDownload as any;

    // Fetch initial list
    useEffect(() => {
        if (userInfo && userInfo.token) {
            dispatch(listInvoices());
        }
    }, [dispatch, userInfo]);

    // Handle Download Success/Error resets
    useEffect(() => {
        if (downloadSuccess) {
            dispatch({ type: INVOICE_DOWNLOAD_RESET });
        }
        if (downloadError) {
            alert(downloadError);
            dispatch({ type: INVOICE_DOWNLOAD_RESET });
        }
    }, [downloadSuccess, downloadError, dispatch]);

    const downloadPDFHandler = (id: string, invoiceNumber: string) => {
        dispatch(downloadAdminInvoice(id, invoiceNumber));
    };

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                <h1 className={styles['page-title']}>Accounting: Customer Invoices</h1>
                
                <p style={{ color: 'var(--color-neutral-500)', marginBottom: 'var(--space-6)' }}>
                    This table strictly shows financial Invoice documents, separated from standard Web Sale Orders.
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
                                        <th>Order ID</th>
                                        <th>Cus. Name</th>
                                        <th>Cus. Email</th>
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

                                                {/* Clickable Invoice ID */}
                                                <td className={styles['text-code']}>
                                                    <Link to={`/admin/invoice/${inv._id}`} style={{ textDecoration: 'none', color: 'var(--color-primary-600)', fontWeight: 'bold' }}>
                                                        {inv.invoiceNumber}
                                                    </Link>
                                                </td>
                                                
                                                {/* Order Link */}
                                                <td>
                                                    {inv.salesOrder ? (
                                                        <Link to={`/admin/order/${inv.salesOrder._id}`} style={{ textDecoration: 'none', color: 'var(--color-primary-600)', fontWeight: '500' }}>
                                                            ORD-{inv.salesOrder._id.slice(-6).toUpperCase()}
                                                        </Link>
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles['badge--neutral']}`}>Manual</span>
                                                    )}
                                                </td>

                                                <td>
                                                    <strong>{inv.customer?.name || 'Unknown'}</strong>
                                                </td>

                                                <td>
                                                    <div style={{fontSize: '12px', color: 'var(--color-neutral-500)'}}>
                                                        {inv.customer?.email}
                                                    </div>
                                                </td>
                                                
                                                {/* Detailed Financials */}
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

                                                {/* Download Button */}
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
                                                        {downloadingId === inv._id ? 'Generating...' : 'Download PDF'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {invoices.length === 0 && (
                                        <tr><td colSpan={10} style={{textAlign: 'center', padding: 'var(--space-6)'}}>No invoices generated yet.</td></tr>
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

export default AdminInvoicesPage;