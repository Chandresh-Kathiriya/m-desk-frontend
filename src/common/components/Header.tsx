import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import { logoutUser } from '../../store/actions/user/authActions';
import { textSchema } from '../../schemas/text/schema';

const Header: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.common;

  // Pulling user authentication state from Redux
  const userAuth = useSelector((state: RootState) => state.userAuth);
  const { isAuthenticated, userInfo } = userAuth;

  const logoutHandler = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <Navbar expand="lg" style={{ backgroundColor: 'var(--primary-color)' }} variant="dark" className="shadow-sm">
      <Container>
        {/* Using 'as={Link}' integrates React Router seamlessly with Bootstrap */}
        <Navbar.Brand as={Link} to="/">{text.brandName}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/">{text.home}</Nav.Link>
            
            {isAuthenticated ? (
              <>
                <span className="text-white mx-3" style={{ fontSize: 'var(--font-sm)' }}>
                  Hello, {userInfo?.user?.name}
                </span>
                <Button variant="outline-light" onClick={logoutHandler} size="sm" style={{ borderRadius: 'var(--radius-sm)' }}>
                  {text.logout}
                </Button>
              </>
            ) : (
              <Nav.Link as={Link} to="/login">{text.login}</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;