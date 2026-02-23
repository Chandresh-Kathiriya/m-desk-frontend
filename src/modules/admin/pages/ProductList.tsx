import React, { useEffect } from 'react';
import { Container, Table, Button, Badge, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { textSchema } from '../../../schemas/text/schema';

const ProductList: React.FC = () => {
  const text = textSchema.en.adminProducts;

  // Placeholder for Redux state (we will replace this when we wire up Redux)
  const products = [
    { _id: '1', productName: 'Classic Oxford', productCategory: 'men', salesPrice: 1200, currentStock: 45, published: true },
    { _id: '2', productName: 'Summer Floral Dress', productCategory: 'women', salesPrice: 2500, currentStock: 0, published: false },
  ];

  const deleteHandler = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      // Dispatch delete action here
      console.log('Deleting product:', id);
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
              {products.map((product) => (
                <tr key={product._id} className="align-middle">
                  <td><strong>{product.productName}</strong></td>
                  <td className="text-capitalize">{product.productCategory}</td>
                  <td>₹{product.salesPrice}</td>
                  <td>
                    {/* Badge color changes if stock is empty */}
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
    </Container>
  );
};

export default ProductList;