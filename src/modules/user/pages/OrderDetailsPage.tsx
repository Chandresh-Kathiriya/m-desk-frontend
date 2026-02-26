import React, { useEffect } from 'react';
import { Row, Col, ListGroup, Image, Card, Container, Spinner, Badge, Alert } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { getUserOrderDetails } from '../../../store/actions/user/orderActions';

const OrderDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();

  // Redux State
  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  const userOrderDetails = useSelector((state: RootState) => state.userOrderDetails || {});
  const { order, loading, error } = userOrderDetails as any;

  useEffect(() => {
    if (userInfo && userInfo.token && id) {
      // Only fetch if the order isn't loaded or doesn't match the current URL ID
      if (!order || order._id !== id) {
        dispatch(getUserOrderDetails(id));
      }
    }
  }, [dispatch, id, userInfo, order]);

  const formatOrderId = (orderId: string) => `ORD-${orderId.slice(-6).toUpperCase()}`;

  if (loading) return <Spinner animation="border" className="d-block mx-auto mt-5" />;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!order) return <Container className="py-5"><h4>Order not found</h4></Container>;

  return (
    <Container className="py-5 min-vh-100">
      <h2 className="fw-bold mb-4">Order {formatOrderId(order._id)}</h2>
      
      <Row className="g-5">
        <Col md={8}>
          <ListGroup variant="flush" className="shadow-sm rounded border">
            <ListGroup.Item className="p-4">
              <h4 className="fw-bold mb-3">Shipping Details</h4>
              <p><strong>Name: </strong> {order.user?.name}</p>
              <p><strong>Email: </strong> <a href={`mailto:${order.user?.email}`}>{order.user?.email}</a></p>
              <p className="mb-3">
                <strong>Address: </strong>
                {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}
              </p>
              {order.isDelivered ? (
                <Badge bg="success" className="p-2 fs-6">Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</Badge>
              ) : (
                <Badge bg="warning" text="dark" className="p-2 fs-6">Processing / Not Delivered</Badge>
              )}
            </ListGroup.Item>

            <ListGroup.Item className="p-4">
              <h4 className="fw-bold mb-3">Payment Details</h4>
              <p><strong>Method: </strong> {order.paymentMethod}</p>
              {order.isPaid ? (
                <Badge bg="success" className="p-2 fs-6">Paid on {new Date(order.createdAt).toLocaleDateString()}</Badge>
              ) : (
                <Badge bg="danger" className="p-2 fs-6">Not Paid</Badge>
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
                        <div className="text-muted small mt-1">Color: {item.color} | Size: {item.size}</div>
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
              <h4 className="fw-bold border-bottom pb-3 mb-4">Order Summary</h4>
              <Row className="mb-3 fs-5"><Col className="text-muted">Items:</Col><Col className="text-end fw-bold">₹{order.itemsPrice?.toFixed(2)}</Col></Row>
              <Row className="mb-3 fs-5"><Col className="text-muted">Shipping:</Col><Col className="text-end fw-bold">₹{order.shippingPrice?.toFixed(2)}</Col></Row>
              <hr />
              <Row className="mb-2 fs-4"><Col className="fw-bold">Total:</Col><Col className="text-end fw-bold text-primary">₹{order.totalPrice?.toFixed(2)}</Col></Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailsPage;