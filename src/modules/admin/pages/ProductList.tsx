import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Table, Button, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { listAdminProducts, deleteProduct } from '../../../store/actions/admin/productActions';
import { RootState } from '../../../store/reducers';

const ProductList: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const productList = useSelector((state: RootState) => state.productList);
  const { loading, error, products } = productList;

  const productDelete = useSelector((state: RootState) => state.productDelete);
  const { success: successDelete } = productDelete;

  useEffect(() => {
    dispatch(listAdminProducts());
  }, [dispatch, successDelete]);

  const deleteHandler = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? All its SKUs will be lost.')) {
      dispatch(deleteProduct(id));
    }
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm border-top border-primary border-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">Product Catalog</h3>
            <Button variant="primary" onClick={() => navigate('/admin/products/new')}>
              + Add New Product
            </Button>
          </div>

          {loading ? (
            <Spinner animation="border" className="d-block mx-auto my-5" />
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : (
            <Table responsive hover className="align-middle bg-white">
              <thead className="table-light">
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Type</th>
                  <th>Variants (SKUs)</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products && products.map((product: any) => (
                  <tr key={product._id}>
                    <td className="fw-bold">{product.productName}</td>
                    <td>{product.productCategory?.name || '-'}</td>
                    <td>{product.brand?.name || '-'}</td>
                    <td><Badge bg="info" className="text-dark">{product.productType}</Badge></td>
                    <td>
                      <Badge bg="secondary" pill>
                        {product.variants?.length || 0} SKUs
                      </Badge>
                    </td>
                    <td>
                      {product.published ? (
                        <Badge bg="success">Published</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">Draft</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <Button variant="outline-primary" size="sm" className="me-2" onClick={() => navigate(`/admin/products/${product._id}/edit`)}>
                        Edit
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => deleteHandler(product._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!products || products.length === 0) && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No products found. Start by creating a new one!
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductList;