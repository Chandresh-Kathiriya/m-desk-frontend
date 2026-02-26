import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import CheckoutForm from '../../../common/components/CheckoutForm';
import { saveShippingAddress } from '../../../store/actions/user/cartActions';
import { createOrder } from '../../../store/actions/user/orderActions';
import { validateCoupon } from '../../../store/actions/user/couponActions';
import { ORDER_CREATE_RESET } from '../../../store/constants/user/orderConstants';
import { COUPON_VALIDATE_RESET } from '../../../store/constants/user/couponConstants';
import { RootState } from '../../../store/reducers';

// Initialize Stripe 
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();

    // --- REDUX DATA ---
    const cart = useSelector((state: RootState) => state.cart || {});
    const { cartItems, shippingAddress } = cart as any;
    
    const userAuth = useSelector((state: RootState) => state.userAuth || {});
    const { userInfo } = userAuth as any;

    const orderCreate = useSelector((state: RootState) => state.orderCreate || {});
    const { loading: isProcessingOrder, success: successOrder, order, error: errorOrder } = orderCreate as any;

    const couponValidate = useSelector((state: RootState) => state.couponValidate || {});
    const { loading: couponLoading, success: successCoupon, couponInfo, error: errorCoupon } = couponValidate as any;

    // --- LOCAL STATE ---
    const [address, setAddress] = useState<string>(shippingAddress?.address || '');
    const [city, setCity] = useState<string>(shippingAddress?.city || '');
    const [postalCode, setPostalCode] = useState<string>(shippingAddress?.postalCode || '');
    const [country, setCountry] = useState<string>(shippingAddress?.country || '');

    const [clientSecret, setClientSecret] = useState<string>('');

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Guardrail: Kick them out if cart is empty
    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    // Handle Redux Order Creation Success/Fail
    useEffect(() => {
        if (successOrder && order?.clientSecret) {
            setClientSecret(order.clientSecret);
            dispatch({ type: ORDER_CREATE_RESET });
        }
        if (errorOrder) {
            alert(errorOrder);
            dispatch({ type: ORDER_CREATE_RESET });
        }
    }, [successOrder, order, errorOrder, dispatch]);

    // Handle Redux Coupon Validation Success/Fail
    useEffect(() => {
        if (successCoupon && couponInfo) {
            setDiscountAmount(couponInfo.calculatedDiscount);
            setAppliedCoupon(couponInfo);
            setCouponMessage({ type: 'success', text: `Success! ${couponInfo.code} applied.` });
            dispatch({ type: COUPON_VALIDATE_RESET });
        }
        if (errorCoupon) {
            setDiscountAmount(0);
            setAppliedCoupon(null);
            setCouponMessage({ type: 'error', text: errorCoupon });
            dispatch({ type: COUPON_VALIDATE_RESET });
        }
    }, [successCoupon, couponInfo, errorCoupon, dispatch]);

    // --- MATH CALCS ---
    const FREE_SHIPPING_THRESHOLD = 1000;
    const SHIPPING_COST = 50;

    const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);

    // Apply discount to subtotal
    const afterDiscountTotal = subtotal - discountAmount;

    // Check if they still qualify for free shipping AFTER the discount!
    const shippingPrice = afterDiscountTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

    const totalPrice = afterDiscountTotal + shippingPrice;

    const applyCouponHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode) return;
        setCouponMessage(null);
        dispatch(validateCoupon(couponCode, cartItems));
    };

    // --- HANDLER: REMOVE COUPON ---
    const removeCouponHandler = () => {
        setCouponCode('');
        setDiscountAmount(0);
        setAppliedCoupon(null);
        setCouponMessage(null);
        dispatch({ type: COUPON_VALIDATE_RESET });
    };

    // --- HANDLER: CREATE ORDER & GET STRIPE SECRET ---
    const confirmShippingHandler = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Save Address for future use!
        const updatedAddress = { address, city, postalCode, country };
        dispatch(saveShippingAddress(updatedAddress));

        // 2. Prepare Order Data
        const orderData = {
            orderItems: cartItems,
            shippingAddress: updatedAddress,
            paymentMethod: 'Stripe', // Hardcoded since it's the only method
            itemsPrice: subtotal,
            shippingPrice,
            totalPrice,
        };

        // 3. Dispatch Redux Action
        dispatch(createOrder(orderData));
    };

    return (
        <Container className="py-5 min-vh-100">
            <h2 className="fw-bold mb-4 border-bottom pb-3">Secure Checkout</h2>

            <Row className="g-5">
                {/* LEFT COLUMN: Shipping & Payment Form */}
                <Col lg={7}>
                    <Card className="shadow-sm border-0 mb-4">
                        <Card.Body className="p-4 p-md-5">

                            {/* If we have the Stripe Secret, show the Payment Form. Otherwise, show Shipping Form. */}
                            {clientSecret ? (
                                <div className="animate__animated animate__fadeIn">
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h4 className="fw-bold mb-0"><i className="bi bi-credit-card me-2"></i>Payment Details</h4>
                                        <Button variant="outline-secondary" size="sm" onClick={() => setClientSecret('')}>
                                            Edit Address
                                        </Button>
                                    </div>

                                    {/* Shipping Read-Only Summary */}
                                    <div className="bg-light p-3 rounded mb-4 text-muted small">
                                        <strong>Shipping to:</strong> {address}, {city}, {postalCode}, {country}
                                    </div>

                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm />
                                    </Elements>
                                </div>
                            ) : (
                                <Form onSubmit={confirmShippingHandler}>
                                    <h4 className="fw-bold mb-4"><i className="bi bi-geo-alt me-2"></i>Shipping Details</h4>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Street Address</Form.Label>
                                        <Form.Control type="text" placeholder="123 Main St" value={address} required onChange={(e) => setAddress(e.target.value)} />
                                    </Form.Group>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-muted text-uppercase">City</Form.Label>
                                                <Form.Control type="text" placeholder="Mumbai" value={city} required onChange={(e) => setCity(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="small fw-bold text-muted text-uppercase">Postal Code</Form.Label>
                                                <Form.Control type="text" placeholder="400001" value={postalCode} required onChange={(e) => setPostalCode(e.target.value)} />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="small fw-bold text-muted text-uppercase">Country</Form.Label>
                                        <Form.Control type="text" placeholder="India" value={country} required onChange={(e) => setCountry(e.target.value)} />
                                    </Form.Group>

                                    <Button type="submit" variant="dark" size="lg" className="w-100 py-3 fw-bold shadow" disabled={isProcessingOrder}>
                                        {isProcessingOrder ? <Spinner animation="border" size="sm" /> : "Confirm Address & Proceed to Payment"}
                                    </Button>
                                </Form>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* RIGHT COLUMN: Order Summary */}
                <Col lg={5}>
                    <Card className="shadow-sm border-0 bg-light sticky-top" style={{ top: '20px' }}>
                        <Card.Body className="p-4 p-md-5">
                            {/* --- NEW: PROMO CODE INPUT --- */}
                            {!clientSecret && ( // Hide this once they move to the Stripe payment step
                                <div className="mb-4 bg-white p-3 border rounded">
                                    <Form onSubmit={applyCouponHandler} className="d-flex gap-2">
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter Promo Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            disabled={appliedCoupon !== null}
                                            className="text-uppercase"
                                        />
                                        {appliedCoupon ? (
                                            <Button variant="outline-danger" onClick={removeCouponHandler} className="fw-bold">
                                                Remove
                                            </Button>
                                        ) : (
                                            <Button type="submit" variant="dark" disabled={couponLoading || !couponCode} className="fw-bold px-4">
                                                {couponLoading ? <Spinner animation="border" size="sm" /> : "Apply"}
                                            </Button>
                                        )}
                                    </Form>
                                    {couponMessage && (
                                        <div className={`small mt-2 fw-bold text-${couponMessage.type === 'success' ? 'success' : 'danger'}`}>
                                            {couponMessage.type === 'success' ? <i className="bi bi-check-circle-fill me-1"></i> : <i className="bi bi-exclamation-circle-fill me-1"></i>}
                                            {couponMessage.text}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- MATH TOTALS --- */}
                            <Row className="mb-2 fs-6">
                                <Col className="text-muted">Subtotal</Col>
                                <Col className="text-end fw-bold">₹{subtotal.toFixed(2)}</Col>
                            </Row>

                            {/* --- NEW: DISCOUNT ROW --- */}
                            {discountAmount > 0 && (
                                <Row className="mb-2 fs-6 text-success animate__animated animate__fadeIn">
                                    <Col className="fw-bold">Discount ({appliedCoupon?.code})</Col>
                                    <Col className="text-end fw-bold">- ₹{discountAmount.toFixed(2)}</Col>
                                </Row>
                            )}

                            <Row className="mb-3 fs-6">
                                <Col className="text-muted">Shipping</Col>
                                <Col className="text-end fw-bold">
                                    {shippingPrice === 0 ? <span className="text-success">Free</span> : `₹${shippingPrice.toFixed(2)}`}
                                </Col>
                            </Row>
                            <hr />
                            <Row className="mb-2 fs-4">
                                <Col className="fw-bold">Total</Col>
                                <Col className="text-end fw-bold text-primary animate__animated animate__flash">₹{totalPrice.toFixed(2)}</Col>
                            </Row>

                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CheckoutPage;