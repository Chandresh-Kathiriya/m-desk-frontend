import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { showErrorAlert, showSuccessAlert, showToast } from '../../../common/utils/alertUtils';
import { RootState } from '../../../store/reducers';
import { listUsers, createUser } from '../../../store/actions/admin/userActions';
import { listAdminProducts } from '../../../store/actions/admin/productActions';
import { createManualOrder } from '../../../store/actions/admin/orderActions';
import { ORDER_CREATE_MANUAL_RESET } from '../../../store/constants/admin/orderConstants';
import { USER_CREATE_RESET } from '../../../store/constants/admin/userConstants';

import ContactFormDialog from '../../../common/components/ContactFormDialog';

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

    const userCreate = useSelector((state: RootState) => state.userCreate || {});
    const { loading: isCreatingCustomer, success: successCreateUser, user: createdUser, error: errorCreateUser } = userCreate as any;

    const productList = useSelector((state: RootState) => state.productList || {});
    const { products: productsList = [], loading: loadingProducts, error: errorProducts } = productList as any;

    const orderCreateManual = useSelector((state: RootState) => state.orderCreateManual || {});
    const { loading: isSubmitting, success, error: errorCreate } = orderCreateManual as any;

    // --- OVERALL ORDER STATE ---
    const [selectedUser, setSelectedUser] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('done');
    const [paymentTerms, setPaymentTerms] = useState(0);
    const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);

    // --- ADDRESS STATES ---
    const [shippingAddress, setShippingAddress] = useState({ address: '', city: '', postalCode: '', country: '' });
    const [billingAddress, setBillingAddress] = useState({ address: '', city: '', postalCode: '', country: '' });
    const [sameAsShipping, setSameAsShipping] = useState(true);

    // --- CURRENT ITEM SELECTION STATE ---
    const [currentProduct, setCurrentProduct] = useState('');
    const [currentVariantSku, setCurrentVariantSku] = useState('');
    const [currentQty, setCurrentQty] = useState(1);

    // --- CART / ORDER ITEMS ARRAY ---
    const [orderItems, setOrderItems] = useState<any[]>([]);

    const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

    useEffect(() => {
        if (!userInfo || !userInfo.token) {
            navigate('/admin/login');
            return;
        }
        dispatch(listUsers());
        dispatch(listAdminProducts());
    }, [dispatch, userInfo, navigate]);

    // --- AUTO-POPULATE ADDRESS WHEN USER IS SELECTED ---
    useEffect(() => {
        if (selectedUser && selectedUser !== 'CREATE_NEW') {
            const user = usersList.find((u: any) => u._id === selectedUser);
            if (user && user.address) {
                const defaultAddress = {
                    address: user.address.address || '',
                    city: user.address.city || '',
                    postalCode: user.address.pincode || '',
                    country: user.address.state || 'India'
                };
                setShippingAddress(defaultAddress);
                if (sameAsShipping) {
                    setBillingAddress(defaultAddress);
                }
            }
        } else {
            setShippingAddress({ address: '', city: '', postalCode: '', country: '' });
            setBillingAddress({ address: '', city: '', postalCode: '', country: '' });
        }
    }, [selectedUser, usersList, sameAsShipping]);

    // --- HANDLE MANUAL ORDER CREATION RESULT ---
    useEffect(() => {
        if (success) {
            showToast(`Manual order created successfully!`, 'success');
            dispatch({ type: ORDER_CREATE_MANUAL_RESET });
            navigate('/admin/orders');
        }
        if (errorCreate) {
            showErrorAlert(`Failed to create order: ${errorCreate}`);
            dispatch({ type: ORDER_CREATE_MANUAL_RESET });
        }
    }, [success, errorCreate, dispatch, navigate]);

    // --- HANDLE CUSTOMER CREATION RESULT ---
    useEffect(() => {
        if (successCreateUser) {
            setIsCustomerDialogOpen(false);
            showSuccessAlert('Customer Created Successfully!', 'Their default password is: ManualUser@123');
            
            // Re-fetch list and auto-select the new user
            dispatch(listUsers());
            if (createdUser && (createdUser.id || createdUser._id)) {
                setSelectedUser(createdUser.id || createdUser._id);
            }
            dispatch({ type: USER_CREATE_RESET });
        }
        if (errorCreateUser) {
            showErrorAlert('Failed to create customer', errorCreateUser);
            dispatch({ type: USER_CREATE_RESET });
        }
    }, [successCreateUser, errorCreateUser, createdUser, dispatch]);

    const selectedProductData = productsList.find((p: any) => p._id === currentProduct);
    const selectedVariantData = selectedProductData?.variants?.find((v: any) => v.sku === currentVariantSku);

    // --- ADD ITEM TO CART LOGIC ---
    const handleAddItem = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!currentProduct || !currentVariantSku || currentQty < 1) {
            return showToast("Please select a product, variant, and valid quantity.", "error");
        }

        if (selectedVariantData.stock < currentQty) {
            return showToast(`Cannot add more than available stock (${selectedVariantData.stock}).`, "error");
        }

        const basePrice = Number(selectedVariantData.salesPrice) || 0;
        const taxPercent = Number(selectedVariantData.salesTax) || 0;
        const unitPriceWithTax = basePrice + (basePrice * (taxPercent / 100));

        const existingIndex = orderItems.findIndex(item => item.sku === currentVariantSku);

        if (existingIndex >= 0) {
            const updatedItems = [...orderItems];
            const newQty = updatedItems[existingIndex].qty + currentQty;

            if (newQty > updatedItems[existingIndex].maxStock) {
                return showToast(`Cannot add more. Maximum stock available is ${updatedItems[existingIndex].maxStock}.`, 'error');
            }

            updatedItems[existingIndex].qty = newQty;
            setOrderItems(updatedItems);
        } else {
            setOrderItems([...orderItems, {
                product: selectedProductData._id,
                name: selectedProductData.productName,
                image: selectedProductData.images?.[0]?.url || '',
                price: basePrice,
                unitPriceWithTax: unitPriceWithTax,
                qty: currentQty,
                sku: selectedVariantData.sku,
                color: selectedVariantData.color,
                size: selectedVariantData.size,
                maxStock: selectedVariantData.stock
            }]);
        }
        setCurrentProduct(''); setCurrentVariantSku(''); setCurrentQty(1);
    };

    // --- IN-TABLE QUANTITY CONTROLS ---
    const handleIncreaseQty = (index: number) => {
        const updatedItems = [...orderItems];
        if (updatedItems[index].qty < updatedItems[index].maxStock) {
            updatedItems[index].qty += 1;
            setOrderItems(updatedItems);
        }
    };

    const handleDecreaseQty = (index: number) => {
        const updatedItems = [...orderItems];
        if (updatedItems[index].qty > 1) {
            updatedItems[index].qty -= 1;
            setOrderItems(updatedItems);
        }
    };

    const handleRemoveItem = (indexToRemove: number) => {
        setOrderItems(orderItems.filter((_, index) => index !== indexToRemove));
    };

    const grandTotal = orderItems.reduce((acc, item) => acc + (item.unitPriceWithTax * item.qty), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUser) {
            return showToast("Please select a customer.", "error");
        }

        if (orderItems.length === 0) {
            return showToast("Please add at least one product to the order.", "error");
        }

        if (!invoiceDate) {
            return showToast("Please select an invoice date.", "error");
        }

        if (!shippingAddress.address || !shippingAddress.city) {
            return showToast("Please provide a valid Shipping Address and City.", "error");
        }

        const isPaid = paymentStatus === 'done';
        const adminId = userInfo?.id || userInfo?._id;

        const orderPayload = {
            user: selectedUser,
            invoiceDate,
            createdBy: adminId,
            orderItems: orderItems.map(item => ({
                product: item.product, name: item.name, image: item.image, price: item.price,
                qty: item.qty, sku: item.sku, color: item.color, size: item.size
            })),
            shippingAddress: shippingAddress,
            billingAddress: sameAsShipping ? shippingAddress : billingAddress,
            paymentMethod: 'Cash',
            itemsPrice: grandTotal,
            shippingPrice: 0,
            totalPrice: grandTotal,
            isPaid: isPaid,
            paidAt: isPaid ? new Date(invoiceDate) : null,
            paymentTerms: !isPaid ? Number(paymentTerms) : 0,
            isManualEntry: true
        };

        dispatch(createManualOrder(orderPayload));
    };

    const handleCustomerDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'CREATE_NEW') {
            setIsCustomerDialogOpen(true);
            setSelectedUser('');
        } else {
            setSelectedUser(e.target.value);
        }
    };

    const handleCreateCustomerSubmit = (formData: any) => {
        const payload = {
            name: formData.name, 
            email: formData.email, 
            mobile: formData.mobile, 
            password: 'ManualUser@123',
            city: formData.address.city, 
            state: formData.address.state, 
            pincode: formData.address.pincode, 
            role: 'customer'
        };
        dispatch(createUser(payload));
    };

    const isPageLoading = loadingUsers || loadingProducts;
    if (isPageLoading) return <div className={styles['page-wrapper']}><div style={{ textAlign: 'center', padding: '50px' }}>Loading configuration...</div></div>;

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>

                <header className={styles.header}>
                    <Link to="/admin/orders" className={styles['back-link']}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        Back to Orders
                    </Link>
                    <h1 className={styles['page-title']}>Create Manual Order</h1>
                </header>

                {(errorUsers || errorProducts) && <div style={{ color: 'red', marginBottom: '1rem' }}>{errorUsers || errorProducts}</div>}

                <div className={styles.card}>
                    <form onSubmit={handleSubmit} className={styles['form-layout']}>

                        {/* 1. Customer & Invoice Date Selection */}
                        <div className={styles['form-row']}>
                            <div className={styles['form-group']} style={{ flex: 2 }}>
                                <label className={styles.label}>Select Customer</label>
                                <select required className={styles.select} value={selectedUser} onChange={handleCustomerDropdownChange}>
                                    <option value="">-- Choose Customer --</option>
                                    <option value="CREATE_NEW" style={{ fontWeight: 'bold', color: 'var(--color-primary-600)' }}>+ Create New Customer</option>
                                    {usersList.map((u: any) => <option key={u._id} value={u._id}>{u.name} ({u.email || u.mobile})</option>)}
                                </select>
                            </div>
                            <div className={styles['form-group']} style={{ flex: 1 }}>
                                <label className={styles.label}>Invoice Date</label>
                                <input type="date" required className={styles.input} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
                            </div>
                        </div>

                        <hr className={styles.divider} />

                        {/* ADDRESS SECTION */}
                        <div className={styles['product-adder-section']} style={{ backgroundColor: '#fff' }}>
                            <h3 className={styles['section-title']}>Shipping Details</h3>
                            <div className={styles['form-row']}>
                                <div className={styles['form-group']} style={{ flex: 2 }}>
                                    <label className={styles.label}>Street Address</label>
                                    <input type="text" required className={styles.input} placeholder="123 Main St, Apt 4B"
                                        value={shippingAddress.address} onChange={e => setShippingAddress({ ...shippingAddress, address: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles['form-row']}>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label className={styles.label}>City</label>
                                    <input type="text" required className={styles.input} placeholder="City"
                                        value={shippingAddress.city} onChange={e => setShippingAddress({ ...shippingAddress, city: e.target.value })} />
                                </div>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label className={styles.label}>State / Country</label>
                                    <input type="text" required className={styles.input} placeholder="State / Country"
                                        value={shippingAddress.country} onChange={e => setShippingAddress({ ...shippingAddress, country: e.target.value })} />
                                </div>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label className={styles.label}>Pincode / ZIP</label>
                                    <input type="text" required className={styles.input} placeholder="ZIP Code"
                                        value={shippingAddress.postalCode} onChange={e => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })} />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                                    <input
                                        type="checkbox"
                                        checked={sameAsShipping}
                                        onChange={(e) => setSameAsShipping(e.target.checked)}
                                        style={{ width: '16px', height: '16px' }}
                                    />
                                    Billing/Invoice Address is the same as Shipping
                                </label>
                            </div>

                            {!sameAsShipping && (
                                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem', marginTop: '1rem' }}>
                                    <h3 className={styles['section-title']} style={{ fontSize: '16px' }}>Billing Address</h3>
                                    <div className={styles['form-row']}>
                                        <div className={styles['form-group']} style={{ flex: 2 }}>
                                            <label className={styles.label}>Street Address</label>
                                            <input type="text" required={!sameAsShipping} className={styles.input} placeholder="123 Main St, Apt 4B"
                                                value={billingAddress.address} onChange={e => setBillingAddress({ ...billingAddress, address: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className={styles['form-row']}>
                                        <div className={styles['form-group']} style={{ flex: 1 }}>
                                            <label className={styles.label}>City</label>
                                            <input type="text" required={!sameAsShipping} className={styles.input} placeholder="City"
                                                value={billingAddress.city} onChange={e => setBillingAddress({ ...billingAddress, city: e.target.value })} />
                                        </div>
                                        <div className={styles['form-group']} style={{ flex: 1 }}>
                                            <label className={styles.label}>State / Country</label>
                                            <input type="text" required={!sameAsShipping} className={styles.input} placeholder="State / Country"
                                                value={billingAddress.country} onChange={e => setBillingAddress({ ...billingAddress, country: e.target.value })} />
                                        </div>
                                        <div className={styles['form-group']} style={{ flex: 1 }}>
                                            <label className={styles.label}>Pincode / ZIP</label>
                                            <input type="text" required={!sameAsShipping} className={styles.input} placeholder="ZIP Code"
                                                value={billingAddress.postalCode} onChange={e => setBillingAddress({ ...billingAddress, postalCode: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className={styles.divider} />

                        {/* 2. Add Product Section */}
                        <div className={styles['product-adder-section']}>
                            <h3 className={styles['section-title']}>Add Products</h3>
                            <div className={styles['form-row']}>
                                <div className={styles['form-group']} style={{ flex: 2 }}>
                                    <label className={styles.label}>Product</label>
                                    <select className={styles.select} value={currentProduct} onChange={(e) => { setCurrentProduct(e.target.value); setCurrentVariantSku(''); }}>
                                        <option value="">-- Choose Product --</option>
                                        {productsList.map((p: any) => <option key={p._id} value={p._id}>{p.productName}</option>)}
                                    </select>
                                </div>
                                <div className={styles['form-group']} style={{ flex: 2 }}>
                                    <label className={styles.label}>Variant</label>
                                    <select className={styles.select} value={currentVariantSku} onChange={(e) => setCurrentVariantSku(e.target.value)} disabled={!currentProduct}>
                                        <option value="">-- Choose Color & Size --</option>
                                        {selectedProductData?.variants?.map((v: any) => (
                                            <option key={v.sku} value={v.sku} disabled={v.stock < 1}>
                                                {v.color} - {v.size} {v.stock < 1 ? '(Out of Stock)' : `(Stock: ${v.stock})`} - ₹{v.salesPrice}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className={styles['form-group']} style={{ flex: 1 }}>
                                    <label className={styles.label}>Qty</label>
                                    <input type="number" min="1" max={selectedVariantData?.stock || 1} className={styles.input} value={currentQty} onChange={(e) => setCurrentQty(Number(e.target.value))} disabled={!currentVariantSku} />
                                </div>
                                <div className={styles['form-group']} style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <button className={`${styles.btn} ${styles['btn-secondary']}`} onClick={handleAddItem} disabled={!currentVariantSku} style={{ height: '42px', padding: '0 20px' }}>Add Item</button>
                                </div>
                            </div>
                        </div>

                        {/* 3. Added Items Table */}
                        {orderItems.length > 0 && (
                            <div className={styles['table-wrapper']}>
                                <table className={styles.table}>
                                    <thead>
                                        <tr>
                                            <th className={styles.th}>Product</th>
                                            <th className={styles.th}>Variant</th>
                                            <th className={styles.th}>Price (Inc. Tax)</th>
                                            <th className={styles.th} style={{ textAlign: 'center' }}>Qty</th>
                                            <th className={styles.th}>Total</th>
                                            <th className={styles.th}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orderItems.map((item, index) => (
                                            <tr key={`${item.sku}-${index}`}>
                                                <td className={styles.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        {item.image && <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                                                        <span style={{ fontWeight: 500 }}>{item.name}</span>
                                                    </div>
                                                </td>
                                                <td className={styles.td}>{item.color} - {item.size}<br /><span style={{ fontSize: '12px', color: '#6b7280' }}>SKU: {item.sku}</span></td>
                                                <td className={styles.td}>₹{item.unitPriceWithTax.toFixed(2)}</td>

                                                <td className={styles.td}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDecreaseQty(index)}
                                                            disabled={item.qty <= 1}
                                                            style={{
                                                                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                border: '1px solid #cbd5e1', borderRadius: '4px', background: item.qty <= 1 ? '#f1f5f9' : '#fff',
                                                                cursor: item.qty <= 1 ? 'not-allowed' : 'pointer', fontSize: '16px', color: item.qty <= 1 ? '#94a3b8' : '#0f172a'
                                                            }}
                                                        >
                                                            -
                                                        </button>
                                                        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '500' }}>{item.qty}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleIncreaseQty(index)}
                                                            disabled={item.qty >= item.maxStock}
                                                            style={{
                                                                width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                border: '1px solid #cbd5e1', borderRadius: '4px', background: item.qty >= item.maxStock ? '#f1f5f9' : '#fff',
                                                                cursor: item.qty >= item.maxStock ? 'not-allowed' : 'pointer', fontSize: '16px', color: item.qty >= item.maxStock ? '#94a3b8' : '#0f172a'
                                                            }}
                                                            title={item.qty >= item.maxStock ? `Max stock is ${item.maxStock}` : ''}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>

                                                <td className={styles.td} style={{ fontWeight: 'bold' }}>₹{(item.unitPriceWithTax * item.qty).toFixed(2)}</td>
                                                <td className={styles.td}>
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className={styles['remove-btn']} title="Remove item">&times;</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                                        checked={paymentStatus === 'done'} 
                                        onChange={() => { setPaymentStatus('done'); setPaymentTerms(0); }} 
                                    />
                                    Paid Immediately
                                </label>
                                <label className={styles['radio-label']}>
                                    <input 
                                        type="radio" 
                                        className={styles['radio-input']}
                                        checked={paymentStatus === 'pending'} 
                                        onChange={() => setPaymentStatus('pending')} 
                                    />
                                    Pending (Credit Terms)
                                </label>
                            </div>
                        </div>

                        {paymentStatus === 'pending' && (
                            <div className={styles['warning-box']}>
                                <label className={styles['warning-label']}>Payment Terms (Days)</label>
                                <input type="number" required min="0" max="365" placeholder="e.g. 30" className={styles.input} value={paymentTerms} onChange={(e) => setPaymentTerms(Number(e.target.value))} />
                                <span className={styles['warning-text']}>Order will be marked unpaid. Payment expected in {paymentTerms} days.</span>
                            </div>
                        )}

                        <div className={styles['summary-box']}>
                            <span className={styles['summary-label']}>Total Amount to Bill:</span>
                            <h3 className={styles['summary-value']}>₹{grandTotal.toFixed(2)}</h3>
                        </div>

                        <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} disabled={isSubmitting || orderItems.length === 0}>
                            {isSubmitting ? 'Processing Order...' : 'Generate Manual Order'}
                        </button>

                    </form>
                </div>
            </div>

            <ContactFormDialog
                isOpen={isCustomerDialogOpen}
                onClose={() => setIsCustomerDialogOpen(false)}
                onSubmit={handleCreateCustomerSubmit}
                isProcessing={isCreatingCustomer}
                title="Create New Customer"
            />

        </main>
    );
};

export default AdminOrderCreatePage;