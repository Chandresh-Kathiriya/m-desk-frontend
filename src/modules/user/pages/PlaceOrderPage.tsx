import React, { useEffect } from 'react';
import { Button, Row, Col, ListGroup, Image, Card, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import CheckoutSteps from '../../../common/components/CheckoutSteps';
import { RootState } from '../../../store/reducers';

const PlaceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Pull all the data we gathered in the last 3 steps from Redux
  const cart = useSelector((state: RootState) => state.cart || {});
  const { cartItems, shippingAddress, paymentMethod } = cart as any;

  // --- GUARDRAILS ---
  // If they somehow skipped a step, kick them back
  useEffect(() => {
    if (!shippingAddress?.address) {
      navigate('/checkout/shipping');
    } else if (!paymentMethod) {
      navigate('/checkout/payment');
    }
  }, [shippingAddress, paymentMethod, navigate]);

  // --- ORDER MATH CALCULATIONS ---
  // Helper to force 2 decimal places
  const addDecimals = (num: number) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const itemsPrice = cartItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
  
  // Example Shipping Rule: Free shipping on orders over ₹1000, otherwise ₹50 shipping fee
  const shippingPrice = itemsPrice > 1000 ? 0 : 50; 
  
  const totalPrice = Number(itemsPrice) + Number(shippingPrice);

  const placeOrderHandler = () => {
    // We will build the backend "Create Order" API next!
    console.log("🚀 TRIGGERING ORDER CREATION...");
    
    const orderData = {
      orderItems: cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    };
    
    console.log("Data ready for the backend:", orderData);
    // dispatch(createOrder(orderData));
  };

  return (
    <Container className="py-5 min-vh-100">
      <CheckoutSteps step1 step2 step3 step4 />

      <Row className="g-5 mt-2">
        {/* LEFT COLUMN: Order Details */}
        <Col md={8}>
          <ListGroup variant="flush" className="shadow-sm rounded border">
            
            {/* 1. SHIPPING INFO */}
            <ListGroup.Item className="p-4">
              <h4 className="fw-bold mb-3">Shipping</h4>
              <p className="mb-0 fs-5">
                <strong>Address: </strong>
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
              </p>
            </ListGroup.Item>

            {/* 2. PAYMENT METHOD */}
            <ListGroup.Item className="p-4">
              <h4 className="fw-bold mb-3">Payment Method</h4>
              <p className="mb-0 fs-5">
                <strong>Method: </strong>
                {paymentMethod}
              </p>
            </ListGroup.Item>

            {/* 3. ORDER ITEMS */}
            <ListGroup.Item className="p-4">
              <h4 className="fw-bold mb-3">Order Items</h4>
              {cartItems.length === 0 ? (
                <div className="alert alert-info">Your cart is empty</div>
              ) : (
                <ListGroup variant="flush">
                  {cartItems.map((item: any, index: number) => (
                    <ListGroup.Item key={index} className="px-0 py-3 border-bottom-0">
                      <Row className="align-items-center">
                        <Col md={2} xs={3}>
                          <Image src={item.image} alt={item.name} fluid rounded className="border shadow-sm" />
                        </Col>
                        <Col md={6} xs={9}>
                          <Link to={`/product/${item.product}`} className="text-decoration-none fw-bold text-dark fs-5">
                            {item.name}
                          </Link>
                          <div className="text-muted small mt-1">
                            Color: {item.color} | Size: {item.size}
                          </div>
                        </Col>
                        <Col md={4} className="mt-3 mt-md-0 fw-bold fs-5 text-md-end text-primary">
                          {item.qty} x ₹{addDecimals(item.price)} = ₹{addDecimals(item.qty * item.price)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>

        {/* RIGHT COLUMN: Order Summary */}
        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body className="p-4">
              <h4 className="fw-bold border-bottom pb-3 mb-4">Order Summary</h4>
              
              <Row className="mb-3 fs-5">
                <Col className="text-muted">Items:</Col>
                <Col className="text-end fw-bold">₹{addDecimals(itemsPrice)}</Col>
              </Row>
              
              <Row className="mb-3 fs-5">
                <Col className="text-muted">Shipping:</Col>
                <Col className="text-end fw-bold">
                  {shippingPrice === 0 ? <span className="text-success">Free</span> : `₹${addDecimals(shippingPrice)}`}
                </Col>
              </Row>

              <hr className="my-4" />
              
              <Row className="mb-4 fs-4">
                <Col className="fw-bold">Total:</Col>
                <Col className="text-end fw-bold text-primary">₹{addDecimals(totalPrice)}</Col>
              </Row>

              <Button
                type="button"
                variant="dark"
                size="lg"
                className="w-100 py-3 fw-bold text-uppercase shadow"
                disabled={cartItems.length === 0}
                onClick={placeOrderHandler}
              >
                Place Order
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PlaceOrderPage;