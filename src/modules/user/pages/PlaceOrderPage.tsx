import React, { useState, useEffect } from 'react';
import { Button, Row, Col, ListGroup, Card, Container, Spinner, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import CheckoutSteps from '../../../common/components/CheckoutSteps';
import CheckoutForm from '../../../common/components/CheckoutForm';
import { RootState } from '../../../store/reducers';
import { createOrder } from '../../../store/actions/user/orderActions';
import { ORDER_CREATE_RESET } from '../../../store/constants/user/orderConstants';

// Initialize Stripe outside of the component render cycle
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PlaceOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  // --- REDUX STATE ---
  const cart = useSelector((state: RootState) => state.cart || {});
  const { cartItems, shippingAddress, paymentMethod } = cart as any;
  
  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  const orderCreate = useSelector((state: RootState) => state.orderCreate || {});
  const { loading: isPlacingOrder, success, order, error } = orderCreate as any;

  // Local State for the Stripe transition
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    if (!shippingAddress?.address) {
      navigate('/checkout/shipping');
    } else if (!paymentMethod) {
      navigate('/checkout/payment');
    }
  }, [shippingAddress, paymentMethod, navigate]);

  // Handle Redux Order Creation Success/Fail
  useEffect(() => {
    if (success && order?.clientSecret) {
      // Save the secret, which will instantly trigger the Stripe form to appear!
      setClientSecret(order.clientSecret);
      
      // Clear the cart in Redux so they can't buy the exact same cart twice
      dispatch({ type: 'CART_CLEAR' });
      
      // Reset the order creation state
      dispatch({ type: ORDER_CREATE_RESET });
    }
    
    if (error) {
      alert(`Order Creation Failed: ${error}`);
      dispatch({ type: ORDER_CREATE_RESET });
    }
  }, [success, order, error, dispatch]);

  const addDecimals = (num: number) => (Math.round(num * 100) / 100).toFixed(2);
  const itemsPrice = cartItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 1000 ? 0 : 50; 
  const totalPrice = Number(itemsPrice) + Number(shippingPrice);

  const placeOrderHandler = () => {
    const orderData = {
      orderItems: cartItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    };

    // Call Redux action to create the Order and grab the Stripe Secret!
    dispatch(createOrder(orderData));
  };

  // --- IF WE HAVE A SECRET, SHOW THE PAYMENT FORM INSTEAD OF THE SUMMARY ---
  if (clientSecret) {
    return (
      <Container className="py-5 d-flex justify-content-center align-items-center min-vh-100">
        <div style={{ width: '100%', maxWidth: '500px' }}>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm />
          </Elements>
        </div>
      </Container>
    );
  }

  // --- OTHERWISE, SHOW THE STANDARD REVIEW SCREEN ---
  return (
    <Container className="py-5 min-vh-100">
      <CheckoutSteps step1 step2 step3 step4 />
      <Row className="g-5 mt-2">
        <Col md={8}>
          <ListGroup variant="flush" className="shadow-sm rounded border">
            {/* ... (Keep your existing Shipping, Payment, and Items ListGroup here!) ... */}
            <ListGroup.Item className="p-4">
              <h4 className="fw-bold mb-3">Shipping</h4>
              <p className="mb-0 fs-5">
                {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}
              </p>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body className="p-4">
              <h4 className="fw-bold border-bottom pb-3 mb-4">Order Summary</h4>
              <Row className="mb-3 fs-5">
                <Col className="text-muted">Total:</Col>
                <Col className="text-end fw-bold text-primary">₹{addDecimals(totalPrice)}</Col>
              </Row>

              <Button
                type="button"
                variant="dark"
                size="lg"
                className="w-100 py-3 fw-bold text-uppercase shadow"
                disabled={cartItems.length === 0 || isPlacingOrder}
                onClick={placeOrderHandler}
              >
                {isPlacingOrder ? <Spinner animation="border" size="sm" /> : "Confirm & Pay"}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PlaceOrderPage;