import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert, Badge, Image, ListGroup, InputGroup } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { listProductDetails, createProduct, updateProduct } from '../../../store/actions/admin/productActions';
import { RootState } from '../../../store/reducers';
import { textSchema } from '../../../schemas/text/schema';
import { PRODUCT_CREATE_RESET, PRODUCT_UPDATE_RESET } from '../../../store/constants/admin/productConstants';

const ProductForm: React.FC = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const text = textSchema.en.adminProducts;
  const isEditing = Boolean(id);
  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { adminInfo } = adminAuth;

  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '', 
    productType: 'shirt',
    material: 'cotton',
    colors: '', 
    salesPrice: 0,
    salesTax: 0,
    purchasePrice: 0,
    purchaseTax: 0,
    published: false,
    images: [] as string[],
    currentStock: 0,
  });

  // --- NEW: DYNAMIC IMAGE SPECS STATE ---
  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  // Default to two empty specs, but admins can add more!
  const [imgSpecs, setImgSpecs] = useState([{ name: 'color', value: '' }, { name: 'view', value: '' }]);

  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownCats, setDropdownCats] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const productDetails = useSelector((state: RootState) => state.productDetails);
  const { loading: loadingDetails, error: errorDetails, product } = productDetails;
  const productCreate = useSelector((state: RootState) => state.productCreate);
  const { loading: loadingCreate, error: errorCreate, success: successCreate } = productCreate;
  const productUpdate = useSelector((state: RootState) => state.productUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate;

  useEffect(() => {
    // If there is no admin logged in, kick them back to the login page immediately!
    if (!adminInfo || !adminInfo.token) {
      navigate('/admin/login');
    }
  }, [adminInfo, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCategories = async (query = '') => {
    setIsSearching(true);
    try {
      const { data } = await axios.get(`/api/categories?search=${query}`);
      setDropdownCats(data.categories);
      setShowDropdown(true);
    } catch (error) {
      console.error('Error fetching categories', error);
    }
    setIsSearching(false);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== '' && showDropdown) fetchCategories(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (successCreate || successUpdate) {
      dispatch({ type: PRODUCT_CREATE_RESET });
      dispatch({ type: PRODUCT_UPDATE_RESET });
      navigate('/admin/products');
    } else if (isEditing) {
      if (!product || product._id !== id) {
        dispatch(listProductDetails(id as string));
      } else {
        setFormData({
          productName: product.productName,
          productCategory: product.productCategory?._id || product.productCategory, 
          productType: product.productType,
          material: product.material,
          colors: product.colors.join(', '), 
          salesPrice: product.salesPrice,
          salesTax: product.salesTax,
          purchasePrice: product.purchasePrice,
          purchaseTax: product.purchaseTax,
          published: product.published,
          images: product.images || [],
          currentStock: product.currentStock || 0,
        });
        if (product.productCategory?.name) setSearchTerm(product.productCategory.name);
      }
    }
  }, [dispatch, navigate, id, isEditing, product, successCreate, successUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const selectCategory = (categoryId: string, categoryName: string) => {
    setFormData({ ...formData, productCategory: categoryId });
    setSearchTerm(categoryName);
    setShowDropdown(false);
  };

  // --- DYNAMIC IMAGE LOGIC ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large! Please upload an image smaller than 10MB.');
      e.target.value = ''; 
      return;
    }
    
    setPendingImage(file);
    // Reset specs when new image is selected
    setImgSpecs([{ name: 'color', value: '' }, { name: 'view', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', val: string) => {
    const updated = [...imgSpecs];
    updated[index][field] = val;
    setImgSpecs(updated);
  };

  const confirmUpload = async () => {
    if (!pendingImage) return;

    const validSpecs = imgSpecs.filter(s => s.name.trim() && s.value.trim());
    const specString = validSpecs.map(s => `${s.name.trim().toLowerCase()}-${s.value.trim().toLowerCase()}`).join('_');

    const originalNameWithoutExt = pendingImage.name.substring(0, pendingImage.name.lastIndexOf('.')) || pendingImage.name;
    const finalSpecName = specString ? `${specString}_${originalNameWithoutExt}` : originalNameWithoutExt;

    const uploadData = new FormData();
    uploadData.append('fileName', finalSpecName);
    uploadData.append('image', pendingImage);
    
    setUploading(true);

    try {
      // --- NEW: Attach the JWT Token securely in the Authorization Header ---
      const config = { 
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${adminInfo.token}` // The backend will verify this!
        } 
      };
      
      const { data } = await axios.post('/api/upload', uploadData, config);

      setFormData({ ...formData, images: [...formData.images, data.imageUrl] });
      setUploading(false);
      setPendingImage(null); 
    } catch (error: any) {
      setUploading(false);
      alert(error.response?.data?.message || 'Failed to upload image.');
    }
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productCategory) return alert('Please search and select a valid Category.');
    
    const formattedData = {
      ...formData,
      colors: formData.colors.split(',').map((c: string) => c.trim()).filter((c: string) => c),
    };

    if (isEditing) dispatch(updateProduct({ _id: id, ...formattedData }));
    else dispatch(createProduct(formattedData));
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: '800px', borderTop: '4px solid var(--primary-color)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">{isEditing ? text.formTitleEdit : text.formTitleAdd}</h3>
            {isEditing && (
              <h5>
                <Badge bg={formData.currentStock > 0 ? 'success' : 'danger'}>
                  Current Stock: {formData.currentStock}
                </Badge>
              </h5>
            )}
          </div>
          
          {loadingDetails && <Spinner animation="border" className="d-block mx-auto mb-3" />}
          {errorDetails && <Alert variant="danger">{errorDetails}</Alert>}
          
          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>{text.nameLabel}</Form.Label>
              <Form.Control type="text" name="productName" value={formData.productName} onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-4 p-3 bg-light rounded border">
              <Form.Label className="fw-bold">Product Images</Form.Label>
              <Form.Control type="file" onChange={handleFileSelect} disabled={uploading} accept="image/*" />
              
              {/* --- DYNAMIC SPECIFICATION FORM --- */}
              {pendingImage && (
                <Card className="mt-3 border-info">
                  <Card.Body className="bg-white">
                    <div className="d-flex justify-content-between mb-2">
                      <h6 className="text-info m-0">Image Specifications</h6>
                      <Button variant="outline-primary" size="sm" onClick={() => setImgSpecs([...imgSpecs, { name: '', value: '' }])}>
                        + Add Spec
                      </Button>
                    </div>
                    
                    {imgSpecs.map((spec, index) => (
                      <Row key={index} className="mb-2">
                        <Col md={5}>
                          <InputGroup size="sm">
                            <InputGroup.Text>Name</InputGroup.Text>
                            <Form.Control value={spec.name} onChange={(e) => handleSpecChange(index, 'name', e.target.value)} placeholder="e.g. color" />
                          </InputGroup>
                        </Col>
                        <Col md={5}>
                          <InputGroup size="sm">
                            <InputGroup.Text>Value</InputGroup.Text>
                            <Form.Control value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} placeholder="e.g. black" />
                          </InputGroup>
                        </Col>
                        <Col md={2}>
                          <Button variant="outline-danger" size="sm" className="w-100" onClick={() => setImgSpecs(imgSpecs.filter((_, i) => i !== index))}>
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    
                    <div className="d-flex justify-content-end mt-3">
                      <Button variant="info" size="sm" className="text-white px-4" onClick={confirmUpload} disabled={uploading}>
                        {uploading ? <Spinner size="sm" animation="border" /> : `Upload File: ${pendingImage.name}`}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}
              
              <div className="d-flex flex-wrap gap-2 mt-3">
                {formData.images.map((imgUrl, index) => (
                  <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                    <Image src={imgUrl} thumbnail style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <Button 
                      variant="danger" size="sm" className="position-absolute top-0 end-0 p-0" 
                      style={{ width: '20px', height: '20px', lineHeight: '10px' }}
                      onClick={() => setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })}
                    >
                      &times;
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

            {/* Rest of the form inputs remain the same... */}
            <Row className="mb-3">
              <Col md={4} ref={dropdownRef}>
                <Form.Group className="position-relative">
                  <Form.Label>{text.categoryLabel}</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="Search categories..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    onFocus={() => { setShowDropdown(true); fetchCategories(searchTerm); }}
                  />
                  {isSearching && <Spinner size="sm" animation="border" className="position-absolute" style={{ right: '10px', top: '38px' }} />}
                  
                  {showDropdown && dropdownCats.length > 0 && (
                    <ListGroup className="position-absolute w-100 shadow-sm" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                      {dropdownCats.map((cat) => (
                        <ListGroup.Item key={cat._id} action onClick={() => selectCategory(cat._id, cat.name)} className="text-capitalize">
                          {cat.name}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  )}
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
                    <option value="shorts">Shorts</option>
                    <option value="jacket">Jacket</option>
                    <option value="sweater">Sweater</option>
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
                    <option value="wool">Wool</option>
                    <option value="linen">Linen</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{text.colorsLabel}</Form.Label>
              <Form.Control type="text" name="colors" placeholder="e.g., Red, Blue" value={formData.colors} onChange={handleChange} required />
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
              <Form.Check type="switch" id="published-switch" name="published" label={text.publishedLabel} checked={formData.published} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate('/admin/products')}>{text.cancelBtn}</Button>
              <Button variant="primary" type="submit" style={{ backgroundColor: 'var(--primary-color)' }} disabled={loadingCreate || loadingUpdate || uploading}>
                {loadingCreate || loadingUpdate ? 'Saving...' : text.saveBtn}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ProductForm;