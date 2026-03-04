import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getUserInvoiceDetails, downloadUserInvoice } from '../../../store/actions/user/invoiceActions';
import { USER_INVOICE_DETAILS_RESET, USER_INVOICE_DOWNLOAD_RESET } from '../../../store/constants/user/invoiceConstants';

import styles from '../../../schemas/css/InvoiceDetailsPage.module.css';
import { showErrorAlert } from '../../../common/utils/alertUtils';

const InvoiceDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<any>();

    const userAuth = useSelector((state: RootState) => state.userAuth);
    const { userInfo } = userAuth as any;

    const userInvoiceDetails = useSelector((state: RootState) => state.userInvoiceDetails || {});
    const { loading, error, invoice } = userInvoiceDetails as any;

    const userInvoiceDownload = useSelector((state: RootState) => state.userInvoiceDownload || {});
    const { loading: downloading, success: downloadSuccess, error: downloadError } = userInvoiceDownload as any;

    useEffect(() => {
        if (userInfo && userInfo.token && id) {
            dispatch(getUserInvoiceDetails(id));
        }

        // Cleanup: Clear the invoice from state when leaving the page
        return () => {
            dispatch({ type: USER_INVOICE_DETAILS_RESET });
        };
    }, [dispatch, id, userInfo]);

    // Handle Download Success/Error States
    useEffect(() => {
        if (downloadSuccess) {
            dispatch({ type: USER_INVOICE_DOWNLOAD_RESET });
        }
        if (downloadError) {
            showErrorAlert('Download Failed', downloadError);
            dispatch({ type: USER_INVOICE_DOWNLOAD_RESET });
        }
    }, [downloadSuccess, downloadError, dispatch]);

    if (loading) return <div className={styles['spinner-container']}><div className={`${styles.spinner} ${styles['spinner--large']}`}></div></div>;
    if (error) return <div className={styles.container} style={{ paddingTop: '2rem' }}><div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div></div>;
    if (!invoice) return <div className={styles.container} style={{ paddingTop: '2rem' }}><h4>No Invoice Found</h4></div>;

    // Helper to safely get the first image
    const getProductImage = (product: any) => {
        if (!product) return 'https://via.placeholder.com/50';
        if (product.images && product.images.length > 0 && product.images[0].url) {
            return product.images[0].url;
        }
        return 'https://via.placeholder.com/50';
    };

    const downloadPDFHandler = () => {
        if (id && invoice?.invoiceNumber) {
            dispatch(downloadUserInvoice(id, invoice.invoiceNumber));
        }
    };

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <Link to="/invoices" className={styles['back-link']}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Back to Invoices
                </Link>

                <div className={styles.card}>
                    
                    <div className={styles['card-header']}>
                        <h1 className={styles['page-title']}>Invoice {invoice.invoiceNumber}</h1>
                        <span className={`${styles.badge} ${invoice.status === 'paid' ? styles['badge--success'] : styles['badge--error']}`}>
                            {invoice.status}
                        </span>
                    </div>

                    <div className={styles['info-grid']}>
                        <div className={styles['info-column']}>
                            <h3 className={styles['info-label']}>Billed To</h3>
                            <div className={styles['info-value-lg']}>{invoice.customer?.name}</div>
                            <div className={styles['info-value']}>{invoice.customer?.email}</div>
                        </div>
                        <div className={`${styles['info-column']} ${styles['info-column--right']}`}>
                            <div className={styles['info-value']}>
                                <strong className={styles['info-label']} style={{ display: 'inline', marginRight: '8px' }}>Invoice Date:</strong> 
                                {new Date(invoice.invoiceDate).toLocaleDateString()}
                            </div>
                            <div className={styles['info-value']}>
                                <strong className={styles['info-label']} style={{ display: 'inline', marginRight: '8px' }}>Linked Order:</strong> 
                                {invoice.salesOrder?._id ? invoice.salesOrder._id.slice(-6).toUpperCase() : 'N/A'}
                            </div>
                        </div>
                    </div>

                    {/* INVOICE ITEMS TABLE */}
                    <div className={styles['table-responsive']}>
                        <table className={styles['user-table']}>
                            <thead>
                                <tr>
                                    <th>Product Details</th>
                                    <th className={styles['align-center']}>Qty</th>
                                    <th className={styles['align-right']}>Unit Price</th>
                                    <th className={styles['align-right']}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item: any, index: number) => (
                                    <tr key={index}>
                                        <td>
                                            <div className={styles['product-cell']}>
                                                <img src={getProductImage(item.product)} alt="Product" className={styles['product-img']} />
                                                <span className={styles['product-name']}>
                                                    {item.product?.productName || 'Unknown Product'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={styles['align-center']}>{item.quantity}</td>
                                        <td className={styles['align-right']}>₹{item.unitPrice.toFixed(2)}</td>
                                        <td className={`${styles['align-right']} ${styles['text-bold']}`}>₹{item.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* TOTALS SECTION */}
                    <div className={styles['summary-wrapper']}>
                        <div className={styles['summary-box']}>

                            {/* SMART DISCOUNT CALCULATION */}
                            {(() => {
                                const subtotal = invoice.items.reduce((acc: number, item: any) => acc + item.totalAmount, 0);
                                const shipping = invoice.salesOrder?.shippingPrice || 0;
                                const displayDiscount = invoice.discountAmount > 0 
                                    ? invoice.discountAmount 
                                    : (subtotal + shipping) - invoice.totalAmount;

                                if (displayDiscount > 0.01) { 
                                    return (
                                        <div className={styles['summary-row']}>
                                            <span>Discount Applied:</span>
                                            <span className={styles['text-success']}>- ₹{displayDiscount.toFixed(2)}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}
                            
                            {/* Shipping Display */}
                            <div className={styles['summary-row']}>
                                <span>Shipping Charge:</span>
                                <span>
                                    {invoice.salesOrder?.shippingPrice === 0
                                        ? <span className={styles['text-success']}>Free</span>
                                        : `₹${(invoice.salesOrder?.shippingPrice || 0).toFixed(2)}`
                                    }
                                </span>
                            </div>

                            {/* Final Total */}
                            <div className={`${styles['summary-row']} ${styles['summary-row--total']}`}>
                                <span>Total Paid:</span>
                                <span>₹{invoice.totalAmount.toFixed(2)}</span>
                            </div>

                        </div>
                    </div>

                    <div className={styles['action-area']}>
                        <button 
                            className={`${styles.btn} ${styles['btn-primary']}`}
                            onClick={downloadPDFHandler}
                            disabled={downloading}
                        >
                            {downloading ? (
                                <><div className={styles.spinner}></div> Generating PDF...</>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    Download PDF Invoice
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
};

export default InvoiceDetailsPage;