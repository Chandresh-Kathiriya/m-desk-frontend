import React, { useEffect } from 'react';
import { Row, Col, ListGroup, Image, Card, Container, Spinner, Badge, Button, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getOrderDetails, deliverOrder } from '../../../store/actions/admin/orderActions';
import { ORDER_DELIVER_RESET } from '../../../store/constants/admin/orderConstants';

const AdminOrderDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch<any>();

    // Redux State
    const adminAuth = useSelector((state: RootState) => state.adminAuth || {});
    const userInfo = (adminAuth as any).adminInfo || (adminAuth as any).userInfo;

    const orderDetails = useSelector((state: RootState) => state.orderDetails || {});
    const { order, loading, error } = orderDetails as any;

    const orderDeliver = useSelector((state: RootState) => state.orderDeliver || {});
    const { loading: loadingDeliver, success: successDeliver, error: errorDeliver } = orderDeliver as any;

    useEffect(() => {
        if (!order || order._id !== id || successDeliver) {
            dispatch({ type: ORDER_DELIVER_RESET }); // Reset the deliver success flag
            if (id) {
                dispatch(getOrderDetails(id));
            }
        }
    }, [dispatch, id, order, successDeliver]);

    const deliverHandler = () => {
        if (order) {
            dispatch(deliverOrder(order));
        }
    };

    const formatOrderId = (orderId: string) => `ORD-${orderId.slice(-6).toUpperCase()}`;

    if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
    if (!order) return <Container className="py-5"><h4>Order not found</h4></Container>;

    return (
        <Container className="py-5 min-vh-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">Manage Order {formatOrderId(order._id)}</h2>
                <Link to="/admin/orders">
                    <Button variant="outline-secondary" size="sm">Back to Orders</Button>
                </Link>
            </div>
            
            <Row className="g-5">
                <Col md={8}>
                    <ListGroup variant="flush" className="shadow-sm rounded border">
                        <ListGroup.Item className="p-4">
                            <h4 className="fw-bold mb-3">Customer Details</h4>
                            <p><strong>Name: </strong> {order.user?.name}</p>
                            <p><strong>Email: </strong> <a href={`mailto:${order.user?.email}`}>{order.user?.email}</a></p>
                            <p className="mb-3">
                                <strong>Shipping Address: </strong>
                                {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                            </p>
                            {order.isDelivered ? (
                                <Badge bg="success" className="p-2 fs-6">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</Badge>
                            ) : (
                                <Badge bg="warning" text="dark" className="p-2 fs-6">Processing Delivery</Badge>
                            )}
                        </ListGroup.Item>

                        <ListGroup.Item className="p-4">
                            <h4 className="fw-bold mb-3">Order Items</h4>
                            <ListGroup variant="flush">
                                {order.orderItems?.map((item: any, index: number) => (
                                    <ListGroup.Item key={index} className="px-0 py-3 border-bottom-0">
                                        <Row className="align-items-center">
                                            <Col xs={3} md={2}><Image src={item.image} fluid rounded className="border shadow-sm" /></Col>
                                            <Col xs={5} md={6}>
                                                <Link to={`/product/${item.product}`} className="text-decoration-none fw-bold text-dark fs-5">{item.name}</Link>
                                                <div className="text-muted small mt-1">SKU: {item.sku} | Color: {item.color}</div>
                                            </Col>
                                            <Col xs={4} md={4} className="fw-bold fs-5 text-end text-primary">
                                                {item.qty} x ₹{item.price.toFixed(2)} = ₹{(item.qty * item.price).toFixed(2)}
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm border-0 bg-light">
                        <Card.Body className="p-4">
                            <h4 className="fw-bold border-bottom pb-3 mb-4">Action Panel</h4>
                            <Row className="mb-3 fs-5"><Col className="text-muted">Status:</Col>
                                <Col className="text-end fw-bold">
                                    {order.isPaid ? <span className="text-success">Paid</span> : <span className="text-danger">Unpaid</span>}
                                </Col>
                            </Row>
                            <Row className="mb-2 fs-4"><Col className="fw-bold">Total:</Col><Col className="text-end fw-bold text-primary">₹{order.totalPrice.toFixed(2)}</Col></Row>

                            {/* --- ADMIN FULFILLMENT BUTTON --- */}
                            {!order.isDelivered && (
                                <>
                                    <hr className="my-4" />
                                    {errorDeliver && <Alert variant="danger" className="mb-3">{errorDeliver}</Alert>}
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="lg"
                                        className="w-100 py-3 fw-bold text-uppercase shadow"
                                        onClick={deliverHandler}
                                        disabled={loadingDeliver}
                                    >
                                        {loadingDeliver ? <Spinner animation="border" size="sm" /> : "Mark As Delivered"}
                                    </Button>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminOrderDetailsPage;