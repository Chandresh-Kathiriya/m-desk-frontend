import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getInvoiceDetails, downloadAdminInvoice } from '../../../store/actions/admin/invoiceActions';
import { INVOICE_DETAILS_RESET, INVOICE_DOWNLOAD_RESET } from '../../../store/constants/admin/invoiceConstants';
import styles from '../../../schemas/css/AdminCouponsPage.module.css';

const AdminInvoiceDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<any>();

    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const invoiceDetails = useSelector((state: RootState) => state.invoiceDetails || {});
    const { loading, error, invoice } = invoiceDetails as any;

    const invoiceDownload = useSelector((state: RootState) => state.invoiceDownload || {});
    const { loading: downloading, success: downloadSuccess, error: downloadError } = invoiceDownload as any;

    useEffect(() => {
        if (userInfo && userInfo.token && id) {
            dispatch(getInvoiceDetails(id));
        }

        // Cleanup: Clear the invoice from state when leaving the page
        return () => {
            dispatch({ type: INVOICE_DETAILS_RESET });
        };
    }, [dispatch, id, userInfo]);

    // Handle Download Success/Error States
    useEffect(() => {
        if (downloadSuccess) {
            dispatch({ type: INVOICE_DOWNLOAD_RESET });
        }
        if (downloadError) {
            alert(downloadError);
            dispatch({ type: INVOICE_DOWNLOAD_RESET });
        }
    }, [downloadSuccess, downloadError, dispatch]);

    const getProductImage = (product: any) => {
        if (!product) return 'https://via.placeholder.com/50';
        if (product.images && product.images.length > 0 && product.images[0].url) {
            return product.images[0].url;
        }
        return 'https://via.placeholder.com/50';
    };

    const downloadPDFHandler = () => {
        if (id && invoice?.invoiceNumber) {
            dispatch(downloadAdminInvoice(id, invoice.invoiceNumber));
        }
    };

    if (loading) return <div className={styles['spinner-container']}><div className={styles.spinner}></div></div>;
    if (error) return <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>;
    if (!invoice) return <div>No Invoice Found</div>;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container} style={{ maxWidth: '800px' }}>
                <Link to="/admin/invoices" style={{ textDecoration: 'none', color: 'var(--color-primary-600)', marginBottom: '1rem', display: 'inline-block', fontWeight: 'bold' }}>
                    &larr; Back to All Invoices
                </Link>

                <div className={styles.card}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                        <h1 className={styles['page-title']} style={{ margin: 0 }}>Invoice {invoice.invoiceNumber}</h1>
                        <span className={`${styles.badge} ${invoice.status === 'paid' ? styles['badge--success'] : styles['badge--error']}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                            {invoice.status.toUpperCase()}
                        </span>
                    </div>

                    <div className={styles['form-row']} style={{ marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '14px', color: 'var(--color-neutral-500)', textTransform: 'uppercase' }}>Billed To (Contact)</h3>
                            <p style={{ margin: '4px 0', fontWeight: 'bold', fontSize: '1.1rem' }}>{invoice.customer?.name}</p>
                            <p style={{ margin: 0, color: 'var(--color-neutral-600)' }}>{invoice.customer?.email}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: '4px 0' }}><strong>Invoice Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                            <p style={{ margin: '4px 0' }}>
                                <strong>Linked Order:</strong>{' '}
                                <Link to={`/admin/order/${invoice.salesOrder?._id}`} style={{ color: 'var(--color-primary-600)', fontWeight: 'bold', textDecoration: 'none' }}>
                                    {invoice.salesOrder?._id.slice(-6).toUpperCase()}
                                </Link>
                            </p>
                        </div>
                    </div>

                    <table className={styles['admin-table']} style={{ marginBottom: '2rem' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-neutral-100)' }}>
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
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={getProductImage(item.product)} alt="Product" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--color-neutral-200)' }} />
                                            <span style={{ fontWeight: 'bold', color: 'var(--color-neutral-800)' }}>
                                                {item.product?.productName || 'Unknown Product'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={styles['align-center']} style={{ verticalAlign: 'middle' }}>{item.quantity}</td>
                                    <td className={styles['align-right']} style={{ verticalAlign: 'middle' }}>₹{item.unitPrice.toFixed(2)}</td>
                                    <td className={styles['align-right']} style={{ verticalAlign: 'middle' }}><strong>₹{item.totalAmount.toFixed(2)}</strong></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ width: '320px', backgroundColor: 'var(--color-neutral-50)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: 'var(--color-neutral-700)' }}>
                                <span>Shipping Charge:</span>
                                <span>
                                    {invoice.salesOrder?.shippingPrice === 0 
                                        ? <span style={{ color: 'var(--color-success-600)', fontWeight: 'bold' }}>Free</span> 
                                        : `₹${(invoice.salesOrder?.shippingPrice || 0).toFixed(2)}`
                                    }
                                </span>
                            </div>

                            {/* SMART DISCOUNT MATH (Same as the User side!) */}
                            {(() => {
                                const subtotal = invoice.items.reduce((acc: number, item: any) => acc + item.totalAmount, 0);
                                const shipping = invoice.salesOrder?.shippingPrice || 0;
                                const displayDiscount = invoice.discountAmount > 0 ? invoice.discountAmount : (subtotal + shipping) - invoice.totalAmount;

                                if (displayDiscount > 0.01) {
                                    return (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                            <span>Discount Applied:</span>
                                            <span style={{ color: 'var(--color-success-600)', fontWeight: 'bold' }}>- ₹{displayDiscount.toFixed(2)}</span>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-neutral-300)', paddingTop: '12px', marginTop: '4px', fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-neutral-900)' }}>
                                <span>Total Paid:</span>
                                <span>₹{invoice.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                         <button 
                             className={styles['btn-submit']} 
                             style={{ width: 'auto', display: 'inline-flex', padding: '0 32px' }}
                             onClick={downloadPDFHandler}
                             disabled={downloading}
                         >
                             {downloading ? 'Generating PDF...' : 'Download PDF Invoice (Admin)'}
                         </button>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default AdminInvoiceDetailsPage;