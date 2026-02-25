import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Image, Form, Button, Card, Alert, Spinner, Badge } from 'react-bootstrap';
import { removeFromCart, fetchUserCart, updateCartQty } from '../../../store/actions/user/cartActions';
import { RootState } from '../../../store/reducers';

const CartPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // Pull cart state from Redux
  const cart = useSelector((state: RootState) => state.cart || {});
  const { cartItems = [], loading, error } = cart as any;

  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  // Always fetch the freshest cart data from the DB when they open this page
  useEffect(() => {
    if (userInfo && userInfo.token) {
      dispatch(fetchUserCart());
    }
  }, [dispatch, userInfo]);

  const removeFromCartHandler = (sku: string) => {
    if (window.confirm('Remove this item from your cart?')) {
      dispatch(removeFromCart(sku));
    }
  };

  const handleQtyChange = (item: any, newQty: number) => {
    // Condition 1: If it drops below 1, remove it completely
    if (newQty < 1) {
      removeFromCartHandler(item.sku);
    } 
    // Condition 2: Prevent them from exceeding available stock
    else if (newQty > item.maxStock) {
      alert(`Sorry, we only have ${item.maxStock} of these left in stock!`);
    } 
    // Condition 3: Update the quantity securely in the database
    else {
      dispatch(updateCartQty(item.sku, newQty));
    }
  };

  const checkoutHandler = () => {
    // We will build this route next!
    navigate('/checkout/shipping'); 
  };

  // Helper math functions for the Order Summary
  const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.qty, 0);
  const totalPrice = cartItems.reduce((acc: number, item: any) => acc + item.qty * item.price, 0);

  return (
    <Container className="py-5 min-vh-100">
      <h2 className="fw-bold mb-4">Shopping Cart</h2>

      {loading ? (
        <Spinner animation="border" className="d-block mx-auto mt-5" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : cartItems.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <h4 className="mb-3">Your cart is completely empty.</h4>
          <p className="text-muted mb-4">Looks like you haven't added any clothing yet.</p>
          <Link to="/">
            <Button variant="dark" size="lg">Start Shopping</Button>
          </Link>
        </Alert>
      ) : (
        <Row className="g-5">
          {/* LEFT COLUMN: Cart Items List */}
          <Col md={8}>
            <ListGroup variant="flush" className="border-top border-bottom">
              {cartItems.map((item: any) => (
                <ListGroup.Item key={item.sku} className="py-4 px-0">
                  <Row className="align-items-center">
                    {/* Item Image */}
                    <Col xs={3} sm={2}>
                      <Image 
                        src={item.image || 'https://via.placeholder.com/150'} 
                        alt={item.name} 
                        fluid 
                        rounded 
                        className="border shadow-sm"
                      />
                    </Col>

                    {/* Item Details */}
                    <Col xs={9} sm={4}>
                      <Link to={`/product/${item.product}`} className="text-decoration-none text-dark fw-bold fs-5">
                        {item.name}
                      </Link>
                      <div className="text-muted mt-1 small">
                        <span className="text-capitalize me-2">Color: <strong>{item.color}</strong></span> | 
                        <span className="text-uppercase ms-2">Size: <strong>{item.size}</strong></span>
                      </div>
                      <div className="text-muted font-monospace mt-1" style={{ fontSize: '0.75rem' }}>
                        SKU: {item.sku}
                      </div>
                    </Col>

                    {/* Item Price */}
                    <Col xs={4} sm={2} className="mt-3 mt-sm-0 fw-bold text-primary fs-5 text-sm-center">
                      ₹{item.price.toFixed(2)}
                    </Col>

                    {/* Static Quantity Display (Since math is done on Add to Cart) */}
                    <Col xs={4} sm={2} className="mt-3 mt-sm-0 text-center">
                       <div className="text-muted small mb-1">Qty</div>
                       <div className="d-flex align-items-center justify-content-center gap-2">
                         <Button 
                           variant="outline-secondary" 
                           size="sm" 
                           onClick={() => handleQtyChange(item, item.qty - 1)}
                         >
                           -
                         </Button>
                         
                         <span className="fw-bold fs-5 px-1">{item.qty}</span>
                         
                         <Button 
                           variant="outline-secondary" 
                           size="sm" 
                           onClick={() => handleQtyChange(item, item.qty + 1)}
                           disabled={item.qty >= item.maxStock} // Auto-disable if max stock reached
                         >
                           +
                         </Button>
                       </div>
                    </Col>

                    {/* Remove Button */}
                    <Col xs={4} sm={2} className="mt-3 mt-sm-0 text-end">
                      <Button 
                        variant="outline-danger" 
                        size="sm" 
                        onClick={() => removeFromCartHandler(item.sku)}
                        title="Remove from Cart"
                      >
                        <i className="bi bi-trash"></i> Remove
                      </Button>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Col>

          {/* RIGHT COLUMN: Order Summary */}
          <Col md={4}>
            <Card className="shadow-sm border-0 bg-light">
              <Card.Body className="p-4">
                <h4 className="fw-bold border-bottom pb-3 mb-4">Order Summary</h4>
                
                <div className="d-flex justify-content-between mb-3 fs-5">
                  <span className="text-muted">Total Items:</span>
                  <span className="fw-bold">{totalItems}</span>
                </div>

                <div className="d-flex justify-content-between mb-4 fs-4">
                  <span className="fw-bold">Subtotal:</span>
                  <span className="fw-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                </div>

                <hr className="mb-4" />

                <Button 
                  variant="dark" 
                  size="lg" 
                  className="w-100 py-3 fw-bold text-uppercase shadow"
                  onClick={checkoutHandler}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </Button>
                
                <div className="text-center mt-3 small text-muted">
                  <i className="bi bi-shield-lock me-1"></i> Secure Checkout
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;