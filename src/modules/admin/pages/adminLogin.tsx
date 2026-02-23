import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { loginAdmin } from '../../../store/actions/admin/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.auth;
  const adminText = textSchema.en.adminAuth;

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { loading, error, isAuthenticated } = adminAuth;

  useEffect(() => {
    // Redirect to a specific admin dashboard upon successful login
    if (isAuthenticated) navigate('/admin/dashboard');
  }, [isAuthenticated, navigate]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginAdmin(email, password));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Card style={{ width: '400px', padding: '20px', boxShadow: 'var(--shadow-medium)', borderTop: '4px solid var(--danger-color)' }}>
        <Card.Body>
          <h2 className="text-center mb-4">{adminText.loginTitle}</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>{text.emailLabel}</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>{text.passwordLabel}</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Loading...' : text.loginBtn}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            {text.noAccount} <Link to="/admin/register" className="text-danger">{text.registerBtn}</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminLogin;