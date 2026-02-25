import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert, Badge, Image, Table, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { listProductDetails, createProduct, updateProduct } from '../../../store/actions/admin/productActions';
import { listMasterData } from '../../../store/actions/admin/masterDataActions';
import { RootState } from '../../../store/reducers';
import { PRODUCT_CREATE_RESET, PRODUCT_UPDATE_RESET } from '../../../store/constants/admin/productConstants';
import { adjustStock } from '../../../store/actions/admin/inventoryActions';

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const isEditing = Boolean(id);

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { adminInfo } = adminAuth as any;

  // --- MASTER DATA FROM REDUX ---
  const masterDataList = useSelector((state: RootState) => state.masterDataList || {} as any);
  const { 
    brands = [] as any[], 
    styles = [] as any[], 
    colors = [] as any[], 
    sizes = [] as any[], 
    categories = [] as any[], 
    types = [] as any[] 
  } = masterDataList as any;

  const [formData, setFormData] = useState({
    productName: '',
    productCategory: '',
    brand: '',
    style: '',
    productType: '',
    material: '',
    colors: [] as string[],
    sizes: [] as string[],
    variants: [] as any[],
    // REMOVED salesPrice, salesTax, purchasePrice, purchaseTax from here!
    published: false,
    images: [] as { url: string, color: string }[],
  });

  const [uploading, setUploading] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [imgColor, setImgColor] = useState('');
  const [imgView, setImgView] = useState('front');
  const [showStockModal, setShowStockModal] = useState(false);
  const [activeStockIndex, setActiveStockIndex] = useState<number | null>(null);
  const [adjQty, setAdjQty] = useState<number | string>('');
  const [stockReason, setStockReason] = useState('New Purchase Order');
  const [stockNotes, setStockNotes] = useState('');

  const inventoryUpdate = useSelector((state: RootState) => state.inventoryUpdate || {} as any);
  const { loading: updateLoading } = inventoryUpdate;


  const productDetails = useSelector((state: RootState) => state.productDetails);
  const { loading: loadingDetails, error: errorDetails, product } = productDetails;
  const productCreate = useSelector((state: RootState) => state.productCreate);
  const { loading: loadingCreate, error: errorCreate, success: successCreate } = productCreate;
  const productUpdate = useSelector((state: RootState) => state.productUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate;

  // Initial Data Fetch
  useEffect(() => {
    if (!adminInfo || !adminInfo.token) navigate('/admin/login');
    dispatch(listMasterData('brands'));
    dispatch(listMasterData('styles'));
    dispatch(listMasterData('colors'));
    dispatch(listMasterData('sizes'));
    dispatch(listMasterData('categories'));
    dispatch(listMasterData('types'));
  }, [dispatch, adminInfo, navigate]);

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
          productCategory: product.productCategory?._id || product.productCategory || '',
          brand: product.brand?._id || product.brand || '',
          style: product.style?._id || product.style || '',
          productType: product.productType || '',
          material: product.material || '',
          colors: product.colors?.map((c: any) => c._id || c) || [],
          sizes: product.sizes?.map((s: any) => s._id || s) || [],
          variants: product.variants || [],
          published: product.published,
          images: product.images || [],
        });
      }
    }
  }, [dispatch, navigate, id, isEditing, product, successCreate, successUpdate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else setFormData({ ...formData, [name]: value });
  };

  const handleArrayChange = (field: 'colors' | 'sizes', dataId: string) => {
    const currentArray = formData[field];
    if (currentArray.includes(dataId)) {
      setFormData({ ...formData, [field]: currentArray.filter(itemId => itemId !== dataId) });
    } else {
      setFormData({ ...formData, [field]: [...currentArray, dataId] });
    }
  };

  // --- UPGRADED MASTER SKU GENERATOR ---
  const generateVariants = () => {
    // 1. Strict Validation: Ensure ALL master data is selected first!
    if (!formData.brand || !formData.productType || !formData.style || !formData.productCategory) {
      return alert('Please select a Brand, Type, Style, and Category before generating SKUs.');
    }
    if (formData.colors.length === 0 || formData.sizes.length === 0) {
      return alert('Please select at least one Color and Size.');
    }

    // 2. Look up the names from the Master Data arrays using the saved IDs
    const selectedBrand = brands.find((b: any) => b._id === formData.brand)?.name || 'BRN';
    const selectedCategory = categories.find((c: any) => c._id === formData.productCategory)?.name || 'CAT';
    const selectedStyle = styles.find((s: any) => s._id === formData.style)?.name || 'STL';
    const selectedType = formData.productType; // Type is already saved as a name string

    // 3. Create 3-letter Uppercase Prefixes
    const brandPfx = selectedBrand.substring(0, 3).toUpperCase();
    const catPfx = selectedCategory.substring(0, 3).toUpperCase();
    const typePfx = selectedType.substring(0, 3).toUpperCase();
    const stylePfx = selectedStyle.substring(0, 3).toUpperCase();

    const selectedColors = colors.filter((c: any) => formData.colors.includes(c._id));
    const selectedSizes = sizes.filter((s: any) => formData.sizes.includes(s._id));
    const generatedVariants: any[] = [];

    // 4. Matrix Generation
    selectedColors.forEach((colorObj: any) => {
      selectedSizes.forEach((sizeObj: any) => {
        const colorPfx = colorObj.name.substring(0, 3).toUpperCase();
        const sizePfx = sizeObj.code.toUpperCase();
        const sku = `${brandPfx}-${catPfx}-${typePfx}-${stylePfx}-${colorPfx}-${sizePfx}-${Math.floor(100 + Math.random() * 900)}`;

        generatedVariants.push({
          sku,
          color: colorObj.name,
          size: sizeObj.code,
          stock: 0,
          salesPrice: 0,
          salesTax: 0,
          purchasePrice: 0,
          purchaseTax: 0
        });
      });
    });

    setFormData({ ...formData, variants: generatedVariants });
  };

  const handleVariantFieldChange = (index: number, field: string, value: string) => {
    const updatedVariants = [...formData.variants];
    updatedVariants[index][field] = Number(value);
    setFormData({ ...formData, variants: updatedVariants });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(file);
    setImgColor('');
    setImgView('front');
  };

  const confirmUpload = async () => {
    if (!pendingImage || !imgColor) return alert('Select image and color.');
    const finalSpecName = `${imgColor}_${imgView}_${Date.now()}`.toLowerCase();
    const uploadData = new FormData();
    uploadData.append('fileName', finalSpecName);
    uploadData.append('image', pendingImage);

    setUploading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
      const { data } = await axios.post('/api/upload', uploadData, config);
      setFormData({ ...formData, images: [...formData.images, { url: data.imageUrl, color: imgColor.toLowerCase() }] });
      setUploading(false);
      setPendingImage(null);
    } catch (error: any) {
      setUploading(false);
      alert('Upload failed.');
    }
  };

  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productCategory) return alert('Select a Category.');
    if (formData.variants.length === 0) return alert('Generate variants before saving.');
    if (isEditing) dispatch(updateProduct({ _id: id, ...formData }));
    else dispatch(createProduct(formData));
  };

  const handleOpenStockModal = (index: number) => {
    setActiveStockIndex(index);
    setAdjQty('');
    // Default reason changes based on if we are creating vs editing
    setStockReason(id ? 'Inventory Correction' : 'Initial Stock Setup');
    setStockNotes('');
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStockIndex === null) return;

    const variant = formData.variants[activeStockIndex];
    const qty = Number(adjQty);

    if (id) {
      // --- EDIT MODE: Dispatch API call to log real ledger transaction ---
      // Make sure you have dispatch imported: const dispatch = useDispatch<any>();
      await dispatch(adjustStock(variant.sku, qty, stockReason, stockNotes));

      // Optimistically update the UI table so they see the new stock instantly
      const updatedVariants = [...formData.variants];
      updatedVariants[activeStockIndex].stock += qty;
      setFormData({ ...formData, variants: updatedVariants });
      setShowStockModal(false);
    } else {
      // --- CREATE MODE: Save to local state for when they click "Save Product" ---
      const updatedVariants = [...formData.variants];
      updatedVariants[activeStockIndex].stock = qty; // Absolute number for initial setup
      updatedVariants[activeStockIndex].stockReason = stockReason;
      updatedVariants[activeStockIndex].stockNotes = stockNotes;
      setFormData({ ...formData, variants: updatedVariants });
      setShowStockModal(false);
    }
  };

  const activeColorNames = colors.filter((c: any) => formData.colors.includes(c._id)).map((c: any) => c.name);

  return (
    <Container className="py-4">
      <Card className="shadow-sm mx-auto" style={{ maxWidth: '900px', borderTop: '4px solid var(--primary-color)' }}>
        <Card.Body>
          <h3 className="mb-4">{isEditing ? 'Edit Product' : 'Add New Product'}</h3>

          {loadingDetails && <Spinner animation="border" className="d-block mx-auto mb-3" />}
          {errorDetails && <Alert variant="danger">{errorDetails}</Alert>}
          {errorCreate && <Alert variant="danger">{errorCreate}</Alert>}
          {errorUpdate && <Alert variant="danger">{errorUpdate}</Alert>}

          <Form onSubmit={submitHandler}>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control type="text" name="productName" value={formData.productName} onChange={handleChange} required />
            </Form.Group>

            <Row className="mb-3 bg-light p-3 rounded mx-0">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Brand</Form.Label>
                  <Form.Select name="brand" value={formData.brand} onChange={handleChange} required>
                    <option value="">Select Brand...</option>
                    {brands.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Product Type</Form.Label>
                  <Form.Select name="productType" value={formData.productType} onChange={handleChange} required>
                    <option value="">Select Type...</option>
                    {types.map((t: any) => <option key={t._id} value={t.name}>{t.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Style</Form.Label>
                  <Form.Select name="style" value={formData.style} onChange={handleChange} required>
                    <option value="">Select Style...</option>
                    {styles.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="productCategory" value={formData.productCategory} onChange={handleChange} required>
                    <option value="">Select Category...</option>
                    {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Material</Form.Label>
              <Form.Control type="text" name="material" value={formData.material} onChange={handleChange} placeholder="e.g. 100% Cotton" required />
            </Form.Group>

            {/* --- STEP 1: DEFINE VARIANTS --- */}
            <div className="mb-4 p-3 border border-primary rounded" style={{ backgroundColor: '#f0f8ff' }}>
              <h6 className="fw-bold mb-3 text-primary">1. Select Variants & Generate SKUs</h6>
              <Row className="mb-3">
                <Col md={5}>
                  <Form.Label className="small fw-bold">Available Colors</Form.Label>
                  <div className="d-flex flex-wrap gap-2 p-2 border bg-white rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {colors.map((c: any) => (
                      <Form.Check
                        key={c._id} type="checkbox" id={`color-${c._id}`} label={c.name}
                        checked={formData.colors.includes(c._id)}
                        onChange={() => handleArrayChange('colors', c._id)}
                      />
                    ))}
                  </div>
                </Col>
                <Col md={5}>
                  <Form.Label className="small fw-bold">Available Sizes</Form.Label>
                  <div className="d-flex flex-wrap gap-3 p-2 border bg-white rounded" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {sizes.map((s: any) => (
                      <Form.Check
                        key={s._id} type="checkbox" id={`size-${s._id}`} label={s.code}
                        checked={formData.sizes.includes(s._id)}
                        onChange={() => handleArrayChange('sizes', s._id)}
                      />
                    ))}
                  </div>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <Button variant="primary" className="w-100" onClick={generateVariants}>Generate</Button>
                </Col>
              </Row>

              {formData.variants.length > 0 && (
                <div className="mt-3 bg-white border rounded">
                  <Table size="sm" bordered hover responsive className="mb-0 text-center align-middle" style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                    <thead className="table-dark">
                      <tr>
                        <th>SKU</th>
                        <th>Color</th>
                        <th>Size</th>
                        <th style={{ minWidth: '100px' }}>Sales Price</th>
                        <th style={{ minWidth: '80px' }}>Sales Tax(%)</th>
                        <th className="bg-primary text-white">Final MRP</th>
                        <th style={{ minWidth: '100px' }}>Purch. Price</th>
                        <th style={{ minWidth: '80px' }}>Purch. Tax(%)</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.variants.map((v, i) => {
                        // Safe Math Calculation to prevent NaN
                        const sPrice = Number(v.salesPrice) || 0;
                        const sTax = Number(v.salesTax) || 0;
                        const finalMrp = sPrice + (sPrice * (sTax / 100));

                        return (
                          <tr key={i}>
                            <td className="font-monospace fw-bold">{v.sku}</td>
                            <td className="text-capitalize">{v.color}</td>
                            <td className="text-uppercase">{v.size}</td>

                            <td>
                              <Form.Control type="number" size="sm" value={v.salesPrice} onChange={(e) => handleVariantFieldChange(i, 'salesPrice', e.target.value)} min="0" />
                            </td>
                            <td>
                              <Form.Control type="number" size="sm" value={v.salesTax} onChange={(e) => handleVariantFieldChange(i, 'salesTax', e.target.value)} min="0" />
                            </td>

                            <td className="fw-bold text-success fs-6">
                              ₹{finalMrp.toFixed(2)}
                            </td>

                            <td>
                              <Form.Control type="number" size="sm" value={v.purchasePrice} onChange={(e) => handleVariantFieldChange(i, 'purchasePrice', e.target.value)} min="0" />
                            </td>
                            <td>
                              <Form.Control type="number" size="sm" value={v.purchaseTax} onChange={(e) => handleVariantFieldChange(i, 'purchaseTax', e.target.value)} min="0" />
                            </td>

                            <td className="align-middle">
                              <div className="d-flex flex-column align-items-center">
                                <Badge bg={v.stock > 0 ? 'success' : 'secondary'} className="mb-1 fs-6">
                                  {v.stock}
                                </Badge>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-decoration-none"
                                  onClick={() => handleOpenStockModal(i)}
                                >
                                  {id ? 'Adjust Stock' : 'Set Initial Stock'}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                </div>
              )}
            </div>

            {/* --- STEP 2: IMAGE UPLOAD --- */}
            <Form.Group className="mb-4 p-3 border rounded bg-light">
              <Form.Label className="fw-bold">2. Upload Color-Mapped Images</Form.Label>
              {activeColorNames.length === 0 ? (
                <Alert variant="warning" className="py-2 mb-0">Select Colors in Step 1 to upload images.</Alert>
              ) : (
                <>
                  <Row className="align-items-end mb-3">
                    <Col md={4}><Form.Control type="file" onChange={handleFileSelect} disabled={uploading} accept="image/*" /></Col>
                    {pendingImage && (
                      <>
                        <Col md={3}>
                          <Form.Select value={imgColor} onChange={(e) => setImgColor(e.target.value)}>
                            <option value="">Select Color...</option>
                            {activeColorNames.map((c: string) => <option key={c} value={c}>{c}</option>)}
                          </Form.Select>
                        </Col>
                        <Col md={3}>
                          <Form.Select value={imgView} onChange={(e) => setImgView(e.target.value)}>
                            <option value="front">Front View</option>
                            <option value="back">Back View</option>
                            <option value="side">Side</option>
                          </Form.Select>
                        </Col>
                        <Col md={2}>
                          <Button variant="success" className="w-100" onClick={confirmUpload} disabled={uploading || !imgColor}>
                            {uploading ? <Spinner size="sm" animation="border" /> : 'Upload'}
                          </Button>
                        </Col>
                      </>
                    )}
                  </Row>

                  {activeColorNames.map((color: string) => {
                    const colorImages = formData.images.filter(img => img.color.toLowerCase() === color.toLowerCase());
                    if (colorImages.length === 0) return null;
                    return (
                      <div key={color} className="mt-3">
                        <h6 className="text-uppercase text-muted border-bottom pb-1 mb-2">{color} Images</h6>
                        <div className="d-flex flex-wrap gap-3">
                          {colorImages.map((imgObj, index) => (
                            <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                              <Image src={imgObj.url} thumbnail style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <Button variant="danger" size="sm" className="position-absolute top-0 end-0 p-0 shadow" style={{ width: '22px', height: '22px', lineHeight: '10px', marginTop: '-5px', marginRight: '-5px' }} onClick={() => setFormData({ ...formData, images: formData.images.filter(i => i.url !== imgObj.url) })}>&times;</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Check type="switch" id="published-switch" name="published" label="Publish Product" checked={formData.published} onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => navigate('/admin/products')}>Cancel</Button>
              <Button variant="primary" type="submit" disabled={loadingCreate || loadingUpdate || uploading}>{loadingCreate || loadingUpdate ? 'Saving...' : 'Save Product'}</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      {/* --- UNIFIED STOCK ADJUSTMENT MODAL --- */ }
    <Modal show={showStockModal} onHide={() => setShowStockModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{id ? 'Adjust Inventory' : 'Set Initial Opening Balance'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleStockSubmit}>
        <Modal.Body>
          {activeStockIndex !== null && (
            <div className="mb-4 p-3 bg-light rounded border">
              <h6 className="fw-bold">{formData.productName || 'New Product'}</h6>
              <div className="text-muted font-monospace mb-2">{formData.variants[activeStockIndex].sku}</div>
              <Badge bg="dark" className="me-2 text-uppercase">{formData.variants[activeStockIndex].size}</Badge>
              <Badge bg="secondary" className="text-capitalize">{formData.variants[activeStockIndex].color}</Badge>
              {id && (
                <div className="mt-2">Current Stock: <strong>{formData.variants[activeStockIndex].stock}</strong></div>
              )}
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label>
              {id ? 'Units to Add/Remove (Use negative for removal)' : 'Total Initial Units (Opening Balance)'}
            </Form.Label>
            <Form.Control
              type="number"
              required
              placeholder={id ? "e.g., 50 or -5" : "e.g., 100"}
              value={adjQty}
              onChange={(e) => setAdjQty(e.target.value)}
              min={id ? undefined : "0"} // Only allow negative in edit mode
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason</Form.Label>
            <Form.Select required value={stockReason} onChange={(e) => setStockReason(e.target.value)}>
              {!id && <option value="Initial Stock Setup">Initial Stock Setup</option>}
              <option value="New Purchase Order">New Purchase Order (Stock In)</option>
              <option value="Customer Return">Customer Return (Stock In)</option>
              <option value="Damaged/Defective">Damaged / Defective (Stock Out)</option>
              <option value="Lost in Transit">Lost in Transit (Stock Out)</option>
              <option value="Inventory Correction">Inventory Correction</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Additional Notes (Optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="e.g., PO# 12345"
              value={stockNotes}
              onChange={(e) => setStockNotes(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" className="w-100" type="submit" disabled={updateLoading}>
            {updateLoading ? <Spinner size="sm" animation="border" /> : 'Confirm Stock'}
          </Button>
        </Modal.Body>
      </Form>
    </Modal>
    </Container>

  );
};

export default ProductForm;