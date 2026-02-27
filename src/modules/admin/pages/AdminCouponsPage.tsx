import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '../../../store/reducers';
import { listCoupons, createCoupon } from '../../../store/actions/admin/couponActions';
import { COUPON_CREATE_RESET } from '../../../store/constants/admin/couponConstants';

import styles from '../../../schemas/css/AdminCouponsPage.module.css';

const AdminCouponsPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    // Redux State
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const couponList = useSelector((state: RootState) => state.couponList || {});
    const { loading: loadingCoupons, error: errorCoupons, coupons = [] } = couponList as any;

    const couponCreate = useSelector((state: RootState) => state.couponCreate || {});
    const { loading: loadingCreate, error: errorCreate, success: successCreate } = couponCreate as any;

    // Master Data State
    const [loadingMasterData, setLoadingMasterData] = useState(true);
    const [masterDataOptions, setMasterDataOptions] = useState<any[]>([]);

    // Form States
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('percentage');
    const [discountValue, setDiscountValue] = useState<number | ''>('');
    const [minCartValue, setMinCartValue] = useState<number | ''>(0);
    const [applicableRules, setApplicableRules] = useState<string[]>([]);
    const [isFirstTimeUserOnly, setIsFirstTimeUserOnly] = useState(false);
    const [usageLimit, setUsageLimit] = useState<number | ''>(100);
    const [expiryDate, setExpiryDate] = useState('');

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!userInfo) return;
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

                const [catRes, brandRes, styleRes, typeRes] = await Promise.all([
                    axios.get('/api/categories', config).catch(() => ({ data: null })),
                    axios.get('/api/brands', config).catch(() => ({ data: null })),
                    axios.get('/api/styles', config).catch(() => ({ data: null })),
                    axios.get('/api/types', config).catch(() => ({ data: null }))
                ]);

                // Aggressive Array Extractor
                const getArray = (resData: any, key: string) => {
                    if (!resData) return [];
                    if (Array.isArray(resData)) return resData;
                    if (Array.isArray(resData[key])) return resData[key];
                    if (Array.isArray(resData.data)) return resData.data;
                    if (Array.isArray(resData.records)) return resData.records;
                    if (Array.isArray(resData.items)) return resData.items;
                    if (Array.isArray(resData.list)) return resData.list;
                    return [];
                };

                const combinedOptions = [
                    ...getArray(catRes.data, 'categories').map((item: any) => ({ ...item, group: 'Category' })),
                    ...getArray(brandRes.data, 'brands').map((item: any) => ({ ...item, group: 'Brand' })),
                    ...getArray(styleRes.data, 'styles').map((item: any) => ({ ...item, group: 'Style' })),
                    ...getArray(typeRes.data, 'types').map((item: any) => ({ ...item, group: 'Product Type' }))
                ];

                setMasterDataOptions(combinedOptions);
                dispatch(listCoupons()); 
                setLoadingMasterData(false);
            } catch (error) {
                setMasterDataOptions([]);
                setLoadingMasterData(false);
            }
        };
        fetchInitialData();
    }, [userInfo, dispatch]);

    useEffect(() => {
        if (successCreate) {
            alert('Coupon created successfully!');
            setCode(''); 
            setDiscountValue(''); 
            setExpiryDate('');
            setApplicableRules([]);
            dispatch({ type: COUPON_CREATE_RESET });
            dispatch(listCoupons()); 
        }
    }, [successCreate, dispatch]);

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(createCoupon({
            code, discountType, discountValue, minCartValue,
            applicableRules, isFirstTimeUserOnly, usageLimit, expiryDate
        }));
    };

    const getRuleDetails = (ruleIds: string[]) => {
        if (!ruleIds || !Array.isArray(ruleIds)) return [];
        return ruleIds.map(id => masterDataOptions.find(opt => opt._id === id)).filter(Boolean);
    };

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                <h1 className={styles['page-title']}>Manage Discount Codes</h1>

                <div className={styles.layout}>
                    
                    {/* --- LEFT: CREATE COUPON FORM --- */}
                    <div className={styles.card}>
                        <h2 className={styles['card-title']}>Create New Coupon</h2>
                        
                        {errorCreate && (
                            <div className={`${styles.alert} ${styles['alert--error']}`}>
                                {errorCreate}
                            </div>
                        )}
                        
                        <form onSubmit={submitHandler}>
                            <div className={styles['form-group']}>
                                <label className={styles.label}>Coupon Code</label>
                                <input type="text" className={styles.input} placeholder="e.g. SUMMER20" value={code} onChange={(e) => setCode(e.target.value)} required />
                            </div>

                            <div className={styles['form-row']}>
                                <div className={styles['form-group']}>
                                    <label className={styles.label}>Type</label>
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
                                <label className={styles.label}>Minimum Cart Value (₹)</label>
                                <input type="number" className={styles.input} value={minCartValue} onChange={(e) => setMinCartValue(Number(e.target.value))} />
                            </div>

                            <div className={styles['form-group']}>
                                <label className={styles.label}>Applicable Rules (Empty = All Products)</label>
                                <div className={styles['scroll-box']}>
                                    {loadingMasterData ? (
                                        <div className={styles['spinner-container']}>
                                            <div className={styles.spinner}></div>
                                        </div>
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
                                    <label className={styles.label}>Expiry Date</label>
                                    <input type="date" className={styles.input} required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
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

                            <button type="submit" className={styles['btn-submit']} disabled={loadingCreate}>
                                {loadingCreate ? <div className={`${styles.spinner} ${styles['spinner--light']}`}></div> : 'Create Promo Code'}
                            </button>
                        </form>
                    </div>

                    {/* --- RIGHT: ACTIVE COUPONS TABLE --- */}
                    <div className={`${styles.card} ${styles['table-card']}`}>
                        {loadingCoupons ? (
                            <div className={styles['spinner-container']}>
                                <div className={styles.spinner}></div>
                            </div>
                        ) : errorCoupons ? (
                            <div className={`${styles.alert} ${styles['alert--error']}`} style={{ margin: 'var(--space-6)'}}>
                                {errorCoupons}
                            </div>
                        ) : (
                            <div className={styles['table-responsive']}>
                                <table className={styles['admin-table']}>
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Discount</th>
                                            <th>Min Order</th>
                                            <th>Conditions</th>
                                            <th className={styles['align-center']}>Usage</th>
                                            <th className={styles['align-right']}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((c: any) => (
                                            <tr key={c._id}>
                                                <td className={styles['text-code']}>{c.code}</td>
                                                <td>{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</td>
                                                <td>
                                                    {c.minCartValue > 0 ? `₹${c.minCartValue}` : '-'}
                                                </td>
                                                <td>
                                                    {c.isFirstTimeUserOnly && <div className={`${styles.badge} ${styles['badge--info']}`} style={{marginBottom: 'var(--space-2)'}}>New Users Only</div>}
                                                    <div>
                                                        {c.applicableRules && c.applicableRules.length > 0 ? (
                                                            <details className={styles['rules-details']}>
                                                                <summary className={styles['rules-summary']}>
                                                                    {c.applicableRules.length} Rules Applied ▾
                                                                </summary>
                                                                <div className={styles['rules-list']}>
                                                                    {getRuleDetails(c.applicableRules).map((rule: any, idx: number) => (
                                                                        <div key={idx}><strong>{rule.name}</strong> ({rule.group})</div>
                                                                    ))}
                                                                </div>
                                                            </details>
                                                        ) : (
                                                            <span className={`${styles.badge} ${styles['badge--neutral']}`}>All Products</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className={styles['align-center']}>
                                                    {c.usedCount} / {c.usageLimit}
                                                </td>
                                                <td className={styles['align-right']}>
                                                    {new Date(c.expiryDate) < new Date() || c.usedCount >= c.usageLimit ? (
                                                        <span className={`${styles.badge} ${styles['badge--error']}`}>Expired</span>
                                                    ) : (
                                                        <span className={`${styles.badge} ${styles['badge--success']}`}>Active</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
};

export default AdminCouponsPage;