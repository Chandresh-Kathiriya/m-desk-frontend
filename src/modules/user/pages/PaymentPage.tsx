import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { savePaymentMethod } from '../../../store/actions/user/cartActions';
import { RootState } from '../../../store/reducers';
import CheckoutSteps from '../../../common/components/CheckoutSteps';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();

  // Pull cart state
  const cart = useSelector((state: RootState) => state.cart || {});
  const { shippingAddress } = cart as any;

  // Guardrail: If they haven't filled out shipping, kick them back
  useEffect(() => {
    if (!shippingAddress || !shippingAddress.address) {
      navigate('/checkout/shipping');
    }
  }, [shippingAddress, navigate]);

  // Local state for the selected method (defaults to Stripe)
  const [paymentMethod, setPaymentMethod] = useState<string>('Stripe');

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    
    // Move to the final review screen
    navigate('/checkout/placeorder');
  };

  return (
    <Container className="py-5 min-vh-100">
      {/* Progress Bar: Steps 1, 2, and 3 are active */}
      <CheckoutSteps step1 step2 step3 />
      
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <h2 className="fw-bold mb-4 text-center">Payment Method</h2>
              
              <Form onSubmit={submitHandler}>
                <Form.Group>
                  <Form.Label className="fw-bold text-muted small text-uppercase mb-3">
                    Select Method
                  </Form.Label>
                  
                  <Col>
                    <div className="border rounded p-3 mb-4 bg-light">
                      <Form.Check
                        type="radio"
                        label={
                          <span className="fw-bold ms-2">
                            Stripe (Credit / Debit Card)
                          </span>
                        }
                        id="Stripe"
                        name="paymentMethod"
                        value="Stripe"
                        checked={paymentMethod === 'Stripe'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="fs-5 d-flex align-items-center"
                      />
                      <div className="text-muted small ms-4 mt-1">
                        Securely pay using your Visa, MasterCard, or Amex via Stripe.
                      </div>
                    </div>
                  </Col>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="dark" 
                  size="lg" 
                  className="w-100 py-3 fw-bold text-uppercase mt-2 shadow"
                >
                  Continue to Order Review
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;