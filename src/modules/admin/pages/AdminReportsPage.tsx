import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { 
    getSalesReportByProducts, 
    getPurchaseReportByProducts, 
    getSalesReportByCustomers, 
    getPurchaseReportByVendors,
    downloadAdminReport
} from '../../../store/actions/admin/reportActions';

import styles from '../../../schemas/css/AdminReportsPage.module.css';

const AdminReportsPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const reportSalesProducts = useSelector((state: RootState) => state.reportSalesProducts || {}) as any;
    const { loading: loadingSP, data: dataSP = [] } = reportSalesProducts;

    const reportPurchasesProducts = useSelector((state: RootState) => state.reportPurchasesProducts || {}) as any;
    const { loading: loadingPP, data: dataPP = [] } = reportPurchasesProducts;

    const reportSalesCustomers = useSelector((state: RootState) => state.reportSalesCustomers || {}) as any;
    const { loading: loadingSC, data: dataSC = [] } = reportSalesCustomers;

    const reportPurchasesVendors = useSelector((state: RootState) => state.reportPurchasesVendors || {}) as any;
    const { loading: loadingPV, data: dataPV = [] } = reportPurchasesVendors;

    const [activeTab, setActiveTab] = useState<'salesProd' | 'purchProd' | 'salesCust' | 'purchVend'>('salesProd');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // State to track which product rows are expanded
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const fetchReports = () => {
        if (userInfo) {
            dispatch(getSalesReportByProducts(startDate, endDate));
            dispatch(getPurchaseReportByProducts(startDate, endDate));
            dispatch(getSalesReportByCustomers(startDate, endDate));
            dispatch(getPurchaseReportByVendors(startDate, endDate));
        }
    };

    useEffect(() => {
        fetchReports();
        // eslint-disable-next-line
    }, [dispatch, userInfo]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        fetchReports();
    };

    const clearFilter = () => {
        setStartDate('');
        setEndDate('');
        setTimeout(() => {
            dispatch(getSalesReportByProducts('', ''));
            dispatch(getPurchaseReportByProducts('', ''));
            dispatch(getSalesReportByCustomers('', ''));
            dispatch(getPurchaseReportByVendors('', ''));
        }, 0);
    };

    const toggleRow = (id: string) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const triggerExport = (format: 'csv' | 'pdf') => {
        let title = '';
        let headers: string[] = [];
        let rows: any[][] = [];

        if (activeTab === 'salesProd') {
            title = 'Sales by Product';
            headers = ['Product Name', 'Sold Qty', 'Total Received (INR)'];
            rows = dataSP.map((d: any) => [d.productName || 'Unknown', d.soldQty, d.totalReceived.toFixed(2)]);
        } else if (activeTab === 'purchProd') {
            title = 'Purchases by Product';
            headers = ['Product Name', 'Purchased Qty', 'Total Paid (INR)'];
            rows = dataPP.map((d: any) => [d.productName || 'Unknown', d.purchasedQty, d.totalPaidAmount.toFixed(2)]);
        } else if (activeTab === 'salesCust') {
            title = 'Sales by Customer';
            headers = ['Customer Name', 'Total Invoices', 'Paid Amount (INR)', 'Unpaid Balance (INR)'];
            rows = dataSC.map((d: any) => [d.customerName || 'Unknown', d.totalOrders, d.paidAmount.toFixed(2), d.unpaidAmount.toFixed(2)]);
        } else if (activeTab === 'purchVend') {
            title = 'Purchases by Vendor';
            headers = ['Vendor Name', 'Total Bills', 'Paid Amount (INR)', 'Unpaid Balance (INR)'];
            rows = dataPV.map((d: any) => [d.vendorName || 'Unknown', d.totalOrders, d.paidAmount.toFixed(2), d.unpaidAmount.toFixed(2)]);
        }

        if (startDate || endDate) {
            title += ` (${startDate || 'Start'} to ${endDate || 'End'})`;
        }

        dispatch(downloadAdminReport({ title, headers, rows, format }));
    };

    return (
        <main className={styles['page-wrapper']}>
            <div className={styles.container}>
                
                <header className={styles.header}>
                    <div className={styles['header-content']}>
                        <h1 className={styles['page-title']}>Business Reports</h1>
                        <p className={styles['page-subtitle']}>Analyze your sales, purchases, and cash flow across different metrics.</p>
                    </div>
                    <div className={styles['header-actions']}>
                        <button onClick={() => triggerExport('csv')} className={`${styles.btn} ${styles['btn-outline']}`}>
                            📊 Export CSV
                        </button>
                        <button onClick={() => triggerExport('pdf')} className={`${styles.btn} ${styles['btn-primary']}`}>
                            📄 Export PDF
                        </button>
                    </div>
                </header>

                {/* --- DATE FILTER SECTION --- */}
                <div className={`${styles.card} ${styles['card--filter']}`}>
                    <form onSubmit={handleFilter} className={styles['filter-form']}>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>Start Date</label>
                            <input type="date" className={styles.input} value={startDate} onChange={e => setStartDate(e.target.value)} />
                        </div>
                        <div className={styles['form-group']}>
                            <label className={styles.label}>End Date</label>
                            <input type="date" className={styles.input} value={endDate} onChange={e => setEndDate(e.target.value)} />
                        </div>
                        <div className={styles['filter-actions']}>
                            <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`}>Apply Filter</button>
                            {(startDate || endDate) && (
                                <button type="button" onClick={clearFilter} className={`${styles.btn} ${styles['btn-danger']}`}>Clear</button>
                            )}
                        </div>
                    </form>
                </div>

                {/* --- TAB NAVIGATION --- */}
                <nav className={styles['tab-container']}>
                    <button onClick={() => setActiveTab('salesProd')} className={`${styles['tab-btn']} ${activeTab === 'salesProd' ? styles['tab-btn--active'] : ''}`}>
                        📈 Sales by Product
                    </button>
                    <button onClick={() => setActiveTab('purchProd')} className={`${styles['tab-btn']} ${activeTab === 'purchProd' ? styles['tab-btn--active'] : ''}`}>
                        🛒 Purchases by Product
                    </button>
                    <button onClick={() => setActiveTab('salesCust')} className={`${styles['tab-btn']} ${activeTab === 'salesCust' ? styles['tab-btn--active'] : ''}`}>
                        👥 Sales by Customer
                    </button>
                    <button onClick={() => setActiveTab('purchVend')} className={`${styles['tab-btn']} ${activeTab === 'purchVend' ? styles['tab-btn--active'] : ''}`}>
                        🏢 Purchases by Vendor
                    </button>
                </nav>

                {/* --- REPORT TABLES --- */}
                <div className={`${styles.card} ${styles['table-card']}`}>
                    
                    {/* 1. SALES BY PRODUCTS (EXPANDABLE) */}
                    {activeTab === 'salesProd' && (
                        <div className={styles['table-responsive']}>
                            {loadingSP ? <div className={styles.spinner}></div> : (
                                <table className={styles['admin-table']}>
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th className={styles['align-center']}>Sold Qty</th>
                                            <th className={styles['align-right']}>Total Received</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataSP.map((row: any) => (
                                            <React.Fragment key={row._id}>
                                                <tr 
                                                    onClick={() => toggleRow(row._id)} 
                                                    className={`${styles['row-clickable']} ${expandedRows[row._id] ? styles['row-expanded'] : ''}`}
                                                >
                                                    <td>
                                                        <span className={`${styles['expand-icon']} ${expandedRows[row._id] ? styles['expand-icon--open'] : ''}`}>
                                                            ▶
                                                        </span>
                                                        <span className={styles['fw-bold']}>{row.productName || 'Unknown Product'}</span>
                                                    </td>
                                                    <td className={styles['align-center']}>{row.soldQty}</td>
                                                    <td className={`${styles['align-right']} ${styles['text-success']}`}>₹{row.totalReceived.toFixed(2)}</td>
                                                </tr>
                                                {/* VARIANT DROPDOWN ROW */}
                                                {expandedRows[row._id] && row.variants && (
                                                    <tr>
                                                        <td colSpan={3} className={styles['sub-table-cell']}>
                                                            <div className={styles['sub-table-wrapper']}>
                                                                <table className={styles['sub-table']}>
                                                                    <tbody>
                                                                        {row.variants.map((variant: any, idx: number) => (
                                                                            <tr key={idx}>
                                                                                <td>SKU: <span className={styles['text-code']}>{variant.sku || 'N/A'}</span></td>
                                                                                <td className={styles['align-center']}>Qty: {variant.soldQty}</td>
                                                                                <td className={`${styles['align-right']} ${styles['text-success']}`}>₹{variant.totalReceived.toFixed(2)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {dataSP.length === 0 && <tr><td colSpan={3} className={styles['align-center']} style={{padding:'var(--space-8)'}}><span className={styles['text-muted']}>No sales data found for this period.</span></td></tr>}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* 2. PURCHASES BY PRODUCTS (EXPANDABLE) */}
                    {activeTab === 'purchProd' && (
                        <div className={styles['table-responsive']}>
                            {loadingPP ? <div className={styles.spinner}></div> : (
                                <table className={styles['admin-table']}>
                                    <thead>
                                        <tr>
                                            <th>Product Name</th>
                                            <th className={styles['align-center']}>Purchased Qty</th>
                                            <th className={styles['align-right']}>Total Paid</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataPP.map((row: any) => (
                                            <React.Fragment key={row._id}>
                                                <tr 
                                                    onClick={() => toggleRow(row._id)} 
                                                    className={`${styles['row-clickable']} ${expandedRows[row._id] ? styles['row-expanded'] : ''}`}
                                                >
                                                    <td>
                                                        <span className={`${styles['expand-icon']} ${expandedRows[row._id] ? styles['expand-icon--open'] : ''}`}>
                                                            ▶
                                                        </span>
                                                        <span className={styles['fw-bold']}>{row.productName || 'Unknown Product'}</span>
                                                    </td>
                                                    <td className={styles['align-center']}>{row.purchasedQty}</td>
                                                    <td className={`${styles['align-right']} ${styles['text-danger']}`}>₹{row.totalPaidAmount.toFixed(2)}</td>
                                                </tr>
                                                {/* VARIANT DROPDOWN ROW */}
                                                {expandedRows[row._id] && row.variants && (
                                                    <tr>
                                                        <td colSpan={3} className={styles['sub-table-cell']}>
                                                            <div className={styles['sub-table-wrapper']}>
                                                                <table className={`${styles['sub-table']} ${styles['sub-table--danger']}`}>
                                                                    <tbody>
                                                                        {row.variants.map((variant: any, idx: number) => (
                                                                            <tr key={idx}>
                                                                                <td>SKU: <span className={styles['text-code']}>{variant.sku || 'N/A'}</span></td>
                                                                                <td className={styles['align-center']}>Qty: {variant.purchasedQty}</td>
                                                                                <td className={`${styles['align-right']} ${styles['text-danger']}`}>₹{variant.totalPaidAmount.toFixed(2)}</td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        {dataPP.length === 0 && <tr><td colSpan={3} className={styles['align-center']} style={{padding:'var(--space-8)'}}><span className={styles['text-muted']}>No purchase data found for this period.</span></td></tr>}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* 3. SALES BY CUSTOMERS */}
                    {activeTab === 'salesCust' && (
                        <div className={styles['table-responsive']}>
                            {loadingSC ? <div className={styles.spinner}></div> : (
                                <table className={styles['admin-table']}>
                                    <thead>
                                        <tr>
                                            <th>Customer Name</th>
                                            <th className={styles['align-center']}>Total Invoices</th>
                                            <th className={styles['align-right']}>Paid Amount</th>
                                            <th className={styles['align-right']}>Unpaid Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataSC.map((row: any) => (
                                            <tr key={row._id}>
                                                <td className={styles['fw-bold']}>{row.customerName || 'Unknown Customer'}</td>
                                                <td className={styles['align-center']}>{row.totalOrders}</td>
                                                <td className={`${styles['align-right']} ${styles['text-success']}`}>₹{row.paidAmount.toFixed(2)}</td>
                                                <td className={`${styles['align-right']} ${row.unpaidAmount > 0 ? styles['text-danger'] : ''}`}>
                                                    ₹{row.unpaidAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        {dataSC.length === 0 && <tr><td colSpan={4} className={styles['align-center']} style={{padding:'var(--space-8)'}}><span className={styles['text-muted']}>No customer data found for this period.</span></td></tr>}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {/* 4. PURCHASES BY VENDORS */}
                    {activeTab === 'purchVend' && (
                        <div className={styles['table-responsive']}>
                            {loadingPV ? <div className={styles.spinner}></div> : (
                                <table className={styles['admin-table']}>
                                    <thead>
                                        <tr>
                                            <th>Vendor Name</th>
                                            <th className={styles['align-center']}>Total Bills</th>
                                            <th className={styles['align-right']}>Paid Amount</th>
                                            <th className={styles['align-right']}>Unpaid Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataPV.map((row: any) => (
                                            <tr key={row._id}>
                                                <td className={styles['fw-bold']}>{row.vendorName || 'Unknown Vendor'}</td>
                                                <td className={styles['align-center']}>{row.totalOrders}</td>
                                                <td className={`${styles['align-right']} ${styles['text-success']}`}>₹{row.paidAmount.toFixed(2)}</td>
                                                <td className={`${styles['align-right']} ${row.unpaidAmount > 0 ? styles['text-danger'] : ''}`}>
                                                    ₹{row.unpaidAmount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                        {dataPV.length === 0 && <tr><td colSpan={4} className={styles['align-center']} style={{padding:'var(--space-8)'}}><span className={styles['text-muted']}>No vendor data found for this period.</span></td></tr>}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
};

export default AdminReportsPage;