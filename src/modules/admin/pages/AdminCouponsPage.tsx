import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Badge, Dropdown, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { RootState } from '../../../store/reducers';
import { listCoupons, createCoupon } from '../../../store/actions/admin/couponActions';
import { COUPON_CREATE_RESET } from '../../../store/constants/admin/couponConstants';

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

                console.log("🚀 Starting Master Data fetch...");

                const [catRes, brandRes, styleRes, typeRes] = await Promise.all([
                    axios.get('/api/categories', config).catch(err => { console.error("Category fetch failed:", err); return { data: null }; }),
                    axios.get('/api/brands', config).catch(err => { console.error("Brand fetch failed:", err); return { data: null }; }),
                    axios.get('/api/styles', config).catch(err => { console.error("Style fetch failed:", err); return { data: null }; }),
                    axios.get('/api/types', config).catch(err => { console.error("Type fetch failed:", err); return { data: null }; })
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

                const categories = getArray(catRes.data, 'categories');
                const brands = getArray(brandRes.data, 'brands');
                const styles = getArray(styleRes.data, 'styles');
                const types = getArray(typeRes.data, 'types');

                const combinedOptions = [
                    ...categories.map((item: any) => ({ ...item, group: 'Category' })),
                    ...brands.map((item: any) => ({ ...item, group: 'Brand' })),
                    ...styles.map((item: any) => ({ ...item, group: 'Style' })),
                    ...types.map((item: any) => ({ ...item, group: 'Product Type' }))
                ];

                setMasterDataOptions(combinedOptions);
                dispatch(listCoupons()); // Fetch coupons via Redux
                setLoadingMasterData(false);
            } catch (error) {
                console.error("🔥 Fatal error in fetchInitialData:", error);
                setMasterDataOptions([]);
                setLoadingMasterData(false);
            }
        };
        fetchInitialData();
    }, [userInfo, dispatch]);

    // Handle Create Success
    useEffect(() => {
        if (successCreate) {
            alert('Coupon created successfully!');
            setCode(''); 
            setDiscountValue(''); 
            setExpiryDate('');
            setApplicableRules([]);
            dispatch({ type: COUPON_CREATE_RESET });
            dispatch(listCoupons()); // Refresh table
        }
    }, [successCreate, dispatch]);

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            code, discountType, discountValue, minCartValue,
            applicableRules,
            isFirstTimeUserOnly, usageLimit, expiryDate
        };
        dispatch(createCoupon(payload));
    };

    const getRuleDetails = (ruleIds: string[]) => {
        if (!ruleIds || !Array.isArray(ruleIds)) return [];
        return ruleIds.map(id => masterDataOptions.find(opt => opt._id === id)).filter(Boolean);
    };

    return (
        <Container className="py-5">
            <h2 className="fw-bold mb-4">Manage Discount Codes</h2>

            <Row className="g-4">
                {/* --- LEFT: CREATE COUPON FORM --- */}
                <Col lg={4}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-3">Create New Coupon</h5>
                            {errorCreate && <Alert variant="danger">{errorCreate}</Alert>}
                            
                            <Form onSubmit={submitHandler}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Coupon Code</Form.Label>
                                    <Form.Control type="text" placeholder="e.g. SUMMER20" value={code} onChange={(e) => setCode(e.target.value)} required />
                                </Form.Group>

                                <Row>
                                    <Col xs={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Type</Form.Label>
                                            <Form.Select value={discountType} onChange={(e) => setDiscountType(e.target.value)}>
                                                <option value="percentage">% Off</option>
                                                <option value="flat">Flat Amount</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Value</Form.Label>
                                            <Form.Control type="number" required value={discountValue} onChange={(e) => setDiscountValue(Number(e.target.value))} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Minimum Cart Value (₹)</Form.Label>
                                    <Form.Control type="number" value={minCartValue} onChange={(e) => setMinCartValue(Number(e.target.value))} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">Applicable Rules (Leave empty for ALL products)</Form.Label>
                                    <div className="border rounded p-3 bg-white" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {loadingMasterData ? (
                                            <span className="text-muted small">
                                                <Spinner animation="border" size="sm" className="me-2" /> Loading options...
                                            </span>
                                        ) : masterDataOptions.length === 0 ? (
                                            <span className="text-muted small text-danger">No master data found. Please add Categories/Brands first.</span>
                                        ) : (
                                            masterDataOptions.map((option: any) => (
                                                <Form.Check
                                                    key={option._id}
                                                    type="checkbox"
                                                    id={`rule-${option._id}`}
                                                    label={<><span className="fw-bold">{option.name}</span> <span className="text-muted small">({option.group})</span></>}
                                                    checked={applicableRules.includes(option._id)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setApplicableRules([...applicableRules, option._id]);
                                                        } else {
                                                            setApplicableRules(applicableRules.filter(id => id !== option._id));
                                                        }
                                                    }}
                                                    className="mb-2"
                                                />
                                            ))
                                        )}
                                    </div>
                                </Form.Group>

                                <Row>
                                    <Col xs={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Usage Limit</Form.Label>
                                            <Form.Control type="number" required value={usageLimit} onChange={(e) => setUsageLimit(Number(e.target.value))} />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="small fw-bold text-muted text-uppercase">Expiry Date</Form.Label>
                                            <Form.Control type="date" required value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Check
                                        type="switch"
                                        id="first-time-switch"
                                        label={<span className="fw-bold">First-Time Users Only</span>}
                                        checked={isFirstTimeUserOnly}
                                        onChange={(e) => setIsFirstTimeUserOnly(e.target.checked)}
                                    />
                                </Form.Group>

                                <Button type="submit" variant="dark" className="w-100 py-2 fw-bold" disabled={loadingCreate}>
                                    {loadingCreate ? <Spinner size="sm" /> : 'Create Promo Code'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* --- RIGHT: ACTIVE COUPONS TABLE --- */}
                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            {loadingCoupons ? <Spinner animation="border" className="m-4" /> : errorCoupons ? <Alert variant="danger" className="m-4">{errorCoupons}</Alert> : (
                                <Table hover responsive className="align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="px-4 py-3">CODE</th>
                                            <th className="py-3">DISCOUNT</th>
                                            <th className="py-3">Min Cart Amount</th>
                                            <th className="py-3">CONDITIONS</th>
                                            <th className="py-3">USAGE</th>
                                            <th className="py-3 text-end px-4">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {coupons.map((c: any) => (
                                            <tr key={c._id}>
                                                <td className="px-4 fw-bold text-primary">{c.code}</td>
                                                <td>{c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}</td>
                                                <td className="small text-muted">
                                                    {c.minCartValue > 0 && <div className="text-nowrap">₹{c.minCartValue}</div>}
                                                </td>
                                                <td className="small text-muted">
                                                    {c.isFirstTimeUserOnly && <div className="text-info fw-bold">New Users Only</div>}
                                                    <div className="mt-1">
                                                        {c.applicableRules && c.applicableRules.length > 0 ? (
                                                            <Dropdown>
                                                                <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${c._id}`}>
                                                                    {c.applicableRules.length} Rules Applied
                                                                </Dropdown.Toggle>
                                                                <Dropdown.Menu className="shadow-sm">
                                                                    {getRuleDetails(c.applicableRules).map((rule: any, idx: number) => (
                                                                        <Dropdown.Item key={idx} as="div" className="bg-transparent" style={{ pointerEvents: 'none' }}>
                                                                            <span className="fw-bold">{rule.name}</span> <span className="text-muted small">({rule.group})</span>
                                                                        </Dropdown.Item>
                                                                    ))}
                                                                </Dropdown.Menu>
                                                            </Dropdown>
                                                        ) : (
                                                            <Badge bg="secondary">All Products</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    {c.usedCount} / {c.usageLimit}
                                                </td>
                                                <td className="text-end px-4">
                                                    {new Date(c.expiryDate) < new Date() || c.usedCount >= c.usageLimit ? (
                                                        <Badge bg="danger">Expired</Badge>
                                                    ) : (
                                                        <Badge bg="success">Active</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminCouponsPage;