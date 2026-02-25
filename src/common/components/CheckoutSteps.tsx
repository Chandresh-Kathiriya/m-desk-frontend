import React from 'react';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

interface CheckoutStepsProps {
  step1?: boolean;
  step2?: boolean;
  step3?: boolean;
  step4?: boolean;
}

const CheckoutSteps: React.FC<CheckoutStepsProps> = ({ step1, step2, step3, step4 }) => {
  return (
    <Nav className="justify-content-center mb-5 border-bottom pb-3">
      <Nav.Item>
        {step1 ? (
          <LinkContainer to="/login">
            <Nav.Link className="fw-bold text-dark">Sign In</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled className="text-muted">Sign In</Nav.Link>
        )}
      </Nav.Item>
      <div className="d-flex align-items-center mx-2 text-muted">&gt;</div>

      <Nav.Item>
        {step2 ? (
          <LinkContainer to="/checkout/shipping">
            <Nav.Link className="fw-bold text-dark">Shipping</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled className="text-muted">Shipping</Nav.Link>
        )}
      </Nav.Item>
      <div className="d-flex align-items-center mx-2 text-muted">&gt;</div>

      <Nav.Item>
        {step3 ? (
          <LinkContainer to="/checkout/payment">
            <Nav.Link className="fw-bold text-dark">Payment</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled className="text-muted">Payment</Nav.Link>
        )}
      </Nav.Item>
      <div className="d-flex align-items-center mx-2 text-muted">&gt;</div>

      <Nav.Item>
        {step4 ? (
          <LinkContainer to="/checkout/placeorder">
            <Nav.Link className="fw-bold text-dark">Place Order</Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled className="text-muted">Place Order</Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;