import React, { useEffect } from 'react';
import { Container, Card, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/reducers';
import { verifyOrderPayment } from '../../../store/actions/user/orderActions';
import { clearUserCart } from '../../../store/actions/user/cartActions';

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');

  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  useEffect(() => {
    // 1. Clear cart & VERIFY PAYMENT in the background
    const handleSuccessLogic = () => {
      if (paymentIntent && userInfo?.token) {
        // Tell the backend to verify Stripe and mark the order as PAID
        dispatch(verifyOrderPayment(paymentIntent));

        // Clear the cart in both DB and Redux
        dispatch(clearUserCart());
      }
    };

    handleSuccessLogic();

    // 2. Start the countdown to redirect
    const redirectTimer = setTimeout(() => {
      navigate('/orders');
    }, 4000); 

    return () => clearTimeout(redirectTimer); 
  }, [paymentIntent, userInfo, dispatch, navigate]);

  return (
    <Container className="py-5 d-flex justify-content-center align-items-center min-vh-100">
      <Card className="shadow-lg border-0 text-center p-5" style={{ maxWidth: '500px' }}>
        <div className="mb-4">
          {/* A big green checkmark circle */}
          <div className="rounded-circle bg-success d-flex justify-content-center align-items-center mx-auto" style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-check-lg text-white" style={{ fontSize: '3rem' }}></i>
          </div>
        </div>
        
        <h2 className="fw-bold mb-3">Payment Successful!</h2>
        <p className="text-muted fs-5 mb-4">
          Thank you for your purchase. We are preparing your order for shipment.
        </p>
        
        <div className="d-flex justify-content-center align-items-center text-muted small">
          <Spinner animation="border" size="sm" className="me-2" />
          Redirecting to your orders...
        </div>
      </Card>
    </Container>
  );
};

export default OrderSuccessPage;