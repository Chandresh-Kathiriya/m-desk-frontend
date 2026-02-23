import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Table, Button, Badge, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { listAdminProducts, deleteProduct } from '../../../store/actions/admin/productActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const text = textSchema.en.adminProducts;

  // Get auth info to ensure only admins are here (optional safeguard)
  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { adminInfo } = adminAuth;

  // Get the product list state
  const productList = useSelector((state: RootState) => state.productList);
  const { loading, error, products } = productList;

  // Get the delete state so we know when to refresh the list
  const productDelete = useSelector((state: RootState) => state.productDelete);
  const { success: successDelete } = productDelete;

  useEffect(() => {
    if (!adminInfo) {
      navigate('/admin/login');
    } else {
      // Re-fetch products on load, or when a product is successfully deleted
      dispatch(listAdminProducts());
    }
  }, [dispatch, navigate, adminInfo, successDelete]);

  const deleteHandler = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{text.title}</h2>
        <Link to="/admin/products/new">
          <Button variant="primary" style={{ backgroundColor: 'var(--primary-color)' }}>
            + {text.addProductBtn}
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Card className="shadow-sm">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead style={{ backgroundColor: 'var(--bg-light)' }}>
                <tr>
                  <th>{text.tableHeaders.name}</th>
                  <th>{text.tableHeaders.category}</th>
                  <th>{text.tableHeaders.price}</th>
                  <th>{text.tableHeaders.stock}</th>
                  <th>{text.tableHeaders.status}</th>
                  <th className="text-end">{text.tableHeaders.actions}</th>
                </tr>
              </thead>
              <tbody>
                {products?.map((product: any) => (
                  <tr key={product._id} className="align-middle">
                    <td><strong>{product.productName}</strong></td>
                    <td className="text-capitalize">{product.productCategory?.name || '-'}</td>
                    <td>₹{product.salesPrice}</td>
                    <td>
                      <Badge bg={product.currentStock > 0 ? 'success' : 'danger'}>
                        {product.currentStock}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={product.published ? 'primary' : 'secondary'}>
                        {product.published ? 'Published' : 'Hidden'}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Link to={`/admin/products/${product._id}/edit`}>
                        <Button variant="outline-info" size="sm" className="me-2">
                          {text.editBtn}
                        </Button>
                      </Link>
                      <Button variant="outline-danger" size="sm" onClick={() => deleteHandler(product._id)}>
                        {text.deleteBtn}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ProductList;