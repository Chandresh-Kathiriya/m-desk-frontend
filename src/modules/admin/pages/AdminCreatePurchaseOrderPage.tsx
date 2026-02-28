import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { listContacts } from '../../../store/actions/admin/contactActions';
import { listAdminProducts } from '../../../store/actions/admin/productActions'; 
import { createPurchaseOrder } from '../../../store/actions/admin/purchaseActions';
import { PURCHASE_CREATE_RESET } from '../../../store/constants/admin/purchaseConstants';

import styles from '../../../schemas/css/AdminCreatePurchaseOrderPage.module.css';

const AdminCreatePurchaseOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();

    // --- REDUX STATES ---
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const contactList = useSelector((state: RootState) => state.contactList || {});
    const { contacts = [], loading: loadingContacts, error: errorContacts } = contactList as any;

    const productList = useSelector((state: RootState) => state.productList || {});
    const { products = [], loading: loadingProducts, error: errorProducts } = productList as any;

    const purchaseCreate = useSelector((state: RootState) => state.purchaseCreate || {});
    const { loading: loadingCreate, success, purchase, error: errorCreate } = purchaseCreate as any;

    // --- LOCAL FORM STATE ---
    const [vendor, setVendor] = useState('');
    const [items, setItems] = useState<any[]>([{ product: '', sku: '', quantity: 1, unitPrice: 0, tax: 0, totalAmount: 0 }]);

    // Initial Data Fetch
    useEffect(() => {
        if (userInfo && userInfo.token) {
            dispatch(listContacts());
            dispatch(listAdminProducts()); 
        }
    }, [dispatch, userInfo]);

    // Handle Successful PO Creation
    useEffect(() => {
        if (success && purchase) {
            dispatch({ type: PURCHASE_CREATE_RESET });
            navigate(`/admin/purchase/${purchase._id}`); // Jump directly to details to confirm
        }
        if (errorCreate) {
            alert(`Failed to create PO: ${errorCreate}`);
            dispatch({ type: PURCHASE_CREATE_RESET });
        }
    }, [success, purchase, errorCreate, navigate, dispatch]);

    // Filter contacts to get only vendors
    const vendors = contacts.filter((c: any) => c.type === 'vendor' || c.type === 'both');
    const isPageLoading = loadingContacts || loadingProducts;
    const pageError = errorContacts || errorProducts;

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index][field] = value;

        // Auto-fill SKU and Price if product changes
        if (field === 'product') {
            const selectedProduct = products.find((p: any) => p._id === value);
            if (selectedProduct && selectedProduct.variants?.length > 0) {
                newItems[index].sku = selectedProduct.variants[0].sku;
                newItems[index].unitPrice = selectedProduct.variants[0].purchasePrice || 0;
                newItems[index].tax = selectedProduct.variants[0].purchaseTax || 0;
            }
        }

        // Recalculate Total
        const qty = Number(newItems[index].quantity) || 0;
        const price = Number(newItems[index].unitPrice) || 0;
        const tax = Number(newItems[index].tax) || 0;
        newItems[index].totalAmount = (qty * price) * (1 + (tax / 100));

        setItems(newItems);
    };

    const addItemRow = () => {
        setItems([...items, { product: '', sku: '', quantity: 1, unitPrice: 0, tax: 0, totalAmount: 0 }]);
    };

    const removeItemRow = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems.length ? newItems : [{ product: '', sku: '', quantity: 1, unitPrice: 0, tax: 0, totalAmount: 0 }]);
    };

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(createPurchaseOrder({ vendor, items }));
    };

    const cartTotal = items.reduce((acc, item) => acc + item.totalAmount, 0);

    if (isPageLoading) return <div className={styles['spinner-container']}><div className={`${styles.spinner} ${styles['spinner--large']}`}></div></div>;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                <h1 className={styles['page-title']}>Create Purchase Order</h1>
                
                {pageError && (
                    <div className={`${styles.alert} ${styles['alert--error']}`}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{pageError}</span>
                    </div>
                )}

                <form onSubmit={submitHandler} className={styles.card}>
                    
                    {/* --- VENDOR SELECTION --- */}
                    <div className={styles['form-group']}>
                        <label className={styles.label}>Select Vendor</label>
                        <select className={styles.select} value={vendor} onChange={(e) => setVendor(e.target.value)} required>
                            <option value="">-- Choose a Vendor --</option>
                            {vendors.map((v: any) => <option key={v._id} value={v._id}>{v.name} ({v.email})</option>)}
                        </select>
                    </div>

                    {/* --- ITEMS TABLE --- */}
                    <h2 className={styles['section-title']}>Order Items</h2>
                    
                    <div className={styles['table-responsive']}>
                        <table className={styles['po-table']}>
                            <thead>
                                <tr>
                                    <th style={{ width: '25%' }}>Product</th>
                                    <th style={{ width: '25%' }}>Variant (SKU)</th>
                                    <th style={{ width: '10%' }}>Qty</th>
                                    <th style={{ width: '12%' }}>Unit Price</th>
                                    <th style={{ width: '10%' }}>Tax %</th>
                                    <th style={{ width: '13%' }}>Total</th>
                                    <th style={{ width: '5%', textAlign: 'center' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => {
                                    const selectedProduct = products.find((p: any) => p._id === item.product);
                                    return (
                                        <tr key={index}>
                                            <td>
                                                <select className={`${styles.select} ${styles['select-sm']}`} value={item.product} onChange={(e) => handleItemChange(index, 'product', e.target.value)} required>
                                                    <option value="">Select Product...</option>
                                                    {products.map((p: any) => <option key={p._id} value={p._id}>{p.productName}</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <select className={`${styles.select} ${styles['select-sm']}`} value={item.sku} onChange={(e) => handleItemChange(index, 'sku', e.target.value)} required disabled={!item.product}>
                                                    <option value="">Select SKU...</option>
                                                    {selectedProduct?.variants?.map((v: any) => <option key={v.sku} value={v.sku}>{v.color} - {v.size} ({v.sku})</option>)}
                                                </select>
                                            </td>
                                            <td>
                                                <input type="number" min="1" className={`${styles.input} ${styles['input-sm']}`} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
                                            </td>
                                            <td>
                                                <input type="number" step="0.01" className={`${styles.input} ${styles['input-sm']}`} value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} required />
                                            </td>
                                            <td>
                                                <input type="number" step="0.01" className={`${styles.input} ${styles['input-sm']}`} value={item.tax} onChange={(e) => handleItemChange(index, 'tax', e.target.value)} required />
                                            </td>
                                            <td style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-neutral-900)' }}>
                                                ₹{item.totalAmount.toFixed(2)}
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button type="button" className={styles['btn-remove-row']} onClick={() => removeItemRow(index)} title="Remove Item">
                                                    &times;
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    <button type="button" className={`${styles.btn} ${styles['btn-dashed']}`} onClick={addItemRow}>
                        + Add Another Item
                    </button>

                    {/* --- SUMMARY & SUBMIT --- */}
                    <div className={styles['po-summary']}>
                        <div className={styles['po-total-box']}>
                            <span className={styles['po-total-label']}>Total Amount:</span>
                            <span className={styles['po-total-value']}>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        
                        <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} style={{ minWidth: '220px' }} disabled={loadingCreate}>
                            {loadingCreate ? (
                                <><div className={`${styles.spinner} ${styles['spinner--light']}`}></div> Processing...</>
                            ) : (
                                'Save Draft PO'
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
};

export default AdminCreatePurchaseOrderPage;