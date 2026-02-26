import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { RootState } from '../../../store/reducers';
import { listMyOrders } from '../../../store/actions/user/orderActions';

const OrderHistoryPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  
  // This hook grabs the ?payment_intent=... from the Stripe redirect URL!
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  // Redux State
  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  const orderListMy = useSelector((state: RootState) => state.orderListMy || {});
  const { loading, error, orders = [] } = orderListMy as any;

  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);

  useEffect(() => {
    if (redirectStatus === 'succeeded') {
      setPaymentMessage("Payment successful! Your order is being processed.");
    }

    if (userInfo && userInfo.token) {
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo, paymentIntent, redirectStatus]);

  const formatOrderId = (id: string) => {
    return `ORD-${id.slice(-6).toUpperCase()}`;
  };

  return (
    <Container className="py-5 min-vh-100">
      <h2 className="fw-bold mb-4">My Orders</h2>

      {paymentMessage && <Alert variant="success" className="shadow-sm">{paymentMessage}</Alert>}

      {loading ? (
        <Spinner animation="border" className="d-block mx-auto mt-5" />
      ) : error ? (
        <Alert variant="danger" className="text-center">{error}</Alert>
      ) : orders.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <h4>You haven't placed any orders yet.</h4>
          <Link to="/">
            <Button variant="dark" className="mt-3">Start Shopping</Button>
          </Link>
        </Alert>
      ) : (
        <div className="table-responsive shadow-sm rounded border bg-white p-3">
          <Table hover className="align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th>ORDER ID</th>
                <th>DATE</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERED</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr key={order._id}>
                  <td className="font-monospace fw-bold text-dark">{formatOrderId(order._id)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="fw-bold text-primary">₹{order.totalPrice.toFixed(2)}</td>
                  <td>
                    {order.isPaid ? (
                      <Badge bg="success" className="p-2">Paid</Badge>
                    ) : (
                      <Badge bg="danger" className="p-2">Unpaid</Badge>
                    )}
                  </td>
                  <td>
                    {order.isDelivered ? (
                      <Badge bg="success" className="p-2">{new Date(order.deliveredAt).toLocaleDateString()}</Badge>
                    ) : (
                      <Badge bg="warning" text="dark" className="p-2">Processing</Badge>
                    )}
                  </td>
                  <td>
                    <Link to={`/order/${order._id}`}>
                      <Button variant="outline-dark" size="sm" className="fw-bold">
                        Details
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default OrderHistoryPage;