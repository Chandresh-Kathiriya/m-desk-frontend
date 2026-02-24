import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert, Badge, Image, ListGroup, InputGroup, Table } from 'react-bootstrap';
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
  const { adminInfo } = adminAuth as any;

  // --- STRICTLY EMPTY DEFAULTS ---
  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '', 
    productType: '', // Blank default
    material: '',    // Blank default
    colors: '', 
    sizes: '',       // e.g., "S, M, L"
    variants: [] as any[], // The SKU matrix
    salesPrice: 0,
    salesTax: 0,
    purchasePrice: 0,
    purchaseTax: 0,
    published: false,
    images: [] as string[],
    currentStock: 0, // Read-only total
  });

  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
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

  // useEffect(() => {
  //   if (!adminInfo || !adminInfo.token) navigate('/admin/login');
  // }, [adminInfo, navigate]);

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
          productType: product.productType || '',
          material: product.material || '',
          colors: product.colors?.join(', ') || '', 
          sizes: product.sizes?.join(', ') || '', 
          variants: product.variants || [],
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

  // --- VARIANT / SKU GENERATOR ---
  const generateVariants = () => {
    if (!formData.productType) return alert('Please select a Product Type first to generate SKUs.');
    if (!formData.colors || !formData.sizes) return alert('Please enter at least one Color and one Size.');

    const colorArray = formData.colors.split(',').map(c => c.trim()).filter(c => c);
    const sizeArray = formData.sizes.split(',').map(s => s.trim()).filter(s => s);
    const generatedVariants: any[] = [];

    colorArray.forEach(color => {
      sizeArray.forEach(size => {
        const typePrefix = formData.productType.toUpperCase().substring(0, 3);
        const colorPrefix = color.toUpperCase().substring(0, 3);
        const sku = `${typePrefix}-${colorPrefix}-${size.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

        generatedVariants.push({
          sku,
          color,
          size,
          stock: 0, // Admin does not edit this manually!
        });
      });
    });

    setFormData({ ...formData, variants: generatedVariants });
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('File is too large! Please upload an image smaller than 10MB.');
      e.target.value = ''; 
      return;
    }
    setPendingImage(file);
    setImgSpecs([{ name: 'color', value: '' }, { name: 'view', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'name' | 'value', val: string) => {
    const updated = [...imgSpecs];
    updated[index][field] = val;
    setImgSpecs(updated);
  };

  const confirmUpload = async () => {
    if (!pendingImage) return;
    if (!adminInfo || !adminInfo.token) {
      alert('Authentication error. Please log in again.');
      return navigate('/admin/login');
    }

    const validSpecs = imgSpecs.filter(s => s.name.trim() && s.value.trim());
    const specString = validSpecs.map(s => `${s.name.trim().toLowerCase()}-${s.value.trim().toLowerCase()}`).join('_');
    const originalNameWithoutExt = pendingImage.name.substring(0, pendingImage.name.lastIndexOf('.')) || pendingImage.name;
    const finalSpecName = specString ? `${specString}_${originalNameWithoutExt}` : originalNameWithoutExt;

    const uploadData = new FormData();
    uploadData.append('fileName', finalSpecName);
    uploadData.append('image', pendingImage);
    
    setUploading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
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
    if (formData.variants.length === 0) return alert('Please generate at least one variant before saving.');
    
    const formattedData = {
      ...formData,
      colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
      sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
    };

    if (isEditing) dispatch(updateProduct({ _id: id, ...formattedData }));
    else dispatch(createProduct(formattedData));
  };

  return (
    <Container className="py-4">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: '900px', borderTop: '4px solid var(--primary-color)' }}>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">{isEditing ? text.formTitleEdit : text.formTitleAdd}</h3>
            {isEditing && (
              <h5>
                <Badge bg={formData.currentStock > 0 ? 'success' : 'danger'}>
                  Total Stock: {formData.currentStock}
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

            {/* --- MASTER DATA: CATEGORY, TYPE, MATERIAL --- */}
            <Row className="mb-3 bg-light p-3 rounded mx-0">
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
                  {/* DEFAULT REMOVED - FORCED SELECTION */}
                  <Form.Select name="productType" value={formData.productType} onChange={handleChange} required>
                    <option value="">Select Type...</option>
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
                  {/* DEFAULT REMOVED - FORCED SELECTION */}
                  <Form.Select name="material" value={formData.material} onChange={handleChange} required>
                    <option value="">Select Material...</option>
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

            {/* --- IMAGES --- */}
            <Form.Group className="mb-4 p-3 border rounded">
              <Form.Label className="fw-bold">Product Images</Form.Label>
              <Form.Control type="file" onChange={handleFileSelect} disabled={uploading} accept="image/*" />
              
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
                        {uploading ? <Spinner size="sm" animation="border" /> : `Upload File`}
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

            {/* --- VARIANT GENERATION (COLORS & SIZES) --- */}
            <div className="mb-4 p-3 bg-light border rounded">
              <h6 className="fw-bold mb-3">Inventory Variants (SKUs)</h6>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Colors (Comma separated)</Form.Label>
                    <Form.Control type="text" name="colors" placeholder="e.g., Red, Blue" value={formData.colors} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Sizes (Comma separated)</Form.Label>
                    <Form.Control type="text" name="sizes" placeholder="e.g., S, M, L" value={formData.sizes} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="dark" className="w-100" onClick={generateVariants}>
                    Generate
                  </Button>
                </Col>
              </Row>

              {/* Display Generated SKUs */}
              {formData.variants.length > 0 && (
                <Table size="sm" bordered hover className="mt-3 bg-white">
                  <thead className="table-dark">
                    <tr>
                      <th>SKU</th>
                      <th>Color</th>
                      <th>Size</th>
                      <th>Stock (Read-Only)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.variants.map((v, i) => (
                      <tr key={i}>
                        <td className="font-monospace">{v.sku}</td>
                        <td>{v.color}</td>
                        <td>{v.size}</td>
                        <td>
                          <Badge bg={v.stock > 0 ? 'success' : 'secondary'}>{v.stock}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </div>

            {/* --- PRICING --- */}
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