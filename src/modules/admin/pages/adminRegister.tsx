import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { registerAdmin } from '../../../store/actions/admin/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

const AdminRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobile: '', city: '', state: '', pincode: ''
  });

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.auth;
  const adminText = textSchema.en.adminAuth;

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { loading, error, isAuthenticated } = adminAuth;

  useEffect(() => {
    if (isAuthenticated) navigate('/admin/dashboard');
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(registerAdmin(formData));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card style={{ width: '500px', padding: '20px', boxShadow: 'var(--shadow-medium)', borderTop: '4px solid var(--danger-color)' }}>
        <Card.Body>
          <h2 className="text-center mb-4">{adminText.registerTitle}</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>{text.nameLabel}</Form.Label>
              <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{text.emailLabel}</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{text.passwordLabel}</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{text.mobileLabel}</Form.Label>
              <Form.Control type="text" name="mobile" value={formData.mobile} onChange={handleChange} required />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{text.cityLabel}</Form.Label>
                  <Form.Control type="text" name="city" value={formData.city} onChange={handleChange} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{text.stateLabel}</Form.Label>
                  <Form.Control type="text" name="state" value={formData.state} onChange={handleChange} required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Label>{text.pincodeLabel}</Form.Label>
              <Form.Control type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Loading...' : text.registerBtn}
            </Button>
          </Form>

          <div className="text-center mt-3">
            {text.hasAccount} <Link to="/admin/login" className="text-danger">{text.loginBtn}</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminRegister;