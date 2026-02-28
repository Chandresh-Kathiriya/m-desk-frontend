import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getPurchaseOrderDetails, confirmPurchaseOrder, generatePurchaseBill } from '../../../store/actions/admin/purchaseActions';
import { PURCHASE_CONFIRM_RESET, PURCHASE_BILL_RESET, PURCHASE_DETAILS_RESET } from '../../../store/constants/admin/purchaseConstants';

import styles from '../../../schemas/css/AdminPurchaseOrderDetailsPage.module.css';

const AdminPurchaseOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const purchaseDetails = useSelector((state: RootState) => state.purchaseDetails || {});
    const { loading, error, purchase: po } = purchaseDetails as any;

    const purchaseConfirm = useSelector((state: RootState) => state.purchaseConfirm || {});
    const { loading: loadingConfirm, success: successConfirm, error: errorConfirm } = purchaseConfirm as any;

    const purchaseBill = useSelector((state: RootState) => state.purchaseBill || {});
    const { loading: loadingBill, success: successBill, error: errorBill } = purchaseBill as any;

    // Billing Form State
    const [showBillForm, setShowBillForm] = useState(false);
    const [invoiceDate, setInvoiceDate] = useState('');
    const [dueDate, setDueDate] = useState('');

    // Fetch Details on Mount
    useEffect(() => {
        if (userInfo && id) {
            dispatch(getPurchaseOrderDetails(id));
        }
        return () => {
            dispatch({ type: PURCHASE_DETAILS_RESET });
        };
    }, [dispatch, id, userInfo]);

    // Handle Confirm Success
    useEffect(() => {
        if (successConfirm) {
            alert('Stock Updated Successfully!');
            dispatch({ type: PURCHASE_CONFIRM_RESET });
            if (id) dispatch(getPurchaseOrderDetails(id)); // Refresh data
        }
        if (errorConfirm) alert(`Failed to confirm: ${errorConfirm}`);
    }, [successConfirm, errorConfirm, dispatch, id]);

    // Handle Bill Generation Success
    useEffect(() => {
        if (successBill) {
            alert('Vendor Bill Generated!');
            setShowBillForm(false);
            setInvoiceDate('');
            setDueDate('');
            dispatch({ type: PURCHASE_BILL_RESET });
            if (id) dispatch(getPurchaseOrderDetails(id)); // Refresh data
        }
        if (errorBill) alert(`Failed to generate bill: ${errorBill}`);
    }, [successBill, errorBill, dispatch, id]);

    // Action 1: Confirm Order (Updates Stock!)
    const confirmOrderHandler = () => {
        if (!window.confirm('Are you sure? This will permanently add the items to your product stock.')) return;
        if (id) dispatch(confirmPurchaseOrder(id));
    };

    // Action 2: Generate Vendor Bill
    const generateBillHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (id) dispatch(generatePurchaseBill(id, { invoiceDate, dueDate }));
    };

    if (loading) return <div className={styles['spinner-container']}><div className={`${styles.spinner} ${styles['spinner--large']}`}></div></div>;
    
    if (error) return (
        <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}>
            <div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div>
        </div>
    );
    
    if (!po) return <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}><h4>Order not found</h4></div>;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Purchase Order: {po.orderNumber}</h1>
                    <span className={`${styles.badge} ${
                        po.status === 'billed' ? styles['badge--success'] : 
                        po.status === 'confirmed' ? styles['badge--warning'] : styles['badge--neutral']
                    }`}>
                        {po.status}
                    </span>
                </header>

                {/* --- ACTION PANEL --- */}
                <section className={`${styles.card} ${styles['card--action']}`}>
                    <h2 className={styles['section-title']}>Procurement Actions</h2>
                    
                    <div className={styles['pipeline-text']}>
                        <span className={`${styles['pipeline-step']} ${po.status === 'draft' ? styles['pipeline-step--active'] : ''}`}>Draft</span>
                        <span className={styles['pipeline-arrow']}>➔</span>
                        <span className={`${styles['pipeline-step']} ${po.status === 'confirmed' ? styles['pipeline-step--active'] : ''}`}>Confirm (Updates Stock)</span>
                        <span className={styles['pipeline-arrow']}>➔</span>
                        <span className={`${styles['pipeline-step']} ${po.status === 'billed' ? styles['pipeline-step--active'] : ''}`}>Generate Bill (Accounting)</span>
                    </div>
                    
                    <div className={styles['action-group']}>
                        {po.status === 'draft' && (
                            <button 
                                onClick={confirmOrderHandler} 
                                className={`${styles.btn} ${styles['btn-warning']}`} 
                                disabled={loadingConfirm}
                            >
                                {loadingConfirm ? <><div className={styles.spinner}></div> Processing...</> : 'Confirm Order & Receive Stock'}
                            </button>
                        )}
                        {po.status === 'confirmed' && (
                            <button 
                                onClick={() => setShowBillForm(!showBillForm)} 
                                className={`${styles.btn} ${styles['btn-success']}`}
                            >
                                Convert to Vendor Bill
                            </button>
                        )}
                    </div>

                    {showBillForm && (
                        <form onSubmit={generateBillHandler} className={styles['bill-form']}>
                            <div className={styles['form-row']}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Bill/Invoice Date</label>
                                    <input type="date" className={styles.input} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Payment Due Date</label>
                                    <input type="date" className={styles.input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} style={{ width: '100%' }} disabled={loadingBill}>
                                        {loadingBill ? <><div className={styles.spinner}></div> Creating...</> : 'Create Bill'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </section>

                {/* --- DETAILS SECTION --- */}
                <section className={styles.card}>
                    <h2 className={styles['section-title']}>Order Details</h2>
                    
                    <div className={styles['info-grid']}>
                        <div className={styles['info-group']}>
                            <span className={styles.label}>Vendor</span>
                            <span className={styles['info-value']}>{po.vendor?.name || po.vendor}</span>
                        </div>
                        <div className={styles['info-group']}>
                            <span className={styles.label}>Order Date</span>
                            <span className={styles['info-value']}>{new Date(po.orderDate).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className={styles['table-responsive']}>
                        <table className={styles['po-table']}>
                            <thead>
                                <tr>
                                    <th>Product / SKU</th>
                                    <th>Qty</th>
                                    <th>Unit Price</th>
                                    <th>Tax %</th>
                                    <th>Total Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {po.items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className={styles['text-product']}>{item.product?.productName || item.product}</div>
                                            <div className={styles['text-sku']}>SKU: {item.sku}</div>
                                        </td>
                                        <td>{item.quantity}</td>
                                        <td>₹{item.unitPrice.toFixed(2)}</td>
                                        <td>{item.tax}%</td>
                                        <td className={styles['text-price']}>₹{item.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={styles['total-wrapper']}>
                        <div className={styles['total-box']}>
                            <span className={styles['total-label']}>Total Amount:</span>
                            <span className={styles['total-value']}>₹{po.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </section>

            </div>
        </main>
    );
};

export default AdminPurchaseOrderDetailsPage;