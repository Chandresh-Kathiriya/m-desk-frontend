import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getBillDetails, downloadAdminBill } from '../../../store/actions/admin/billActions';
import { createPayment } from '../../../store/actions/admin/paymentActions';
import { BILL_DETAILS_RESET } from '../../../store/constants/admin/billConstants';
import { PAYMENT_CREATE_RESET } from '../../../store/constants/admin/paymentConstants';

import styles from '../../../schemas/css/AdminVendorBillDetailsPage.module.css';

const AdminVendorBillDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const billDetails = useSelector((state: RootState) => state.billDetails || {});
    const { loading, error, bill } = billDetails as any;

    const paymentCreate = useSelector((state: RootState) => state.paymentCreate || {});
    const { loading: loadingPayment, success: successPayment, error: errorPayment } = paymentCreate as any;

    // --- LOCAL FORM STATE ---
    const [showModal, setShowModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [amount, setAmount] = useState<number>(0);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    // Additional Optional Fields
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [ifscCode, setIfscCode] = useState('');
    const [referenceId, setReferenceId] = useState('');
    const [notes, setNotes] = useState('');

    // Fetch Details on Mount
    useEffect(() => {
        if (userInfo && id) {
            dispatch(getBillDetails(id));
        }
        return () => {
            dispatch({ type: BILL_DETAILS_RESET });
        };
    }, [dispatch, id, userInfo]);

    // Sync amount default value once bill is loaded
    useEffect(() => {
        if (bill) {
            setAmount(bill.totalAmount - bill.paidAmount);
        }
    }, [bill]);

    // Handle Payment Success
    useEffect(() => {
        if (successPayment) {
            alert('Payment successfully registered!');
            setShowModal(false);
            setBankName(''); 
            setAccountNumber(''); 
            setIfscCode(''); 
            setReferenceId(''); 
            setNotes('');
            dispatch({ type: PAYMENT_CREATE_RESET });
            if (id) dispatch(getBillDetails(id)); 
        }
        if (errorPayment) {
            alert(errorPayment);
            dispatch({ type: PAYMENT_CREATE_RESET });
        }
    }, [successPayment, errorPayment, dispatch, id]);

    const handleRegisterPayment = (e: React.FormEvent) => {
        e.preventDefault();
        
        let formattedNotes = notes;
        if (paymentMethod === 'Bank Transfer') {
            const details = [
                bankName && `Bank: ${bankName}`,
                accountNumber && `A/C: ${accountNumber}`,
                ifscCode && `IFSC: ${ifscCode}`,
                referenceId && `Ref/UTR: ${referenceId}`
            ].filter(Boolean).join(' | ');
            if (details) formattedNotes = `[${details}] ${notes}`;
        } else if (paymentMethod === 'Cheque') {
            const details = [
                bankName && `Bank: ${bankName}`,
                referenceId && `Cheque No: ${referenceId}`
            ].filter(Boolean).join(' | ');
            if (details) formattedNotes = `[${details}] ${notes}`;
        } else if (paymentMethod === 'UPI' && referenceId) {
            formattedNotes = `[UPI Ref: ${referenceId}] ${notes}`;
        }

        const paymentData = {
            contact: bill.vendor._id,
            paymentType: 'outbound',
            amount,
            paymentDate,
            paymentMethod,
            linkedBill: bill._id,
            notes: formattedNotes
        };

        dispatch(createPayment(paymentData));
    };

    if (loading) return <div className={styles['spinner-container']}><div className={`${styles.spinner} ${styles['spinner--large']}`}></div></div>;
    if (error) return <div className={styles.container} style={{ paddingTop: '2rem' }}><div className={`${styles.alert} ${styles['alert--error']}`}>{error}</div></div>;
    if (!bill) return <div className={styles.container} style={{ paddingTop: '2rem' }}><h4>Bill not found</h4></div>;

    const balanceDue = bill.totalAmount - bill.paidAmount;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <div className={styles['title-group']}>
                        <h1 className={styles['page-title']}>Vendor Bill: {bill.billNumber}</h1>
                        <span className={`${styles.badge} ${
                            bill.status === 'paid' ? styles['badge--success'] :
                            bill.status === 'partially_paid' ? styles['badge--warning'] : styles['badge--neutral']
                        }`}>
                            {bill.status.replace('_', ' ')}
                        </span>
                    </div>
                    <button
                        onClick={() => dispatch(downloadAdminBill(bill._id, bill.billNumber))}
                        className={`${styles.btn} ${styles['btn-outline']}`}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download PDF
                    </button>
                </header>

                <div className={styles['summary-card']}>
                    <div>
                        <div className={styles['amount-due-label']}>Amount Due</div>
                        <h2 className={styles['amount-due-value']}>₹{balanceDue.toFixed(2)}</h2>
                        <div className={styles['amount-breakdown']}>
                            Total: ₹{bill.totalAmount.toFixed(2)} &nbsp;|&nbsp; Paid: ₹{bill.paidAmount.toFixed(2)}
                        </div>
                    </div>

                    {balanceDue > 0 && !showModal && (
                        <button 
                            onClick={() => setShowModal(true)} 
                            className={`${styles.btn} ${styles['btn-success']}`}
                        >
                            Register Payment
                        </button>
                    )}
                </div>

                {showModal && (
                    <div className={styles['payment-form-box']}>
                        <h3 className={styles['payment-form-title']}>Register Outbound Payment</h3>
                        <form onSubmit={handleRegisterPayment}>

                            <div className={styles['form-grid-3']}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Payment Date</label>
                                    <input type="date" className={styles.input} value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Payment Method</label>
                                    <select className={styles.select} value={paymentMethod} onChange={e => {
                                        setPaymentMethod(e.target.value);
                                        setBankName(''); setAccountNumber(''); setIfscCode(''); setReferenceId('');
                                    }} required>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="UPI">UPI</option>
                                    </select>
                                </div>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Amount (₹)</label>
                                    <input type="number" step="0.01" max={balanceDue} className={styles.input} value={amount} onChange={e => setAmount(Number(e.target.value))} required />
                                </div>
                            </div>

                            {/* DYNAMIC FIELDS based on Payment Method */}
                            {paymentMethod === 'Bank Transfer' && (
                                <div className={styles['nested-fields-box']}>
                                    <div className={styles['form-grid-2']}>
                                        <div className={styles['form-group']}>
                                            <label className={styles.label}>Bank Name <span className={styles['label-optional']}>(Optional)</span></label>
                                            <input type="text" className={styles.input} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. HDFC Bank" />
                                        </div>
                                        <div className={styles['form-group']}>
                                            <label className={styles.label}>Account Number <span className={styles['label-optional']}>(Optional)</span></label>
                                            <input type="text" className={styles.input} value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="e.g. 50100..." />
                                        </div>
                                        <div className={styles['form-group']}>
                                            <label className={styles.label}>IFSC Code <span className={styles['label-optional']}>(Optional)</span></label>
                                            <input type="text" className={styles.input} value={ifscCode} onChange={e => setIfscCode(e.target.value)} placeholder="e.g. HDFC0001234" />
                                        </div>
                                        <div className={styles['form-group']}>
                                            <label className={styles.label}>Transaction ID / UTR <span className={styles['label-optional']}>(Optional)</span></label>
                                            <input type="text" className={styles.input} value={referenceId} onChange={e => setReferenceId(e.target.value)} placeholder="e.g. TXN123456" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'Cheque' && (
                                <div className={styles['nested-fields-box']}>
                                    <div className={styles['form-grid-2']}>
                                        <div className={styles['form-group']}>
                                            <label className={styles.label}>Bank Name <span className={styles['label-optional']}>(Optional)</span></label>
                                            <input type="text" className={styles.input} value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. SBI" />
                                        </div>
                                        <div className={styles['form-group']}>
                                            <label className={styles.label}>Cheque Number <span className={styles['label-optional']}>(Optional)</span></label>
                                            <input type="text" className={styles.input} value={referenceId} onChange={e => setReferenceId(e.target.value)} placeholder="e.g. 000123" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentMethod === 'UPI' && (
                                <div className={styles['nested-fields-box']}>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>UPI Reference ID <span className={styles['label-optional']}>(Optional)</span></label>
                                        <input type="text" className={styles.input} value={referenceId} onChange={e => setReferenceId(e.target.value)} placeholder="e.g. 123456789012" />
                                    </div>
                                </div>
                            )}

                            <div className={styles['form-group']}>
                                <label className={styles.label}>Additional Notes</label>
                                <textarea className={styles.textarea} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any other details..." />
                            </div>

                            <div className={styles['action-row']}>
                                <button type="button" onClick={() => setShowModal(false)} className={`${styles.btn} ${styles['btn-secondary']}`}>
                                    Cancel
                                </button>
                                <button type="submit" className={`${styles.btn} ${styles['btn-success']}`} disabled={loadingPayment}>
                                    {loadingPayment ? <><div className={styles.spinner}></div> Processing...</> : 'Confirm Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* --- BILL DETAILS CARD --- */}
                <div className={styles.card}>
                    <h2 className={styles['card-title']}>Invoice Details</h2>
                    
                    <div className={styles['info-grid']}>
                        <div className={styles['info-group']}>
                            <span className={styles.label}>Vendor</span>
                            <span className={styles['info-value']}>{bill.vendor?.name}</span>
                        </div>
                        <div className={styles['info-group']}>
                            <span className={styles.label}>Linked PO</span>
                            <span className={styles['info-value']}>{bill.purchaseOrder?.orderNumber || 'N/A'}</span>
                        </div>
                        <div className={styles['info-group']}>
                            <span className={styles.label}>Invoice & Due Date</span>
                            <span className={styles['info-value']}>
                                {new Date(bill.invoiceDate).toLocaleDateString()} — {new Date(bill.dueDate).toLocaleDateString()}
                            </span>
                        </div>
                    </div>

                    <div className={styles['table-responsive']}>
                        <table className={styles['admin-table']}>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>SKU</th>
                                    <th className={styles['align-center']}>Qty</th>
                                    <th className={styles['align-right']}>Unit Price</th>
                                    <th className={styles['align-right']}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bill.items.map((item: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className={styles['fw-bold']}>{item.product?.productName || 'Unknown Product'}</td>
                                        <td className={styles['text-muted']}>{item.sku}</td>
                                        <td className={styles['align-center']}>{item.quantity}</td>
                                        <td className={styles['align-right']}>₹{item.unitPrice.toFixed(2)}</td>
                                        <td className={`${styles['text-price']} ${styles['align-right']}`}>₹{item.totalAmount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    );
};

export default AdminVendorBillDetailsPage;