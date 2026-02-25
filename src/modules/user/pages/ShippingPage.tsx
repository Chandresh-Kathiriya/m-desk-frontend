import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../../../store/actions/user/cartActions';
import { RootState } from '../../../store/reducers';
import CheckoutSteps from '../../../common/components/CheckoutSteps';

const ShippingPage: React.FC = () => {
  // Pull existing shipping address from Redux
  const cart = useSelector((state: RootState) => state.cart || {});
  const { shippingAddress } = cart as any;

  // Local State for the form inputs
  const [address, setAddress] = useState<string>(shippingAddress?.address || '');
  const [city, setCity] = useState<string>(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState<string>(shippingAddress?.postalCode || '');
  const [country, setCountry] = useState<string>(shippingAddress?.country || '');

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save the data to Redux & LocalStorage
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    
    // Push the user to the Payment Selection screen
    navigate('/checkout/payment'); 
  };

  return (
    <Container className="py-5 min-vh-100">
      {/* Show the progress bar, highlighting step 1 and 2 */}
      <CheckoutSteps step1 step2 />
      
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <h2 className="fw-bold mb-4 text-center">Shipping Address</h2>
              
              <Form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="address">
                  <Form.Label className="fw-bold text-muted small text-uppercase">Street Address</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter street address"
                    value={address}
                    required
                    onChange={(e) => setAddress(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="city">
                  <Form.Label className="fw-bold text-muted small text-uppercase">City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter city"
                    value={city}
                    required
                    onChange={(e) => setCity(e.target.value)}
                    className="py-2"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="postalCode">
                      <Form.Label className="fw-bold text-muted small text-uppercase">Postal Code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter postal code"
                        value={postalCode}
                        required
                        onChange={(e) => setPostalCode(e.target.value)}
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4" controlId="country">
                      <Form.Label className="fw-bold text-muted small text-uppercase">Country</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter country"
                        value={country}
                        required
                        onChange={(e) => setCountry(e.target.value)}
                        className="py-2"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button 
                  type="submit" 
                  variant="dark" 
                  size="lg" 
                  className="w-100 py-3 fw-bold text-uppercase mt-2 shadow"
                >
                  Continue to Payment
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ShippingPage;