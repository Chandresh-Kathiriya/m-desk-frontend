import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { listProductDetails, createProduct, updateProduct } from '../../../store/actions/admin/productActions';
import { listMasterData } from '../../../store/actions/admin/masterDataActions';
import { adjustStock } from '../../../store/actions/admin/inventoryActions';
import { PRODUCT_CREATE_RESET, PRODUCT_UPDATE_RESET } from '../../../store/constants/admin/productConstants';
import { RootState } from '../../../store/reducers';
import { uploadBatchImages } from '../../../store/actions/admin/uploadActions';
import { UPLOAD_IMAGE_RESET } from '../../../store/constants/admin/uploadConstants';

import styles from '../../../schemas/css/ProductForm.module.css';

interface PendingImage { id: string; file: File; preview: string; color: string; view: string; }
interface ProductImage { url: string; color: string; view: string; }

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<any>();
  const isEditing = Boolean(id);

  const adminAuth = useSelector((state: RootState) => state.adminAuth);
  const { adminInfo } = adminAuth as any;

  const masterDataList = useSelector((state: RootState) => state.masterDataList || {} as any);
  const { brands = [], styles: styleList = [], colors = [], sizes = [], categories = [], types = [] } = masterDataList as any;

  const [formData, setFormData] = useState({
    productName: '', productCategory: '', brand: '', style: '',
    productType: '', material: '', colors: [] as string[], sizes: [] as string[],
    variants: [] as any[], published: false, images: [] as ProductImage[],
  });

  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);

  const [showStockModal, setShowStockModal] = useState(false);
  const [activeStockIndex, setActiveStockIndex] = useState<number | null>(null);
  const [adjQty, setAdjQty] = useState<number | string>('');
  const [stockReason, setStockReason] = useState('New Purchase Order');
  const [stockNotes, setStockNotes] = useState('');

  const inventoryUpdate = useSelector((state: RootState) => state.inventoryUpdate || {} as any);
  const { loading: updateLoading, error: updateError } = inventoryUpdate;

  const productDetails = useSelector((state: RootState) => state.productDetails);
  const { loading: loadingDetails, error: errorDetails, product } = productDetails;

  const productCreate = useSelector((state: RootState) => state.productCreate);
  const { loading: loadingCreate, error: errorCreate, success: successCreate } = productCreate;

  const productUpdate = useSelector((state: RootState) => state.productUpdate);
  const { loading: loadingUpdate, error: errorUpdate, success: successUpdate } = productUpdate;

  const imageUpload = useSelector((state: RootState) => state.imageUpload || {} as any);
  const { loading: uploading, success: uploadSuccess, uploadedImages, error: uploadError } = imageUpload;

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
    if (uploadSuccess && uploadedImages && uploadedImages.length > 0) {
      setFormData(prev => ({ ...prev, images: [...prev.images, ...uploadedImages] }));
      setPendingImages([]); 
      setIsUploadingBatch(false);
      dispatch({ type: UPLOAD_IMAGE_RESET }); 
    }
    if (uploadError) {
      alert(`Upload failed: ${uploadError}`);
      setIsUploadingBatch(false);
      dispatch({ type: UPLOAD_IMAGE_RESET });
    }
  }, [uploadSuccess, uploadError, uploadedImages, dispatch]);

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

  const generateVariants = () => {
    if (!formData.brand || !formData.productType || !formData.style || !formData.productCategory) {
      return alert('Please select a Brand, Type, Style, and Category before generating SKUs.');
    }
    if (formData.colors.length === 0 || formData.sizes.length === 0) {
      return alert('Please select at least one Color and Size.');
    }

    const selectedBrand = brands.find((b: any) => b._id === formData.brand)?.name || 'BRN';
    const selectedCategory = categories.find((c: any) => c._id === formData.productCategory)?.name || 'CAT';
    const selectedStyle = styleList.find((s: any) => s._id === formData.style)?.name || 'STL';
    const selectedType = formData.productType;

    const brandPfx = selectedBrand.substring(0, 3).toUpperCase();
    const catPfx = selectedCategory.substring(0, 3).toUpperCase();
    const typePfx = selectedType.substring(0, 3).toUpperCase();
    const stylePfx = selectedStyle.substring(0, 3).toUpperCase();

    const selectedColors = colors.filter((c: any) => formData.colors.includes(c._id));
    const selectedSizes = sizes.filter((s: any) => formData.sizes.includes(s._id));
    const generatedVariants: any[] = [];

    selectedColors.forEach((colorObj: any) => {
      selectedSizes.forEach((sizeObj: any) => {
        const colorPfx = colorObj.name.substring(0, 3).toUpperCase();
        const sizePfx = sizeObj.code.toUpperCase();
        const sku = `${brandPfx}-${catPfx}-${typePfx}-${stylePfx}-${colorPfx}-${sizePfx}-${Math.floor(100 + Math.random() * 900)}`;

        generatedVariants.push({
          sku, color: colorObj.name, size: sizeObj.code, stock: 0,
          salesPrice: 0, salesTax: 0, purchasePrice: 0, purchaseTax: 0
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, colorTarget: string) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    const newPending: PendingImage[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      file, preview: URL.createObjectURL(file), 
      color: colorTarget.toLowerCase(), view: '' 
    }));
    
    setPendingImages(prev => [...prev, ...newPending]);
    e.target.value = ''; 
  };

  const updatePendingImage = (id: string, field: 'view', value: string) => {
    setPendingImages(prev => prev.map(img => img.id === id ? { ...img, [field]: value } : img));
  };

  const confirmBatchUpload = () => {
    setIsUploadingBatch(true);
    dispatch(uploadBatchImages(pendingImages)); 
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
      await dispatch(adjustStock(variant.sku, qty, stockReason, stockNotes));
      const updatedVariants = [...formData.variants];
      updatedVariants[activeStockIndex].stock += qty;
      setFormData({ ...formData, variants: updatedVariants });
      setShowStockModal(false);
    } else {
      const updatedVariants = [...formData.variants];
      updatedVariants[activeStockIndex].stock = qty;
      updatedVariants[activeStockIndex].stockReason = stockReason;
      updatedVariants[activeStockIndex].stockNotes = stockNotes;
      setFormData({ ...formData, variants: updatedVariants });
      setShowStockModal(false);
    }
  };

  const activeColorNames = colors.filter((c: any) => formData.colors.includes(c._id)).map((c: any) => c.name);

  return (
    <main className={styles['page-wrapper']}>
      <div className={styles.container}>
        <div className={styles.card}>
          
          <h1 className={styles['page-title']}>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>

          {loadingDetails && <div className={styles['spinner-container']}><div className={styles.spinner}></div></div>}
          {errorDetails && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorDetails}</div>}
          {errorCreate && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorCreate}</div>}
          {errorUpdate && <div className={`${styles.alert} ${styles['alert--error']}`}>{errorUpdate}</div>}

          <form onSubmit={submitHandler}>
            <div className={styles['form-group']}>
              <label className={styles.label}>Product Name</label>
              <input type="text" className={styles.input} name="productName" value={formData.productName} onChange={handleChange} required />
            </div>

            <div className={styles['form-grid-4']}>
              <div>
                <label className={styles.label}>Brand</label>
                <select className={styles.select} name="brand" value={formData.brand} onChange={handleChange} required>
                  <option value="">Select Brand...</option>
                  {brands.map((b: any) => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Product Type</label>
                <select className={styles.select} name="productType" value={formData.productType} onChange={handleChange} required>
                  <option value="">Select Type...</option>
                  {types.map((t: any) => <option key={t._id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Style</label>
                <select className={styles.select} name="style" value={formData.style} onChange={handleChange} required>
                  <option value="">Select Style...</option>
                  {styleList.map((s: any) => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.label}>Category</label>
                <select className={styles.select} name="productCategory" value={formData.productCategory} onChange={handleChange} required>
                  <option value="">Select Category...</option>
                  {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className={styles['form-group']}>
              <label className={styles.label}>Material</label>
              <input type="text" className={styles.input} name="material" value={formData.material} onChange={handleChange} placeholder="e.g. 100% Cotton" required />
            </div>

            {/* --- STEP 1: VARIANTS --- */}
            <div className={styles['section-box']}>
              <h2 className={styles['section-title']}>1. Select Variants & Generate SKUs</h2>
              
              <div className={styles['form-grid-2']}>
                <div>
                  <label className={styles.label}>Available Colors</label>
                  <div className={styles['checkbox-box']}>
                    {colors.map((c: any) => (
                      <label key={c._id} className={styles['checkbox-label']}>
                        <input type="checkbox" checked={formData.colors.includes(c._id)} onChange={() => handleArrayChange('colors', c._id)} />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={styles.label}>Available Sizes</label>
                  <div className={styles['checkbox-box']}>
                    {sizes.map((s: any) => (
                      <label key={s._id} className={styles['checkbox-label']}>
                        <input type="checkbox" checked={formData.sizes.includes(s._id)} onChange={() => handleArrayChange('sizes', s._id)} />
                        <span>{s.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <button type="button" className={`${styles.btn} ${styles['btn-primary']}`} onClick={generateVariants} style={{ width: '100%' }}>
                    Generate SKUs
                  </button>
                </div>
              </div>

              {formData.variants.length > 0 && (
                <div className={styles['table-responsive']}>
                  <table className={styles['variant-table']}>
                    <thead>
                      <tr>
                        <th>SKU</th><th>Color</th><th>Size</th>
                        <th>Sales Price</th><th>Sales Tax(%)</th>
                        <th className={styles.highlight}>Final MRP</th>
                        <th>Purch. Price</th><th>Purch. Tax(%)</th>
                        <th>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.variants.map((v, i) => {
                        const sPrice = Number(v.salesPrice) || 0;
                        const sTax = Number(v.salesTax) || 0;
                        const finalMrp = sPrice + (sPrice * (sTax / 100));

                        return (
                          <tr key={i}>
                            <td className={styles['text-sku']}>{v.sku}</td>
                            <td style={{ textTransform: 'capitalize' }}>{v.color}</td>
                            <td style={{ textTransform: 'uppercase' }}>{v.size}</td>
                            <td><input type="number" className={`${styles.input} ${styles['input-sm']}`} value={v.salesPrice} onChange={(e) => handleVariantFieldChange(i, 'salesPrice', e.target.value)} min="0" /></td>
                            <td><input type="number" className={`${styles.input} ${styles['input-sm']}`} value={v.salesTax} onChange={(e) => handleVariantFieldChange(i, 'salesTax', e.target.value)} min="0" /></td>
                            <td className={styles['text-mrp']}>₹{finalMrp.toFixed(2)}</td>
                            <td><input type="number" className={`${styles.input} ${styles['input-sm']}`} value={v.purchasePrice} onChange={(e) => handleVariantFieldChange(i, 'purchasePrice', e.target.value)} min="0" /></td>
                            <td><input type="number" className={`${styles.input} ${styles['input-sm']}`} value={v.purchaseTax} onChange={(e) => handleVariantFieldChange(i, 'purchaseTax', e.target.value)} min="0" /></td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <span className={`${styles.badge} ${v.stock > 0 ? styles['badge--success'] : styles['badge--secondary']}`}>{v.stock}</span>
                                <button type="button" className={styles['btn-link']} onClick={() => handleOpenStockModal(i)}>
                                  {id ? 'Adjust' : 'Set Initial'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* --- STEP 2: IMAGES --- */}
            <div className={`${styles['section-box']} ${styles['section-box--white']}`}>
              <h2 className={styles['section-title']}>2. Upload Images by Color</h2>
              
              {activeColorNames.length === 0 ? (
                <div className={`${styles.alert} ${styles['alert--warning']}`}>
                  Select Colors in Step 1 to unlock image uploads.
                </div>
              ) : (
                <>
                  {activeColorNames.map((color: string) => {
                    const colorPending = pendingImages.filter(img => img.color === color.toLowerCase());
                    const colorUploaded = formData.images.filter(img => img.color.toLowerCase() === color.toLowerCase());

                    return (
                      <div key={color} style={{ marginBottom: 'var(--space-6)' }}>
                        <div className={styles['color-header']}>
                          <h6 className={styles['color-title']}>
                            <div className={styles['color-dot']} style={{ backgroundColor: color.toLowerCase() }}></div>
                            {color} Images
                          </h6>
                          <span className={`${styles.badge} ${styles['badge--success']}`}>{colorUploaded.length} Uploaded</span>
                        </div>

                        <input type="file" className={styles['file-input']} onChange={(e) => handleFileSelect(e, color)} disabled={isUploadingBatch || uploading} accept="image/*" multiple />

                        {colorPending.length > 0 && (
                          <div className={styles['staging-area']}>
                            <span className={styles.label}>Pending Uploads ({colorPending.length})</span>
                            <div className={styles['staging-grid']}>
                              {colorPending.map(img => (
                                <div key={img.id} className={styles['image-card']}>
                                  <img src={img.preview} alt="preview" className={styles['image-preview']} />
                                  <div className={styles['image-actions']}>
                                    <select className={`${styles.select} ${styles['input-sm']}`} value={img.view} onChange={(e) => updatePendingImage(img.id, 'view', e.target.value)}>
                                      <option value="">View (Opt)</option>
                                      <option value="front">Front</option>
                                      <option value="back">Back</option>
                                      <option value="leftside">Left Side</option>
                                      <option value="rightside">Right Side</option>
                                      <option value="fullimage">Full Image</option>
                                      <option value="closure">Closure</option>
                                    </select>
                                    <button type="button" className={`${styles.btn} ${styles['btn-sm']} ${styles['btn-outline-danger']}`} onClick={() => setPendingImages(prev => prev.filter(p => p.id !== img.id))}>
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {colorUploaded.length > 0 && (
                          <div className={styles['uploaded-grid']}>
                            {colorUploaded.map((imgObj, index) => (
                              <div key={index} className={styles['uploaded-item']}>
                                <img src={imgObj.url} alt="uploaded" className={styles['uploaded-img']} />
                                {imgObj.view && <span className={styles['uploaded-badge']}>{imgObj.view}</span>}
                                <button type="button" className={styles['btn-remove-abs']} onClick={() => setFormData({ ...formData, images: formData.images.filter(i => i.url !== imgObj.url) })}>
                                  &times;
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {pendingImages.length > 0 && (
                    <div style={{ textAlign: 'right', marginTop: 'var(--space-4)' }}>
                      <button type="button" className={`${styles.btn} ${styles['btn-success']} ${styles['btn-lg']}`} onClick={confirmBatchUpload} disabled={isUploadingBatch || uploading}>
                        {(isUploadingBatch || uploading) ? 'Uploading...' : `Upload All ${pendingImages.length} Pending Images`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className={styles['form-group']}>
              <label className={styles['switch-wrapper']}>
                <input type="checkbox" name="published" className={styles['switch-input']} checked={formData.published} onChange={handleChange} />
                <div className={styles.switch}></div>
                <span className={styles['switch-text']}>Publish Product (Visible to Customers)</span>
              </label>
            </div>

            <div className={styles['action-row']}>
              <button type="button" className={`${styles.btn} ${styles['btn-secondary']}`} onClick={() => navigate('/admin/products')}>Cancel</button>
              <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} disabled={loadingCreate || loadingUpdate || isUploadingBatch || uploading}>
                {loadingCreate || loadingUpdate ? 'Saving...' : 'Save Product Data'}
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* --- STOCK MODAL --- */}
      {showStockModal && (
        <div className={styles['modal-backdrop']} onClick={() => !updateLoading && setShowStockModal(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h2 className={styles['modal-title']}>{id ? 'Adjust Inventory' : 'Set Initial Opening Balance'}</h2>
              <button className={styles['btn-close']} onClick={() => setShowStockModal(false)} disabled={updateLoading}>&times;</button>
            </div>
            <div className={styles['modal-body']}>
              <form onSubmit={handleStockSubmit}>
                {updateError && <div className={`${styles.alert} ${styles['alert--error']}`}>{updateError}</div>}
                
                {activeStockIndex !== null && (
                  <div className={styles['selected-item-box']}>
                    <div className={styles['selected-item-title']}>{formData.productName || 'New Product'}</div>
                    <div className={styles['selected-item-sku']}>{formData.variants[activeStockIndex].sku}</div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <span className={`${styles.badge} ${styles['badge--dark']}`}>{formData.variants[activeStockIndex].size}</span>
                      <span className={`${styles.badge} ${styles['badge--secondary']}`}>{formData.variants[activeStockIndex].color}</span>
                    </div>
                    {id && <div>Current Stock: <strong>{formData.variants[activeStockIndex].stock}</strong></div>}
                  </div>
                )}

                <div className={styles['form-group']}>
                  <label className={styles.label}>{id ? 'Units to Add/Remove (Use negative for removal)' : 'Total Initial Units (Opening Balance)'}</label>
                  <input type="number" className={styles.input} required placeholder={id ? "e.g., 50 or -5" : "e.g., 100"} value={adjQty} onChange={(e) => setAdjQty(e.target.value)} min={id ? undefined : "0"} />
                </div>

                <div className={styles['form-group']}>
                  <label className={styles.label}>Reason</label>
                  <select className={styles.select} required value={stockReason} onChange={(e) => setStockReason(e.target.value)}>
                    {!id && <option value="Initial Stock Setup">Initial Stock Setup</option>}
                    <option value="New Purchase Order">New Purchase Order (Stock In)</option>
                    <option value="Customer Return">Customer Return (Stock In)</option>
                    <option value="Damaged/Defective">Damaged / Defective (Stock Out)</option>
                    <option value="Lost in Transit">Lost in Transit (Stock Out)</option>
                    <option value="Inventory Correction">Inventory Correction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles['form-group']}>
                  <label className={styles.label}>Additional Notes (Optional)</label>
                  <textarea className={styles.textarea} placeholder="e.g., PO# 12345" value={stockNotes} onChange={(e) => setStockNotes(e.target.value)} />
                </div>

                <button type="submit" className={`${styles.btn} ${styles['btn-primary']}`} style={{ width: '100%' }} disabled={updateLoading}>
                  {updateLoading ? 'Confirming...' : 'Confirm Stock'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductForm;