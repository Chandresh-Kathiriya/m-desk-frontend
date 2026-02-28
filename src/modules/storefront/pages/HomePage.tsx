import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
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

  // State for Infinite Scrolling
  const [pageNumber, setPageNumber] = useState(1);

  const storefrontProductList = useSelector((state: RootState) => state.storefrontProductList || {} as any);
  // Assuming your backend returns 'pages' (total pages) to know when to stop fetching
  const { loading, error, products, pages } = storefrontProductList;

  // 1. Initial Fetch and Load More
  useEffect(() => {
    // Pass the pageNumber to your action to fetch the specific page
    dispatch(listStorefrontProducts(pageNumber));
  }, [dispatch, pageNumber]);

  // 2. Infinite Scroll Observer Setup
  const observer = useRef<IntersectionObserver | null>(null);
  const lastProductElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      // If the bottom div is visible on screen, and we haven't reached the last page
      if (entries[0].isIntersecting && (!pages || pageNumber < pages)) {
        setPageNumber(prevPageNumber => prevPageNumber + 1);
      }
    });

    if (node) observer.current.observe(node);
  }, [loading, pageNumber, pages]);

  // 3. FLATTEN PRODUCTS BY COLOR
  const flattenedProducts = useMemo(() => {
    // Check if products exists AND is actually an array
    if (!products || !Array.isArray(products)) return [];

    const flatList: any[] = [];

    // Tell TypeScript explicitly that products is an array of any: (products as any[])
    (products as any[]).forEach((product: any) => {
      // Extract unique colors from the variants array
      const uniqueColors = Array.from(new Set(product.variants?.map((v: any) => v.color))) as string[];

      // If a product has no variants/colors, push it as is
      if (!uniqueColors || uniqueColors.length === 0) {
        flatList.push({ ...product, originalId: product._id, displayColor: null });
        return;
      }

      // Create a separate card for EVERY color
      uniqueColors.forEach(color => {
        // Get only the variants that match this color
        const colorVariants = product.variants.filter((v: any) => v.color === color);

        // Case-insensitive and space-trimmed image matching
        const colorImages = product.images?.filter((img: any) => {
          if (!img.color) return false;
          return img.color.toLowerCase().trim() === color.toLowerCase().trim();
        });

        // Fallback to the main product images if no specific color image is found
        const displayImages = colorImages?.length > 0 ? colorImages : product.images;

        flatList.push({
          ...product,
          _id: `${product._id}-${color}`,
          originalId: product._id,
          displayColor: color,
          variants: colorVariants,
          images: displayImages
        });
      });
    });

    return flatList;
  }, [products]);

  // Helpers
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
      <div className={styles.container}>

        <header className={styles['page-header']}>
          <div className={styles['page-header__info']}>
            <h1 className={styles['page-header__title']}>All Products</h1>
            {flattenedProducts.length > 0 && (
              <span className={styles['page-header__count']}>{flattenedProducts.length} Items Displayed</span>
            )}
          </div>

          <div className={styles['view-controls']}>
            <button
              className={`${styles['view-controls__btn']} ${viewMode === 'grid' ? styles['view-controls__btn--active'] : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`${styles['view-controls__btn']} ${viewMode === 'list' ? styles['view-controls__btn--active'] : ''}`}
              onClick={() => setViewMode('list')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </header>

        {error ? (
          <div className={`${styles['state-container']} ${styles['state-container--error']}`}>
            <p className={styles['state-message']}>{error}</p>
          </div>
        ) : flattenedProducts.length === 0 && !loading ? (
          <div className={`${styles['state-container']} ${styles['state-container--empty']}`}>
            <p className={styles['state-message']}>No products available at the moment. Check back soon!</p>
          </div>
        ) : (
          <section className={`${styles['product-layout']} ${styles[`product-layout--${viewMode}`]}`}>
            {flattenedProducts.map((product: any, index: number) => {
              // Attach the observer ref to the very last product card in the array
              const isLastElement = flattenedProducts.length === index + 1;

              return (
                <article
                  key={product._id}
                  className={styles['product-card']}
                  ref={isLastElement ? lastProductElementRef : null}
                >
                  {/* Notice we pass the displayColor in the URL so the Product Details page can auto-select it! */}
                  <Link to={`/product/${product.originalId}${product.displayColor ? `?color=${product.displayColor}` : ''}`} className={styles['product-card__link']}>

                    <div className={styles['product-card__image-wrapper']}>
                      <img
                        className={styles['product-card__image']}
                        src={getThumbnail(product.images)}
                        alt={`${product.productName} in ${product.displayColor || ''}`}
                        loading="lazy"
                      />
                      {product.displayColor && (
                        <span className={styles['product-card__badge']} style={{ backgroundColor: 'var(--color-neutral-800)', top: '10px', right: '10px', left: 'auto' }}>
                          {product.displayColor}
                        </span>
                      )}

                      {viewMode === 'grid' && (
                        <div className={styles['product-card__overlay']}>
                          <span className={`${styles.btn} ${styles['btn--secondary']} ${styles['btn--full']}`}>
                            View Details
                          </span>
                        </div>
                      )}
                    </div>

                    <div className={styles['product-card__info']}>
                      <span className={styles['product-card__brand']}>{product.brand?.name || 'Exclusive'}</span>
                      <h2 className={styles['product-card__title']}>{product.productName}</h2>

                      {viewMode === 'list' && (
                        <p className={styles['product-card__description']}>
                          {product.description || `Premium quality product in beautiful ${product.displayColor}. Click to view more details.`}
                        </p>
                      )}

                      <div className={styles['product-card__price-wrapper']}>
                        <span className={styles['product-card__price']}>{getDisplayPrice(product)}</span>
                      </div>
                    </div>

                  </Link>
                </article>
              );
            })}
          </section>
        )}

        {/* Show a loading spinner at the bottom while fetching the next page */}
        {loading && (
          <div className={styles['state-container']} style={{ padding: '2rem 0' }}>
            <div className={styles.spinner} aria-label="Loading more products..."></div>
          </div>
        )}

      </div>
    </main>
  );
};

export default HomePage;