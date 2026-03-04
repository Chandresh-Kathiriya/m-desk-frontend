import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getPurchaseOrderDetails, receivePurchaseOrder, downloadAdminPO } from '../../../store/actions/admin/purchaseActions';
import { PURCHASE_DETAILS_RESET, PURCHASE_RECEIVE_RESET } from '../../../store/constants/admin/purchaseConstants';

import styles from '../../../schemas/css/AdminPurchaseOrderDetailsPage.module.css';
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from '../../../common/utils/alertUtils';

const AdminPurchaseOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const purchaseDetails = useSelector((state: RootState) => state.purchaseDetails || {});
    const { loading, error, purchase: po } = purchaseDetails as any;

    // Use the new Unified Receive Redux State
    const purchaseReceive = useSelector((state: RootState) => state.purchaseReceive || {});
    const { loading: loadingReceive, success: successReceive, error: errorReceive } = purchaseReceive as any;

    // Form State
    const [showReceiveForm, setShowReceiveForm] = useState(false);
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');

    useEffect(() => {
        if (userInfo && id) {
            dispatch(getPurchaseOrderDetails(id));
        }
        return () => {
            dispatch({ type: PURCHASE_DETAILS_RESET });
        };
    }, [dispatch, id, userInfo]);

    // Handle Receive & Bill Success
    useEffect(() => {
        if (successReceive) {
            showSuccessAlert(
                "Goods Received!", 
                "Stock has been updated and the Vendor Bill was generated successfully."
            );
            setShowReceiveForm(false);
            dispatch({ type: PURCHASE_RECEIVE_RESET });
            if (id) dispatch(getPurchaseOrderDetails(id));
        }
        if (errorReceive) {
            showErrorAlert("Processing Failed", `Failed to process: ${errorReceive}`);
        }
    }, [successReceive, errorReceive, dispatch, id]);

    // Action: Unified Receive & Bill
    const receiveGoodsHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        const isConfirmed = await showConfirmAlert(
            'Receive Inventory?',
            'Are you sure? This will add these items to your live stock and generate a payable vendor bill.',
            'Yes, Receive Stock'
        );
      
        // If they clicked cancel, stop the function right here
        if (!isConfirmed) return;
        if (id) dispatch(receivePurchaseOrder(id, { invoiceDate, dueDate }));
    };

    if (loading) return <div className={styles['spinner-container']}><div className={`${styles.spinner} ${styles['spinner--large']}`}></div></div>;
    if (error) return <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}><div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div></div>;
    if (!po) return <div className={styles.container} style={{ padding: 'var(--space-8) 0' }}><h4>Order not found</h4></div>;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>

                <header className={styles.header}>
                    <h1 className={styles['page-title']}>Proforma PO: {po.orderNumber}</h1>
                    <span className={`${styles.badge} ${po.status === 'billed' ? styles['badge--success'] : styles['badge--warning']}`}>
                        {po.status === 'billed' ? 'RECEIVED & BILLED' : 'DRAFT (PENDING GOODS)'}
                    </span>

                    <button
                        onClick={() => dispatch(downloadAdminPO(po._id, po.orderNumber))}
                        className={`${styles.btn} ${styles['btn-primary']}`}
                    >
                        📄 Download Proforma PDF
                    </button>
                </header>

                {/* --- ONE-STEP ACTION PANEL --- */}
                <section className={`${styles.card} ${styles['card--action']}`}>
                    <h2 className={styles['section-title']}>Arrival Action</h2>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '1rem' }}>
                        When the goods physically arrive, use this panel to update your inventory stock and generate the official payable invoice in one step.
                    </p>

                    {po.status === 'draft' && !showReceiveForm && (
                        <div className={styles['action-group']}>
                            <button
                                onClick={() => setShowReceiveForm(true)}
                                className={`${styles.btn} ${styles['btn-success']}`}
                            >
                                📦 Receive Goods & Generate Bill
                            </button>
                        </div>
                    )}

                    {po.status === 'draft' && showReceiveForm && (
                        <form onSubmit={receiveGoodsHandler} className={styles['bill-form']}>
                            <div className={styles['form-row']}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Vendor Invoice Date</label>
                                    <input type="date" className={styles.input} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Payment Due Date</label>
                                    <input type="date" className={styles.input} value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <button type="submit" className={`${styles.btn} ${styles['btn-success']}`} style={{ width: '100%' }} disabled={loadingReceive}>
                                        {loadingReceive ? <><div className={styles.spinner}></div> Processing...</> : 'Confirm & Update Stock'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {po.status === 'billed' && (
                        <div className={`${styles.alert} ${styles['alert--success']}`} style={{ marginTop: '1rem' }}>
                            ✔ Stock has been updated and the Vendor Bill has been generated.
                        </div>
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