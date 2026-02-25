import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { listStorefrontProducts } from '../../../store/actions/storefront/productActions';
import { RootState } from '../../../store/reducers';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<any>();

  // Pull the public data from Redux
  const storefrontProductList = useSelector((state: RootState) => state.storefrontProductList || {} as any);
  const { loading, error, products } = storefrontProductList;

  useEffect(() => {
    dispatch(listStorefrontProducts());
  }, [dispatch]);

  // Helper to grab the first image to use as the thumbnail
  const getThumbnail = (images: any[]) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/400x500?text=No+Image';
    // Try to find a 'front' view if you labeled it, otherwise grab the first one
    return images[0].url; 
  };

  // --- SMART PRICE CALCULATOR (DEBUG MODE) ---
  const getDisplayPrice = (product: any) => {

    if (!product.variants || product.variants.length === 0) {
      console.warn(`❌ ERROR: No variants found for this product! Returning ₹0.00`);
      return '₹0.00';
    }

    // Check stock
    const inStockVariants = product.variants.filter((v: any) => v.stock > 0);

    const variantsToCheck = inStockVariants.length > 0 ? inStockVariants : product.variants;

    // Calculate math and log every single step
    const mrps = variantsToCheck.map((v: any) => {
      const price = Number(v.salesPrice);
      const tax = Number(v.salesTax);
      
      const safePrice = price || 0;
      const safeTax = tax || 0;
      const finalMrp = safePrice + (safePrice * (safeTax / 100));
      
      return finalMrp;
    }).filter((mrp: number) => mrp > 0);


    const minPrice = Math.min(...mrps);
    const maxPrice = Math.max(...mrps);

    const displayResult = minPrice === maxPrice ? `₹${minPrice.toFixed(2)}` : `From ₹${minPrice.toFixed(2)}`;

    return displayResult;
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      {/* Hero Banner Section (Placeholder) */}
      <div className="bg-dark text-white text-center py-5 mb-5">
        <Container>
          <h1 className="display-4 fw-bold">New Arrivals</h1>
          <p className="lead">Discover the latest trends from top brands.</p>
        </Container>
      </div>

      <Container>
        {loading ? (
          <Spinner animation="border" role="status" className="d-block mx-auto my-5" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !products || products.length === 0 ? (
            <Alert variant="info" className="text-center">No products available at the moment. Check back soon!</Alert>
          ) : (
            <Row xs={1} sm={2} md={3} lg={4} className="g-4">
              {/* Add the '?' right after products to prevent the map crash */}
              {products?.map((product: any) => (
              <Col key={product._id}>
                {/* Wrapping the whole card in a Link to go to the Product Details page */}
                <Link to={`/product/${product._id}`} className="text-decoration-none text-dark">
                  <Card className="h-100 shadow-sm border-0 product-card-hover">
                    
                    {/* Product Image */}
                    <div className="position-relative overflow-hidden bg-white" style={{ height: '300px' }}>
                      <Card.Img 
                        variant="top" 
                        src={getThumbnail(product.images)} 
                        alt={product.productName}
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      />
                      {/* Optional: Add a "New" badge if published recently */}
                      <Badge bg="dark" className="position-absolute top-0 start-0 m-3 text-uppercase shadow">
                        New
                      </Badge>
                    </div>

                    <Card.Body className="d-flex flex-column">
                      {/* Brand Name (Small & Subdued) */}
                      <div className="text-muted text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '1px' }}>
                        {product.brand?.name || 'Exclusive'}
                      </div>
                      
                      {/* Product Name */}
                      <Card.Title className="fs-6 fw-bold mb-2" style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis' 
                      }}>
                        {product.productName}
                      </Card.Title>

                      {/* Pricing */}
                      <div className="mt-auto pt-3 border-top">
                      <span className="fs-5 fw-bold text-primary">{getDisplayPrice(product)}</span>
                        {/* Optional: If you had a compare price, it would go here crossed out */}
                      </div>
                    </Card.Body>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      
      {/* Quick CSS trick for a hover effect without writing a separate CSS file */}
      <style>{`
        .product-card-hover { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
        .product-card-hover:hover { transform: translateY(-5px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; }
      `}</style>
    </div>
  );
};

export default HomePage;