import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { getStorefrontProductDetails } from '../../../store/actions/storefront/productActions';
import { RootState } from '../../../store/reducers';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();

  // Redux State
  const productDetails = useSelector((state: RootState) => state.storefrontProductDetails || {});
  const { loading, error, product } = productDetails as any;

  // Local UI State
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');

  useEffect(() => {
    if (id) {
      dispatch(getStorefrontProductDetails(id));
    }
  }, [dispatch, id]);

  // Auto-select the first available variant when the product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Find the first variant that actually has stock
      const firstAvailable = product.variants.find((v: any) => v.stock > 0) || product.variants[0];
      
      setSelectedColor(firstAvailable.color);
      setSelectedSize(firstAvailable.size);
      
      if (product.images && product.images.length > 0) {
        setMainImage(product.images[0].url);
      }
    }
  }, [product]);

  const filteredImages = product?.images?.filter(
    (img: any) => img.color && img.color.toLowerCase() === selectedColor.toLowerCase()
  ) || [];

  // 2. Fallback: If no images are explicitly mapped to this color, show all images to prevent a broken UI
  const displayImages = filteredImages.length > 0 ? filteredImages : (product?.images || []);

  // 3. Automatically change the main large image when the user clicks a new color
  useEffect(() => {
    if (displayImages.length > 0) {
      // Check if the currently displayed main image belongs to the new color
      const isMainImageValid = displayImages.some((img: any) => img.url === mainImage);
      
      // If the image doesn't match the new color (or is empty), swap it to the first image of the new color!
      if (!isMainImageValid) {
        setMainImage(displayImages[0].url);
      }
    }
  }, [selectedColor, product]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!product || !product._id) return null;

  // --- SMART UI HELPERS ---
  
  // 1. Get unique colors and sizes from the variants array
  const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color))) as string[];
  const uniqueSizes = Array.from(new Set(product.variants.map((v: any) => v.size))) as string[];

  // 2. Find the EXACT currently selected variant (SKU)
  const currentVariant = product.variants.find(
    (v: any) => v.color === selectedColor && v.size === selectedSize
  );

  // 3. Calculate Final MRP for the selected variant
  const getVariantPrice = (variant: any) => {
    if (!variant) return 0;
    const price = Number(variant.salesPrice) || 0;
    const tax = Number(variant.salesTax) || 0;
    return (price + (price * (tax / 100))).toFixed(2);
  };

  // 4. Check if a specific size is in stock for the currently selected color
  const isSizeAvailableForColor = (size: string) => {
    const variant = product.variants.find((v: any) => v.color === selectedColor && v.size === size);
    return variant ? variant.stock > 0 : false;
  };

  return (
    <Container className="py-5">
      <Link to="/" className="text-decoration-none text-muted mb-4 d-inline-block">
        &larr; Back to Shop
      </Link>

      <Row className="g-5">
        {/* LEFT COLUMN: Image Gallery */}
        <Col md={6}>
          <div className="bg-white border rounded p-3 mb-3 text-center" style={{ height: '500px' }}>
            <img 
              src={mainImage || 'https://via.placeholder.com/500?text=No+Image'} 
              alt={product.productName} 
              style={{ objectFit: 'contain', width: '100%', height: '100%' }}
            />
          </div>
          
          {/* REPLACE THIS THUMBNAIL SECTION */}
          {displayImages && displayImages.length > 1 && (
            <div className="d-flex gap-2 overflow-auto mt-2">
              {displayImages.map((img: any, idx: number) => (
                <div 
                  key={idx} 
                  className={`border rounded p-1 ${mainImage === img.url ? 'border-primary border-2 shadow-sm' : ''}`}
                  style={{ width: '80px', height: '80px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => setMainImage(img.url)}
                >
                  <img src={img.url} alt={`${selectedColor} view`} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
              ))}
            </div>
          )}
        </Col>

        {/* RIGHT COLUMN: Product Info & Selectors */}
        <Col md={6}>
          <div className="text-uppercase text-muted mb-2" style={{ letterSpacing: '1px', fontSize: '0.85rem' }}>
            {product.brand?.name || 'Exclusive Brand'}
          </div>
          <h1 className="fw-bold mb-3">{product.productName}</h1>
          
          {/* Dynamic Price Display */}
          <h2 className="text-primary fw-bold mb-4">
            ₹{currentVariant ? getVariantPrice(currentVariant) : '---'}
          </h2>

          <div className="mb-4">
            <span className="text-muted me-3">Category: <span className="text-dark">{product.productCategory?.name}</span></span>
            <span className="text-muted">Material: <span className="text-dark">{product.material}</span></span>
          </div>

          <hr />

          {/* Color Selector */}
          <div className="mb-4 mt-4">
            <h6 className="fw-bold text-uppercase mb-3">Color: <span className="text-primary text-capitalize">{selectedColor}</span></h6>
            <div className="d-flex gap-2">
              {uniqueColors.map((color) => (
                <Button 
                  key={color} 
                  variant={selectedColor === color ? 'dark' : 'outline-dark'}
                  className="text-capitalize"
                  onClick={() => setSelectedColor(color)}
                >
                  {color}
                </Button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase mb-3">Size: <span className="text-primary text-uppercase">{selectedSize}</span></h6>
            <div className="d-flex gap-2 flex-wrap">
              {uniqueSizes.map((size) => {
                const isAvailable = isSizeAvailableForColor(size);
                return (
                  <Button 
                    key={size}
                    variant={selectedSize === size ? 'primary' : 'outline-secondary'}
                    disabled={!isAvailable}
                    className="text-uppercase"
                    style={{ minWidth: '60px' }}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-4">
            {currentVariant && currentVariant.stock > 0 ? (
              <Badge bg="success" className="p-2 fs-6">In Stock ({currentVariant.stock} available)</Badge>
            ) : (
              <Badge bg="danger" className="p-2 fs-6">Out of Stock</Badge>
            )}
            {currentVariant && <div className="text-muted small mt-2">SKU: {currentVariant.sku}</div>}
          </div>

          {/* Add to Cart Button */}
          <Button 
            variant="dark" 
            size="lg" 
            className="w-100 py-3 mt-3 fw-bold text-uppercase"
            disabled={!currentVariant || currentVariant.stock === 0}
          >
            {currentVariant && currentVariant.stock > 0 ? 'Add to Cart' : 'Currently Unavailable'}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetailsPage;