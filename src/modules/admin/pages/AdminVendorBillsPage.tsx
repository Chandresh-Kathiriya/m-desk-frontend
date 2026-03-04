import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { listVendorBills, downloadAdminBill } from '../../../store/actions/admin/billActions';
import { BILL_DOWNLOAD_RESET } from '../../../store/constants/admin/billConstants';

import styles from '../../../schemas/css/AdminVendorBillsPage.module.css';
import { showErrorAlert } from '../../../common/utils/alertUtils';

const AdminVendorBillsPage: React.FC = () => {
    const dispatch = useDispatch<any>(); 
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    // --- REDUX STATES ---
    const billList = useSelector((state: RootState) => state.billList || {});
    const { loading, error, bills = [] } = billList as any;

    const billDownload = useSelector((state: RootState) => state.billDownload || {});
    const { loadingId: downloadingId, success: downloadSuccess, error: downloadError } = billDownload as any;

    // Fetch initial list
    useEffect(() => {
        if (userInfo && userInfo.token) {
            dispatch(listVendorBills());
        }
    }, [dispatch, userInfo]);

    // Handle Download Success/Error resets
    useEffect(() => {
        if (downloadSuccess) {
            dispatch({ type: BILL_DOWNLOAD_RESET });
        }
        if (downloadError) {
            showErrorAlert(downloadError);
            dispatch({ type: BILL_DOWNLOAD_RESET });
        }
    }, [downloadSuccess, downloadError, dispatch]);

    const downloadPDFHandler = (id: string, billNumber: string) => {
        dispatch(downloadAdminBill(id, billNumber));
    };

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Vendor Bills (Accounts Payable)</h1>
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

                <div className={`${styles.card} ${styles['table-card']}`}>
                    {loading ? (
                        <div className={styles['spinner-container']}>
                            <div className={styles.spinner}></div>
                        </div>
                    ) : (
                        <div className={styles['table-responsive']}>
                            <table className={styles['admin-table']}>
                                <thead>
                                    <tr>
                                        <th>Bill Number</th>
                                        <th>Invoice Date</th>
                                        <th>Vendor</th>
                                        <th className={styles['align-right']}>Total Amount</th>
                                        <th className={styles['align-right']}>Paid Amount</th>
                                        <th className={styles['align-center']}>Status</th>
                                        <th className={styles['align-center']}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bills.map((bill: any) => (
                                        <tr key={bill._id}>
                                            <td className={styles['text-code']}>
                                                <Link to={`/admin/bills/${bill._id}`}>
                                                    {bill.billNumber}
                                                </Link>
                                            </td>
                                            <td>{new Date(bill.invoiceDate).toLocaleDateString()}</td>
                                            <td>
                                                <div className={styles['fw-bold']}>{bill.vendor?.name || 'Unknown'}</div>
                                                <div className={`${styles['text-muted']} ${styles.small}`}>{bill.vendor?.email}</div>
                                            </td>
                                            <td className={`${styles['fw-bold']} ${styles['align-right']}`}>
                                                ₹{bill.totalAmount.toFixed(2)}
                                            </td>
                                            <td className={`${styles['align-right']} ${bill.paidAmount > 0 ? styles['text-success'] : ''}`}>
                                                ₹{bill.paidAmount.toFixed(2)}
                                            </td>
                                            <td className={styles['align-center']}>
                                                <span className={`${styles.badge} ${
                                                    bill.status === 'paid' ? styles['badge--success'] : 
                                                    bill.status === 'partially_paid' ? styles['badge--warning'] : styles['badge--neutral']
                                                }`}>
                                                    {bill.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles['action-cell']}>
                                                    <Link to={`/admin/bills/${bill._id}`} className={styles['btn-link']}>
                                                        {bill.status === 'paid' ? 'View Details' : 'Pay Bill'}
                                                    </Link>
                                                    <button 
                                                        className={styles['btn-icon']}
                                                        onClick={() => downloadPDFHandler(bill._id, bill.billNumber)}
                                                        disabled={downloadingId === bill._id}
                                                        title="Download PDF"
                                                    >
                                                        {downloadingId === bill._id ? (
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
                                    ))}
                                    {bills.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className={styles['align-center']} style={{ padding: 'var(--space-12)' }}>
                                                <span className={styles['text-muted']}>No vendor bills found. Go to a Purchase Order to generate one!</span>
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

export default AdminVendorBillsPage;