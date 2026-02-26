import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Form, Table, Badge, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { RootState } from '../../../store/reducers';
import { listOrders } from '../../../store/actions/admin/orderActions';

const AdminDashboardPage: React.FC = () => {
    const dispatch = useDispatch<any>();

    // The time range dropdown for the payment date
    const [timeRange, setTimeRange] = useState('all');

    // Redux State
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const orderList = useSelector((state: RootState) => state.orderList || {});
    const { loading, error, orders = [] } = orderList as any;

    useEffect(() => {
        if (userInfo && userInfo.token) {
            dispatch(listOrders());
        }
    }, [dispatch, userInfo]);

    // --- FILTER LOGIC: Matches cards, chart, and table ---
    const filteredOrders = orders.filter((order: any) => {
        if (timeRange === 'all') return true;

        const orderDate = new Date(order.createdAt);
        const now = new Date();

        if (timeRange === 'today') return orderDate.toDateString() === now.toDateString();
        if (timeRange === 'week') return orderDate >= new Date(now.setDate(now.getDate() - 7));
        if (timeRange === 'month') return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
        return true;
    });

    // --- MATH CALCS FOR CARDS ---
    // Only count revenue for PAID orders
    const totalRevenue = filteredOrders
        .filter((order: any) => order.isPaid)
        .reduce((acc: number, order: any) => acc + order.totalPrice, 0);

    const totalOrders = filteredOrders.length;

    // --- CHART DATA PREPARATION ---
    // Group sales by date for the bar chart
    const salesByDate = filteredOrders
        .filter((order: any) => order.isPaid)
        .reduce((acc: any, order: any) => {
            const date = new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            if (!acc[date]) acc[date] = 0;
            acc[date] += order.totalPrice;
            return acc;
        }, {});

    const chartData = Object.keys(salesByDate).map(date => ({
        name: date,
        Revenue: salesByDate[date],
    }));

    const formatOrderId = (id: string) => `ORD-${id.slice(-6).toUpperCase()}`;

    return (
        <Container className="py-5 min-vh-100">
            {/* Header & Dropdown */}
            <Row className="align-items-center mb-4">
                <Col xs={12} md={6}>
                    <h2 className="fw-bold mb-3 mb-md-0">Analytics Dashboard</h2>
                </Col>
                <Col xs={12} md={6} className="d-flex justify-content-md-end">
                    <div className="d-flex align-items-center bg-white p-2 rounded shadow-sm border">
                        <i className="bi bi-calendar3 text-muted me-2 ms-1"></i>
                        <span className="text-muted fw-bold me-2 text-nowrap small text-uppercase">Payment Date:</span>
                        <Form.Select
                            value={timeRange}
                            onChange={(e) => setTimeRange(e.target.value)}
                            className="border-0 fw-bold"
                            size="sm"
                        >
                            <option value="all">All Time</option>
                            <option value="today">Today</option>
                            <option value="week">Last 7 Days</option>
                            <option value="month">Last 30 Days</option>
                        </Form.Select>
                    </div>
                </Col>
            </Row>

            {loading ? (
                <Spinner animation="border" className="d-block mx-auto mt-5" />
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : (
                <>
                    {/* --- TOP CARDS (Counts) --- */}
                    <Row className="g-4 mb-4">
                        <Col md={6}>
                            <Card className="shadow-sm border-0 bg-dark text-white h-100">
                                <Card.Body className="p-4 d-flex align-items-center">
                                    <div className="rounded-circle bg-white bg-opacity-25 d-flex justify-content-center align-items-center me-4" style={{ width: '60px', height: '60px' }}>
                                        <i className="bi bi-currency-rupee fs-3"></i>
                                    </div>
                                    <div>
                                        <div className="text-uppercase small fw-bold text-white-50 tracking-wider mb-1">Total Revenue</div>
                                        <h2 className="fw-bold mb-0">₹{totalRevenue.toFixed(2)}</h2>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={6}>
                            <Card className="shadow-sm border-0 bg-primary text-white h-100">
                                <Card.Body className="p-4 d-flex align-items-center">
                                    <div className="rounded-circle bg-white bg-opacity-25 d-flex justify-content-center align-items-center me-4" style={{ width: '60px', height: '60px' }}>
                                        <i className="bi bi-box-seam fs-3"></i>
                                    </div>
                                    <div>
                                        <div className="text-uppercase small fw-bold text-white-50 tracking-wider mb-1">Total Orders</div>
                                        <h2 className="fw-bold mb-0">{totalOrders}</h2>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* --- REVENUE CHART --- */}
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body className="p-4">
                            <h5 className="fw-bold mb-4">Revenue Overview</h5>
                            <div style={{ width: '100%', height: 300 }}>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer>
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(val) => `₹${val}`} />
                                            <Tooltip
                                                cursor={{ fill: '#f8f9fa' }}
                                                contentStyle={{
                                                    borderRadius: '8px',
                                                    border: 'none',
                                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                                }}
                                                formatter={(value: number | undefined) => [
                                                    `₹${(value ?? 0).toFixed(2)}`,
                                                    'Revenue'
                                                ]}
                                            />
                                            <Bar dataKey="Revenue" fill="#212529" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-100 d-flex justify-content-center align-items-center text-muted">
                                        No paid orders found for this time range.
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>

                    {/* --- RECENT ORDERS TABLE (Matches Chart Logic) --- */}
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Recent Transactions</h5>
                                <Link to="/admin/orders" className="text-decoration-none small fw-bold">View All Orders &rarr;</Link>
                            </div>
                            <div className="table-responsive">
                                <Table hover className="align-middle mb-0 text-nowrap">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="py-3">ORDER ID</th>
                                            <th className="py-3">DATE</th>
                                            <th className="py-3">TOTAL</th>
                                            <th className="py-3">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Only showing the top 5 most recent orders from the filtered list */}
                                        {filteredOrders.slice(0, 5).map((order: any) => (
                                            <tr key={order._id}>
                                                <td className="font-monospace fw-bold">{formatOrderId(order._id)}</td>
                                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="fw-bold">₹{order.totalPrice.toFixed(2)}</td>
                                                <td>
                                                    {order.isPaid ? <Badge bg="success" className="p-2">Paid</Badge> : <Badge bg="danger" className="p-2">Unpaid</Badge>}
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredOrders.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-muted">No transactions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </>
            )}
        </Container>
    );
};

export default AdminDashboardPage;