import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listStorefrontProducts } from '../../../store/actions/storefront/productActions';
import { RootState } from '../../../store/reducers';

// Import the CSS module
import styles from '../../../schemas/css/HomePage.module.css';

const HomePage: React.FC = () => {
  const dispatch = useDispatch<any>();
  
  // State for toggling between Grid and List views
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const storefrontProductList = useSelector((state: RootState) => state.storefrontProductList || {} as any);
  const { loading, error, products } = storefrontProductList;

  useEffect(() => {
    dispatch(listStorefrontProducts());
  }, [dispatch]);

  const getThumbnail = (images: any[]) => {
    if (!images || images.length === 0) return 'https://via.placeholder.com/400x500?text=No+Image';
    return images[0].url; 
  };

  const getDisplayPrice = (product: any) => {
    if (!product.variants || product.variants.length === 0) return '₹0.00';

    const inStockVariants = product.variants.filter((v: any) => v.stock > 0);
    const variantsToCheck = inStockVariants.length > 0 ? inStockVariants : product.variants;

    const mrps = variantsToCheck.map((v: any) => {
      const price = Number(v.salesPrice) || 0;
      const tax = Number(v.salesTax) || 0;
      return price + (price * (tax / 100));
    }).filter((mrp: number) => mrp > 0);

    if (mrps.length === 0) return '₹0.00';

    const minPrice = Math.min(...mrps);
    const maxPrice = Math.max(...mrps);

    return minPrice === maxPrice 
      ? `₹${minPrice.toFixed(2)}` 
      : `From ₹${minPrice.toFixed(2)}`;
  };

  return (
    <main className={styles['home-page']}>
      {/* Note: 'container' might be a global class from Bootstrap or theme.css. 
          If it's in your module, use styles.container. If it's global, keep it as a string.
          Assuming it's in your module based on the CSS provided: */}
      <div className={styles.container}>
        
        {/* Clean, Modern Page Header with View Controls */}
        <header className={styles['page-header']}>
          <div className={styles['page-header__info']}>
            <h1 className={styles['page-header__title']}>All Products</h1>
            {!loading && products && (
              <span className={styles['page-header__count']}>{(products as any[])?.length} Items</span>
            )}
          </div>
          
          <div className={styles['view-controls']}>
            <button 
              className={`${styles['view-controls__btn']} ${viewMode === 'grid' ? styles['view-controls__btn--active'] : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button 
              className={`${styles['view-controls__btn']} ${viewMode === 'list' ? styles['view-controls__btn--active'] : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="List View"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        {loading ? (
          <div className={styles['state-container']}>
            <div className={styles.spinner} aria-label="Loading products..."></div>
          </div>
        ) : error ? (
          <div className={`${styles['state-container']} ${styles['state-container--error']}`}>
            <p className={styles['state-message']}>{error}</p>
          </div>
        ) : !products || (products as any[])?.length === 0 ? (
          <div className={`${styles['state-container']} ${styles['state-container--empty']}`}>
            <p className={styles['state-message']}>No products available at the moment. Check back soon!</p>
          </div>
        ) : (
          /* Dynamic Grid/List Container using Module Classes */
          <section className={`${styles['product-layout']} ${styles[`product-layout--${viewMode}`]}`}>
            {(products as any[])?.map((product: any) => (
              <article key={product._id} className={styles['product-card']}>
                <Link to={`/product/${product._id}`} className={styles['product-card__link']}>
                  
                  <div className={styles['product-card__image-wrapper']}>
                    <img 
                      className={styles['product-card__image']}
                      src={getThumbnail(product.images)} 
                      alt={`View details for ${product.productName}`}
                      loading="lazy"
                    />
                    <span className={styles['product-card__badge']}>New</span>
                    
                    {/* Only show overlay in grid view */}
                    {viewMode === 'grid' && (
                      <div className={styles['product-card__overlay']}>
                        {/* We combine module classes btn, btn--secondary, etc. */}
                        <span className={`${styles.btn} ${styles['btn--secondary']} ${styles['btn--full']}`}>
                          View Details
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles['product-card__info']}>
                    <span className={styles['product-card__brand']}>
                      {product.brand?.name || 'Exclusive'}
                    </span>
                    <h2 className={styles['product-card__title']}>
                      {product.productName}
                    </h2>
                    
                    {/* Description placeholder for List View */}
                    {viewMode === 'list' && (
                       <p className={styles['product-card__description']}>
                         {product.description || 'Premium quality product designed for modern lifestyles. Click to view more details, specifications, and availability.'}
                       </p>
                    )}

                    <div className={styles['product-card__price-wrapper']}>
                      <span className={styles['product-card__price']}>{getDisplayPrice(product)}</span>
                      {viewMode === 'list' && (
                        <span className={`${styles.btn} ${styles['btn--primary']} ${styles['product-card__list-btn']}`}>
                          View Product
                        </span>
                      )}
                    </div>
                  </div>
                  
                </Link>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default HomePage;