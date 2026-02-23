import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/reducers';
import { logoutUser } from '../../store/actions/user/authActions';
import { logoutAdmin } from '../../store/actions/admin/authActions';
import { textSchema } from '../../schemas/text/schema';

const Header: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.common;

  const userAuth = useSelector((state: RootState) => state.userAuth);
  const { isAuthenticated: isUserAuth, userInfo } = userAuth;

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { isAuthenticated: isAdminAuth, adminInfo } = adminAuth;

  const handleUserLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const handleAdminLogout = () => {
    dispatch(logoutAdmin());
    navigate('/admin/login');
  };

  return (
    <Navbar expand="lg" style={{ backgroundColor: 'var(--primary-color)' }} variant="dark" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">{text.brandName}</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            
            {/* Admin Navigation */}
            {isAdminAuth ? (
              <>
                <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
                <NavDropdown title="Master Data" id="admin-master-data-dropdown">
                  <NavDropdown.Item as={Link} to="/admin/products">Products</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/admin/categories">Categories</NavDropdown.Item>
                </NavDropdown>
                <span className="text-white mx-3" style={{ fontSize: 'var(--font-sm)' }}>
                  Admin: {adminInfo?.user?.name}
                </span>
                <Button variant="outline-light" onClick={handleAdminLogout} size="sm">
                  {text.logout}
                </Button>
              </>
            ) : isUserAuth ? (
              /* User Navigation */
              <>
                <Nav.Link as={Link} to="/">{text.home}</Nav.Link>
                <span className="text-white mx-3" style={{ fontSize: 'var(--font-sm)' }}>
                  Hello, {userInfo?.user?.name}
                </span>
                <Button variant="outline-light" onClick={handleUserLogout} size="sm">
                  {text.logout}
                </Button>
              </>
            ) : (
              /* Public Navigation */
              <>
                <Nav.Link as={Link} to="/login">User Login</Nav.Link>
                <Nav.Link as={Link} to="/admin/login" className="text-warning">Admin Access</Nav.Link>
              </>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;