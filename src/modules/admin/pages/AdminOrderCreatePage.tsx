import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listUsers } from '../../../store/actions/admin/userActions';
import { listAdminProducts } from '../../../store/actions/admin/productActions';
import { createManualOrder } from '../../../store/actions/admin/orderActions';
import { ORDER_CREATE_MANUAL_RESET } from '../../../store/constants/admin/orderConstants';

import styles from '../../../schemas/css/AdminOrderCreatePage.module.css';

const AdminOrderCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();

    // Safely grab the token whether it's stored in adminAuth or userAuth
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userAuth = useSelector((state: RootState) => state.userAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (userAuth as any).userInfo;

    // --- REDUX STATES ---
    const userList = useSelector((state: RootState) => state.userList || {});
    const { users: usersList = [], loading: loadingUsers, error: errorUsers } = userList as any;

    const productList = useSelector((state: RootState) => state.productList || {});
    const { products: productsList = [], loading: loadingProducts, error: errorProducts } = productList as any;

    const orderCreateManual = useSelector((state: RootState) => state.orderCreateManual || {});
    const { loading: isSubmitting, success, error: errorCreate } = orderCreateManual as any;

    // --- LOCAL FORM STATE ---
    const [manualOrder, setManualOrder] = useState({
        user: '',
        product: '',
        variantSku: '',
        qty: 1,
        paymentStatus: 'done', // 'done' | 'pending'
        paymentTerms: 0 // days
    });

    // 1. Initial Data Fetch
    useEffect(() => {
        if (!userInfo || !userInfo.token) {
            navigate('/admin/login');
            return;
        }

        dispatch(listUsers());
        dispatch(listAdminProducts());
    }, [dispatch, userInfo, navigate]);

    // 2. Handle Success State
    useEffect(() => {
        if (success) {
            alert("Manual order created successfully!");
            dispatch({ type: ORDER_CREATE_MANUAL_RESET });
            navigate('/admin/orders'); // Redirect back to orders list
        }
        if (errorCreate) {
            alert(`Failed to create order: ${errorCreate}`);
            dispatch({ type: ORDER_CREATE_MANUAL_RESET });
        }
    }, [success, errorCreate, dispatch, navigate]);

    const selectedProductData = productsList.find((p: any) => p._id === manualOrder.product);
    const selectedVariantData = selectedProductData?.variants?.find((v: any) => v.sku === manualOrder.variantSku);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualOrder.user || !manualOrder.product || !manualOrder.variantSku) {
            return alert("Please complete all required fields.");
        }

        const price = Number(selectedVariantData.salesPrice) || 0;
        const taxPercent = Number(selectedVariantData.salesTax) || 0;
        const baseTotal = price * manualOrder.qty;
        const finalPriceWithTax = baseTotal + (baseTotal * (taxPercent / 100));

        const isPaid = manualOrder.paymentStatus === 'done';

        const orderPayload = {
            user: manualOrder.user,
            orderItems: [{
                product: selectedProductData._id,
                name: selectedProductData.productName,
                image: selectedProductData.images?.[0]?.url || '',
                price: price,
                qty: manualOrder.qty,
                sku: selectedVariantData.sku,
                color: selectedVariantData.color,
                size: selectedVariantData.size,
            }],
            shippingAddress: { address: 'In-Store / Manual', city: 'N/A', postalCode: 'N/A', country: 'N/A' },
            paymentMethod: 'Cash',
            itemsPrice: finalPriceWithTax,
            shippingPrice: 0,
            totalPrice: finalPriceWithTax,

            isPaid: isPaid,
            paidAt: isPaid ? new Date() : null,
            paymentTerms: !isPaid ? Number(manualOrder.paymentTerms) : 0,
            isManualEntry: true
        };

        dispatch(createManualOrder(orderPayload));
    };

    const isPageLoading = loadingUsers || loadingProducts;
    const pageError = errorUsers || errorProducts;

    if (isPageLoading) {
        return <div className={styles['page-wrapper']}><div style={{ textAlign: 'center', padding: '50px' }}>Loading configuration...</div></div>;
    }

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>

                <header className={styles.header}>
                    <Link to="/admin/orders" className={styles['back-link']}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                        Back to Orders
                    </Link>
                    <h1 className={styles['page-title']}>Create Manual Order</h1>
                </header>

                {pageError && <div style={{ color: 'red', marginBottom: '1rem' }}>{pageError}</div>}

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles['form-layout']}>

                        {/* 1. Customer Selection */}
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Select Customer</label>
                            <select
                                required
                                className={styles.select}
                                value={manualOrder.user}
                                onChange={(e) => setManualOrder({ ...manualOrder, user: e.target.value })}
                            >
                                <option value="">-- Choose Customer --</option>
                                {usersList.map((u: any) => (
                                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                        </div>

                        {/* 2. Product Selection */}
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Select Product</label>
                            <select
                                required
                                className={styles.select}
                                value={manualOrder.product}
                                onChange={(e) => setManualOrder({ ...manualOrder, product: e.target.value, variantSku: '' })}
                            >
                                <option value="">-- Choose Product --</option>
                                {productsList.map((p: any) => (
                                    <option key={p._id} value={p._id}>{p.productName}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Variant & Qty Selection */}
                        {manualOrder.product && (
                            <div className={styles['form-row']}>
                                <div className={styles['form-col-2']}>
                                    <label className={styles.label}>Select Variant</label>
                                    <select
                                        required
                                        className={styles.select}
                                        value={manualOrder.variantSku}
                                        onChange={(e) => setManualOrder({ ...manualOrder, variantSku: e.target.value })}
                                    >
                                        <option value="">-- Choose Color & Size --</option>
                                        {selectedProductData?.variants?.map((v: any) => (
                                            <option key={v.sku} value={v.sku} disabled={v.stock < 1}>
                                                {v.color} - {v.size} {v.stock < 1 ? '(Out of Stock)' : `(Stock: ${v.stock})`} - ₹{v.salesPrice}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles['form-col-1']}>
                                    <label className={styles.label}>Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max={selectedVariantData?.stock || 1}
                                        className={styles.input}
                                        value={manualOrder.qty}
                                        onChange={(e) => setManualOrder({ ...manualOrder, qty: Number(e.target.value) })}
                                        disabled={!manualOrder.variantSku}
                                    />
                                </div>
                            </div>
                        )}

                        <hr className={styles.divider} />

                        {/* 4. Payment Configuration */}
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Payment Method (Default: Cash)</label>
                            <div className={styles['radio-group']}>
                                <label className={styles['radio-label']}>
                                    <input
                                        type="radio"
                                        className={styles['radio-input']}
                                        checked={manualOrder.paymentStatus === 'done'}
                                        onChange={() => setManualOrder({ ...manualOrder, paymentStatus: 'done', paymentTerms: 0 })}
                                    />
                                    Paid Immediately
                                </label>
                                <label className={styles['radio-label']}>
                                    <input
                                        type="radio"
                                        className={styles['radio-input']}
                                        checked={manualOrder.paymentStatus === 'pending'}
                                        onChange={() => setManualOrder({ ...manualOrder, paymentStatus: 'pending' })}
                                    />
                                    Pending (Credit Terms)
                                </label>
                            </div>
                        </div>

                        {manualOrder.paymentStatus === 'pending' && (
                            <div className={styles['warning-box']}>
                                <label className={styles['warning-label']}>Payment Terms (Days)</label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="365"
                                    placeholder="e.g. 30"
                                    className={styles.input}
                                    value={manualOrder.paymentTerms}
                                    onChange={(e) => setManualOrder({ ...manualOrder, paymentTerms: Number(e.target.value) })}
                                />
                                <span className={styles['warning-text']}>
                                    Order will be marked unpaid. Payment expected in {manualOrder.paymentTerms} days.
                                </span>
                            </div>
                        )}

                        {/* Summary Total */}
                        {selectedVariantData && (
                            <div className={styles['summary-box']}>
                                <span className={styles['summary-label']}>Total Amount to Bill:</span>
                                <h3 className={styles['summary-value']}>
                                    ₹{((selectedVariantData.salesPrice + (selectedVariantData.salesPrice * (selectedVariantData.salesTax / 100))) * manualOrder.qty).toFixed(2)}
                                </h3>
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`${styles.btn} ${styles['btn-primary']}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing Order...' : 'Generate Manual Order'}
                        </button>

                    </form>
                </div>
            </div>
        </main>
    );
};

export default AdminOrderCreatePage;