import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Spinner, Badge, Card, Form, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listOrders } from '../../../store/actions/admin/orderActions';

const OrdersPage: React.FC = () => {
  const dispatch = useDispatch<any>();
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

  const formatOrderId = (orderId: string) => `ORD-${orderId.slice(-6).toUpperCase()}`;

  const filteredOrders = orders.filter((order: any) => {
    if (timeRange === 'all') return true;
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    
    if (timeRange === 'today') return orderDate.toDateString() === now.toDateString();
    if (timeRange === 'week') return orderDate >= new Date(now.setDate(now.getDate() - 7));
    if (timeRange === 'month') return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
    return true;
  });

  return (
    <Container className="py-5 min-vh-100">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={6}>
          <h2 className="fw-bold mb-3 mb-md-0">Manage Orders</h2>
        </Col>
        <Col xs={12} md={6} className="d-flex justify-content-md-end">
          <div className="d-flex align-items-center">
            <span className="text-muted fw-bold me-2 text-nowrap">Payment Date:</span>
            <Form.Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="shadow-sm border-0">
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
        <Alert variant="danger" className="text-center mt-3">{error}</Alert>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0">
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead className="bg-light">
                  <tr>
                    <th className="px-4 py-3">ORDER ID</th>
                    <th className="py-3">USER</th>
                    <th className="py-3">DATE</th>
                    <th className="py-3">TOTAL</th>
                    <th className="py-3">PAID</th>
                    <th className="py-3">DELIVERED</th>
                    <th className="px-4 py-3 text-end">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => (
                    <tr key={order._id}>
                      <td className="px-4 font-monospace fw-bold">{formatOrderId(order._id)}</td>
                      <td>{order.user?.name || 'Deleted User'}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="fw-bold text-primary">₹{order.totalPrice.toFixed(2)}</td>
                      <td>{order.isPaid ? <Badge bg="success" className="p-2">Paid</Badge> : <Badge bg="danger" className="p-2">No</Badge>}</td>
                      <td>{order.isDelivered ? <Badge bg="success" className="p-2">Yes</Badge> : <Badge bg="warning" text="dark" className="p-2">Pending</Badge>}</td>
                      <td className="px-4 text-end">
                        {/* --- SECURE ADMIN ROUTE LINK --- */}
                        <Link to={`/admin/order/${order._id}`}>
                          <Button variant="dark" size="sm" className="fw-bold shadow-sm">Details</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">No orders found for this time range.</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default OrdersPage;