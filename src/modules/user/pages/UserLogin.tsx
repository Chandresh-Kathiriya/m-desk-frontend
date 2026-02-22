import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { loginUser } from '../../../store/actions/user/authActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.auth; // Accessing from single schema

  const userAuth = useSelector((state: RootState) => state.userAuth);
  const { loading, error, isAuthenticated } = userAuth;

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card style={{ width: '400px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Card.Body>
          <h2 className="text-center mb-4">{text.loginTitle}</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>{text.emailLabel}</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>{text.passwordLabel}</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100" disabled={loading}>
              {loading ? 'Loading...' : text.loginBtn}
            </Button>
          </Form>
          
          <div className="text-center mt-3">
            {text.noAccount} <Link to="/register">{text.registerBtn}</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default UserLogin;