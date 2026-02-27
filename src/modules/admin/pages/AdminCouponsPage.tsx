import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { RootState } from '../../../store/reducers';
import { 
    listDiscountOffers, 
    listDiscountCoupons, 
    createDiscountOffer, 
    createDiscountCoupon 
} from '../../../store/actions/admin/discountActions';
import { listContacts } from '../../../store/actions/admin/contactActions';
import { 
    DISCOUNT_OFFER_CREATE_RESET, 
    DISCOUNT_COUPON_CREATE_RESET 
} from '../../../store/constants/admin/discountConstants';

import styles from '../../../schemas/css/AdminCouponsPage.module.css';

const AdminCouponsPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    // Redux State for Auth
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    // --- REDUX STATES ---
    const discountOfferList = useSelector((state: RootState) => state.discountOfferList || {});
    const { offers = [], loading: loadingOffers, error: errorOffers } = discountOfferList as any;

    const discountCouponList = useSelector((state: RootState) => state.discountCouponList || {});
    const { coupons = [], loading: loadingCoupons, error: errorCoupons } = discountCouponList as any;

    const contactList = useSelector((state: RootState) => state.contactList || {});
    const { contacts = [] } = contactList as any;

    const discountOfferCreate = useSelector((state: RootState) => state.discountOfferCreate || {});
    const { loading: loadingOffer, success: successOfferCreate, error: errorOfferCreate } = discountOfferCreate as any;

    const discountCouponCreate = useSelector((state: RootState) => state.discountCouponCreate || {});
    const { loading: loadingCoupon, success: successCouponCreate, error: errorCouponCreate } = discountCouponCreate as any;

    // Master Data State (Kept local to preserve your custom array mapping)
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [masterDataOptions, setMasterDataOptions] = useState<any[]>([]);

    // Form 1: Master Offer States (The Campaign)
    const [offerName, setOfferName] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState<number | ''>('');
    const [availableOn, setAvailableOn] = useState('both');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Form 2: Coupon Code States (Your Advanced Rules!)
    const [couponCode, setCouponCode] = useState('');
    const [selectedOffer, setSelectedOffer] = useState('');
    const [selectedContact, setSelectedContact] = useState('');
    const [minCartValue, setMinCartValue] = useState<number | ''>(0);
    const [applicableRules, setApplicableRules] = useState<string[]>([]);
    const [isFirstTimeUserOnly, setIsFirstTimeUserOnly] = useState(false);
    const [usageLimit, setUsageLimit] = useState<number | ''>(100);
    const [couponExpiration, setCouponExpiration] = useState('');

    const pageError = errorOffers || errorCoupons || errorOfferCreate || errorCouponCreate;
    const isPageLoading = loadingOffers || loadingCoupons || loadingMasterData;

    // 1. Initial Data Fetch
    useEffect(() => {
        const fetchMasterData = async () => {
            if (!userInfo) return;
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                
                const [catRes, brandRes, styleRes, typeRes] = await Promise.all([
                    axios.get('/api/categories', config).catch(() => ({ data: null })),
                    axios.get('/api/brands', config).catch(() => ({ data: null })),
                    axios.get('/api/styles', config).catch(() => ({ data: null })),
                    axios.get('/api/types', config).catch(() => ({ data: null }))
                ]);

                const getArray = (resData: any, key: string) => {
                    if (!resData) return [];
                    if (Array.isArray(resData)) return resData;
                    if (Array.isArray(resData[key])) return resData[key];
                    if (Array.isArray(resData.data)) return resData.data;
                    if (Array.isArray(resData.records)) return resData.records;
                    return [];
                };

                const combinedOptions = [
                    ...getArray(catRes.data, 'categories').map((item: any) => ({ ...item, group: 'Category' })),
                    ...getArray(brandRes.data, 'brands').map((item: any) => ({ ...item, group: 'Brand' })),
                    ...getArray(styleRes.data, 'styles').map((item: any) => ({ ...item, group: 'Style' })),
                    ...getArray(typeRes.data, 'types').map((item: any) => ({ ...item, group: 'Product Type' }))
                ];

                setMasterDataOptions(combinedOptions);
                setLoadingMasterData(false);
            } catch (err: any) {
                console.error('Failed to load master data', err);
                setLoadingMasterData(false);
            }
        };

        if (userInfo && userInfo.token) {
            fetchMasterData();
            // Dispatch our global Redux actions
            dispatch(listDiscountOffers());
            dispatch(listDiscountCoupons());
            dispatch(listContacts());
        }
    }, [dispatch, userInfo]);

    // 2. Handle Offer Creation Success
    useEffect(() => {
        if (successOfferCreate) {
            setOfferName(''); 
            setDiscountValue(''); 
            setStartDate(''); 
            setEndDate('');
            alert('Master Offer Created!');
            dispatch({ type: DISCOUNT_OFFER_CREATE_RESET });
            dispatch(listDiscountOffers()); // Refresh table data
        }
    }, [successOfferCreate, dispatch]);

    // 3. Handle Coupon Creation Success
    useEffect(() => {
        if (successCouponCreate) {
            setCouponCode(''); 
            setSelectedOffer(''); 
            setSelectedContact(''); 
            setMinCartValue(0); 
            setApplicableRules([]); 
            setIsFirstTimeUserOnly(false); 
            setUsageLimit(100); 
            setCouponExpiration('');
            alert('Coupon Code Generated!');
            dispatch({ type: DISCOUNT_COUPON_CREATE_RESET });
            dispatch(listDiscountCoupons()); // Refresh table data
        }
    }, [successCouponCreate, dispatch]);

    const submitOfferHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(createDiscountOffer({
            name: offerName,
            discountType,
            discountValue,
            availableOn,
            startDate,
            endDate
        }));
    };

    const submitCouponHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(createDiscountCoupon({
            code: couponCode,
            discountOfferId: selectedOffer,
            contactId: selectedContact || null,
            minCartValue,
            applicableRules,
            isFirstTimeUserOnly,
            usageLimit,
            expirationDate: couponExpiration
        }));
    };

    const getRuleDetails = (ruleIds: string[]) => {
        if (!ruleIds || !Array.isArray(ruleIds)) return [];
        return ruleIds.map(id => masterDataOptions.find(opt => opt._id === id)).filter(Boolean);
    };

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                <h1 className={styles['page-title']}>Manage Discounts & Coupons</h1>

                {pageError && <div className={`${styles.alert} ${styles['alert--error']}`}>{pageError}</div>}

                <div className={styles.layout}>
                    
                    {/* --- LEFT COLUMN: FORMS --- */}
                    <div>
                        {/* FORM 1: MASTER OFFER (Just the Campaign details) */}
                        <div className={styles.card} style={{ marginBottom: 'var(--space-6)' }}>
                            <h2 className={styles['card-title']}>1. Create Master Offer</h2>
                            <form onSubmit={submitOfferHandler}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Offer Name (e.g. Summer Sale)</label>
                                    <input type="text" className={styles.input} value={offerName} onChange={(e) => setOfferName(e.target.value)} required />
                                </div>

                                <div className={styles['form-row']}>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>Discount Type</label>
                                        <select className={styles.select} value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                                            <option value="percentage">% Off</option>
                                            <option value="flat">Flat Amount</option>
                                        </select>
                                    </div>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>Value</label>
                                        <input type="number" className={styles.input} required value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Available On</label>
                                    <select className={styles.select} value={availableOn} onChange={(e) => setAvailableOn(e.target.value)}>
                                        <option value="both">Both</option>
                                        <option value="website">Website Checkout</option>
                                        <option value="sales">Backend Sales</option>
                                    </select>
                                </div>

                                <div className={styles['form-row']}>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>Start Date</label>
                                        <input type="date" className={styles.input} required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                    </div>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>End Date</label>
                                        <input type="date" className={styles.input} required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                                    </div>
                                </div>

                                <button type="submit" className={styles['btn-submit']} disabled={loadingOffer}>
                                    {loadingOffer ? <div className={`${styles.spinner} ${styles['spinner--light']}`}></div> : 'Create Program'}
                                </button>
                            </form>
                        </div>

                        {/* FORM 2: COUPON CODE (Your Advanced Rules!) */}
                        <div className={styles.card}>
                            <h2 className={styles['card-title']}>2. Generate Coupon Code</h2>
                            <form onSubmit={submitCouponHandler}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Coupon Code</label>
                                    <input type="text" className={styles.input} placeholder="e.g. SUMMER50" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} required />
                                </div>

                                <div className={styles['form-row']}>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>Link to Master Offer</label>
                                        <select className={styles.select} value={selectedOffer} onChange={(e) => setSelectedOffer(e.target.value)} required>
                                            <option value="">-- Select Parent Offer --</option>
                                            {offers.map((o: any) => <option key={o._id} value={o._id}>{o.name}</option>)}
                                        </select>
                                    </div>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>Restrict to Contact</label>
                                        <select className={styles.select} value={selectedContact} onChange={(e) => setSelectedContact(e.target.value)}>
                                            <option value="">Any Customer</option>
                                            {contacts.map((c: any) => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Minimum Cart Value (₹)</label>
                                    <input type="number" className={styles.input} value={minCartValue} onChange={(e) => setMinCartValue(Number(e.target.value))} />
                                </div>

                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Applicable Rules (Empty = All Products)</label>
                                    <div className={styles['scroll-box']}>
                                        {loadingMasterData ? (
                                            <div className={styles['spinner-container']}><div className={styles.spinner}></div></div>
                                        ) : masterDataOptions.length === 0 ? (
                                            <span style={{color: 'var(--color-error-600)', fontSize: 'var(--text-sm)'}}>No master data found.</span>
                                        ) : (
                                            masterDataOptions.map((option: any) => (
                                                <label key={option._id} className={styles['checkbox-item']}>
                                                    <input 
                                                        type="checkbox" 
                                                        className={styles['checkbox-input']}
                                                        checked={applicableRules.includes(option._id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setApplicableRules([...applicableRules, option._id]);
                                                            else setApplicableRules(applicableRules.filter(id => id !== option._id));
                                                        }}
                                                    />
                                                    <span className={styles['checkbox-label']}>
                                                        <strong>{option.name}</strong> 
                                                        <span className={styles['checkbox-meta']}>({option.group})</span>
                                                    </span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className={styles['form-row']}>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>Usage Limit</label>
                                        <input type="number" className={styles.input} required value={usageLimit} onChange={(e) => setUsageLimit(Number(e.target.value))} />
                                    </div>
                                    <div className={styles['form-group']}>
                                        <label className={styles.label}>Code Expiry</label>
                                        <input type="date" className={styles.input} required value={couponExpiration} onChange={(e) => setCouponExpiration(e.target.value)} />
                                    </div>
                                </div>

                                <div className={styles['form-group']}>
                                    <label className={styles['switch-wrapper']}>
                                        <input 
                                            type="checkbox" 
                                            className={styles['switch-input']} 
                                            checked={isFirstTimeUserOnly}
                                            onChange={(e) => setIsFirstTimeUserOnly(e.target.checked)}
                                        />
                                        <div className={styles.switch}></div>
                                        <span className={styles['switch-label']}>First-Time Users Only</span>
                                    </label>
                                </div>

                                <button type="submit" className={styles['btn-submit']} disabled={loadingCoupon || offers.length === 0} style={{ backgroundColor: 'var(--color-primary-600)'}}>
                                    {loadingCoupon ? <div className={`${styles.spinner} ${styles['spinner--light']}`}></div> : 'Generate Code'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* --- RIGHT COLUMN: TABLES --- */}
                    <div>
                        {isPageLoading ? (
                            <div className={styles.card}><div className={styles['spinner-container']}><div className={styles.spinner}></div></div></div>
                        ) : (
                            <>
                                {/* TABLE 1: MASTER OFFERS */}
                                <div className={`${styles.card} ${styles['table-card']}`} style={{ marginBottom: 'var(--space-6)' }}>
                                    <h2 className={styles['card-title']} style={{ padding: 'var(--space-6) var(--space-6) 0', border: 'none' }}>Master Programs</h2>
                                    <div className={styles['table-responsive']}>
                                        <table className={styles['admin-table']}>
                                            <thead>
                                                <tr>
                                                    <th>Program Name</th>
                                                    <th>Discount</th>
                                                    <th>Channel</th>
                                                    <th className={styles['align-right']}>Validity</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {offers.map((o: any) => (
                                                    <tr key={o._id}>
                                                        <td><strong>{o.name}</strong></td>
                                                        <td><span className={`${styles.badge} ${styles['badge--success']}`}>{o.discountType === 'percentage' ? `${o.discountValue}% OFF` : `₹${o.discountValue} OFF`}</span></td>
                                                        <td style={{ textTransform: 'capitalize' }}>{o.availableOn}</td>
                                                        <td className={styles['align-right']} style={{ fontSize: '12px', color: 'var(--color-neutral-600)'}}>
                                                            {new Date(o.startDate).toLocaleDateString()} <br/>to {new Date(o.endDate).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {offers.length === 0 && <tr><td colSpan={4} style={{textAlign: 'center', padding: 'var(--space-6)'}}>No programs active.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* TABLE 2: ACTIVE COUPONS (Restored your custom conditions drop-down!) */}
                                <div className={`${styles.card} ${styles['table-card']}`}>
                                    <h2 className={styles['card-title']} style={{ padding: 'var(--space-6) var(--space-6) 0', border: 'none' }}>Active Coupon Codes</h2>
                                    <div className={styles['table-responsive']}>
                                        <table className={styles['admin-table']}>
                                            <thead>
                                                <tr>
                                                    <th>Code</th>
                                                    <th>Program</th>
                                                    <th>Conditions</th>
                                                    <th className={styles['align-center']}>Usage</th>
                                                    <th className={styles['align-right']}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {coupons.map((c: any) => (
                                                    <tr key={c._id}>
                                                        <td className={styles['text-code']}>
                                                            {c.code}
                                                            <div style={{fontSize: '11px', marginTop: '4px'}}>
                                                                {c.contact ? <span className={`${styles.badge} ${styles['badge--info']}`}>{c.contact.name}</span> : ''}
                                                            </div>
                                                        </td>
                                                        <td className="text-muted">{c.discountOffer?.name || 'Deleted'}</td>
                                                        <td>
                                                            {c.isFirstTimeUserOnly && <div className={`${styles.badge} ${styles['badge--info']}`} style={{marginBottom: '4px'}}>New Users</div>}
                                                            {c.minCartValue > 0 && <div style={{fontSize: '12px', marginBottom: '4px'}}>Min: ₹{c.minCartValue}</div>}
                                                            <div>
                                                                {c.applicableRules && c.applicableRules.length > 0 ? (
                                                                    <details className={styles['rules-details']}>
                                                                        <summary className={styles['rules-summary']}>{c.applicableRules.length} Rules ▾</summary>
                                                                        <div className={styles['rules-list']}>
                                                                            {getRuleDetails(c.applicableRules).map((rule: any, idx: number) => (
                                                                                <div key={idx}><strong>{rule.name}</strong></div>
                                                                            ))}
                                                                        </div>
                                                                    </details>
                                                                ) : <span className={`${styles.badge} ${styles['badge--neutral']}`}>All Products</span>}
                                                            </div>
                                                        </td>
                                                        <td className={styles['align-center']}>{c.usedCount || 0} / {c.usageLimit}</td>
                                                        <td className={styles['align-right']}>
                                                            {c.status === 'used' || (c.usedCount >= c.usageLimit) ? (
                                                                <span className={`${styles.badge} ${styles['badge--neutral']}`}>Limit Reached</span>
                                                            ) : new Date(c.expirationDate) < new Date() ? (
                                                                <span className={`${styles.badge} ${styles['badge--error']}`}>Expired</span>
                                                            ) : (
                                                                <span className={`${styles.badge} ${styles['badge--success']}`}>Active</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {coupons.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center', padding: 'var(--space-6)'}}>No coupons generated yet.</td></tr>}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
};

export default AdminCouponsPage;