import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { textSchema } from '../../../schemas/text/schema';

const ProductForm: React.FC = () => {
  const { id } = useParams(); // If there is an ID, we are editing. If not, creating.
  const navigate = useNavigate();
  const text = textSchema.en.adminProducts;

  const [formData, setFormData] = useState({
    productName: '',
    productCategory: 'unisex',
    productType: 'shirt',
    material: 'cotton',
    colors: '', // We will split this into an array on submit
    salesPrice: 0,
    salesTax: 0,
    purchasePrice: 0,
    purchaseTax: 0,
    published: false,
  });

  const isEditing = Boolean(id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Handle the checkbox specifically
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the colors string into an array before sending to API
    const formattedData = {
      ...formData,
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
    };

    if (isEditing) {
      console.log('Dispatch update action with:', formattedData);
    } else {
      console.log('Dispatch create action with:', formattedData);
    }
    
    // navigate('/admin/products');
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: '800px', borderTop: '4px solid var(--primary-color)' }}>
        <Card.Body>
          <h3 className="mb-4 text-center">{isEditing ? text.formTitleEdit : text.formTitleAdd}</h3>
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>{text.nameLabel}</Form.Label>
              <Form.Control type="text" name="productName" value={formData.productName} onChange={handleChange} required />
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>{text.categoryLabel}</Form.Label>
                  <Form.Select name="productCategory" value={formData.productCategory} onChange={handleChange}>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="children">Children</option>
                    <option value="unisex">Unisex</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>{text.typeLabel}</Form.Label>
                  <Form.Select name="productType" value={formData.productType} onChange={handleChange}>
                    <option value="shirt">Shirt</option>
                    <option value="pant">Pant</option>
                    <option value="t-shirt">T-Shirt</option>
                    <option value="kurta">Kurta</option>
                    <option value="dress">Dress</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>{text.materialLabel}</Form.Label>
                  <Form.Select name="material" value={formData.material} onChange={handleChange}>
                    <option value="cotton">Cotton</option>
                    <option value="nylon">Nylon</option>
                    <option value="polyester">Polyester</option>
                    <option value="silk">Silk</option>
                    <option value="blend">Blend</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{text.colorsLabel}</Form.Label>
              <Form.Control type="text" name="colors" placeholder="e.g., Red, Blue, Black" value={formData.colors} onChange={handleChange} required />
            </Form.Group>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{text.salesPriceLabel}</Form.Label>
                  <Form.Control type="number" name="salesPrice" value={formData.salesPrice} onChange={handleChange} min="0" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{text.salesTaxLabel}</Form.Label>
                  <Form.Control type="number" name="salesTax" value={formData.salesTax} onChange={handleChange} min="0" max="100" required />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{text.purchasePriceLabel}</Form.Label>
                  <Form.Control type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} min="0" required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>{text.purchaseTaxLabel}</Form.Label>
                  <Form.Control type="number" name="purchaseTax" value={formData.purchaseTax} onChange={handleChange} min="0" max="100" required />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-4">
              <Form.Check 
                type="switch"
                id="published-switch"
                name="published"
                label={text.publishedLabel}
                checked={formData.published}
                onChange={handleChange}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate('/admin/products')}>
                {text.cancelBtn}
              </Button>
              <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--primary-color)' }}>
                {text.saveBtn}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductForm;