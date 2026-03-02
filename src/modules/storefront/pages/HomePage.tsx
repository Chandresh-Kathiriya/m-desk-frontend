import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { listStorefrontProducts } from '../../../store/actions/storefront/productActions';
import { getPublicFilters } from '../../../store/actions/storefront/filterActions';
import { RootState } from '../../../store/reducers';

import styles from '../../../schemas/css/HomePage.module.css';

const HomePage: React.FC = () => {
    const dispatch = useDispatch<any>();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [pageNumber, setPageNumber] = useState(1);
    const [allProducts, setAllProducts] = useState<any[]>([]);

    // --- NEW: SEPARATE DRAFT AND APPLIED FILTER STATES ---
    const [draftFilters, setDraftFilters] = useState<Record<string, string[]>>({});
    const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});

    // --- REDUX STATES ---
    const storefrontProductList = useSelector((state: RootState) => state.storefrontProductList || {} as any);
    const { loading, error, products, pages } = storefrontProductList;

    const publicFilters = useSelector((state: RootState) => state.publicFilters || {} as any);
    const { filterStructure = [], filterOptions = {} } = publicFilters;

    // 1. Fetch ALL Tabs and their options via Redux on mount
    useEffect(() => {
        dispatch(getPublicFilters());
    }, [dispatch]);

    // 2. Fetch products whenever pageNumber OR APPLIED filters change
    useEffect(() => {
        dispatch(listStorefrontProducts(pageNumber, appliedFilters));
    }, [dispatch, pageNumber, appliedFilters]);

    // 3. Append products for infinite scroll
    useEffect(() => {
        if (products && Array.isArray(products)) {
            if (pageNumber === 1) {
                setAllProducts(products as any[]);
            } else {
                setAllProducts((prev: any[]) => {
                    const existingIds = new Set(prev.map((p: any) => p._id));
                    const newProducts = (products as any[]).filter((p: any) => !existingIds.has(p._id));
                    return [...prev, ...newProducts];
                });
            }
        }
    }, [products, pageNumber]);

    // Observer for Infinite Scroll
    const observer = useRef<IntersectionObserver | null>(null);
    const lastProductElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && (!pages || pageNumber < pages)) {
                setPageNumber(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, pageNumber, pages]);

    // --- NEW: Handle Filter Toggles (Updates Draft Only) ---
    const handleFilterChange = (filterType: string, id: string) => {
        setDraftFilters(prev => {
            const currentSelections = prev[filterType] || [];
            const isSelected = currentSelections.includes(id);

            const newSelections = isSelected
                ? currentSelections.filter(itemId => itemId !== id)
                : [...currentSelections, id];

            return { ...prev, [filterType]: newSelections };
        });
    };

    // --- NEW: Apply Filters Button Handler ---
    const handleApplyFilters = () => {
        setAppliedFilters(draftFilters);
        setPageNumber(1);
        setAllProducts([]);
    };

    // --- NEW: Clear Filters Button Handler ---
    const handleClearFilters = () => {
        setDraftFilters({});
        setAppliedFilters({});
        setPageNumber(1);
        setAllProducts([]);
    };

    const flattenedProducts = useMemo(() => {
        if (!allProducts || allProducts.length === 0) return [];
        const flatList: any[] = [];

        allProducts.forEach((product: any) => {
            const uniqueColors = Array.from(new Set(product.variants?.map((v: any) => v.color))) as string[];
            if (!uniqueColors || uniqueColors.length === 0) {
                flatList.push({ ...product, originalId: product._id, displayColor: null });
                return;
            }

            uniqueColors.forEach(color => {
                const colorVariants = product.variants.filter((v: any) => v.color === color);
                const colorImages = product.images?.filter((img: any) => {
                    if (!img.color) return false;
                    return img.color.toLowerCase().trim() === color.toLowerCase().trim();
                });

                flatList.push({
                    ...product,
                    _id: `${product._id}-${color}`,
                    originalId: product._id,
                    displayColor: color,
                    variants: colorVariants,
                    images: colorImages?.length > 0 ? colorImages : product.images
                });
            });
        });

        return flatList;
    }, [allProducts]);

    const getThumbnail = (images: any[]) => images?.length > 0 ? images[0].url : 'https://via.placeholder.com/400x500?text=No+Image';

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

        return minPrice === maxPrice ? `₹${minPrice.toFixed(2)}` : `From ₹${minPrice.toFixed(2)}`;
    };

    return (
        <main className={styles['home-page']}>
            <div className={styles.container} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', paddingTop: '2rem' }}>

                {/* --- DYNAMIC FILTER SIDEBAR --- */}
                <aside style={{ width: '250px', flexShrink: 0, position: 'sticky', top: '20px', backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Filters</h3>
                    </div>

                    {filterStructure.map((tab: any) => {
                        const options = filterOptions[tab.id] || [];
                        if (options.length === 0) return null;

                        // Checkboxes now read from draftFilters
                        const currentSelected = draftFilters[tab.id] || [];

                        return (
                            <div key={tab.id} style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#6b7280', marginBottom: '10px' }}>{tab.label}</h4>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                                    {options.map((item: any) => (
                                        <li key={item._id}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={currentSelected.includes(item._id)}
                                                    onChange={() => handleFilterChange(tab.id, item._id)}
                                                />
                                                {tab.id === 'colors' && item.hexCode && (
                                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.hexCode, border: '1px solid #ccc' }}></span>
                                                )}
                                                <span style={{ fontWeight: currentSelected.includes(item._id) ? 'bold' : 'normal' }}>
                                                    {item.name} {tab.id === 'sizes' && item.code ? `(${item.code})` : ''}
                                                </span>
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}

                    {/* --- NEW: APPLY & CLEAR BUTTONS --- */}
                    {filterStructure.length > 0 && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button 
                                className="btn btn--primary btn--full" 
                                style={{ width: '100%', padding: '10px', backgroundColor: 'var(--color-primary-600)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                                onClick={handleApplyFilters}
                            >
                                Apply Filters
                            </button>
                            <button 
                                className="btn btn--outline btn--full" 
                                style={{ width: '100%', padding: '10px', backgroundColor: 'transparent', color: 'var(--color-neutral-600)', border: '1px solid var(--color-neutral-300)', borderRadius: '6px', cursor: 'pointer' }}
                                onClick={handleClearFilters}
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </aside>

                {/* --- PRODUCT GRID SECTION --- */}
                <div style={{ flexGrow: 1 }}>
                    <header className={styles['page-header']}>
                        <div className={styles['page-header__info']}>
                            <h1 className={styles['page-header__title']}>All Products</h1>
                            {flattenedProducts.length > 0 && (
                                <span className={styles['page-header__count']}>{flattenedProducts.length} Items Displayed</span>
                            )}
                        </div>

                        <div className={styles['view-controls']}>
                            <button className={`${styles['view-controls__btn']} ${viewMode === 'grid' ? styles['view-controls__btn--active'] : ''}`} onClick={() => setViewMode('grid')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>
                                </svg>
                            </button>
                            <button className={`${styles['view-controls__btn']} ${viewMode === 'list' ? styles['view-controls__btn--active'] : ''}`} onClick={() => setViewMode('list')}>
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
                            <p className={styles['state-message']}>No products match your selected filters.</p>
                        </div>
                    ) : (
                        <section className={`${styles['product-layout']} ${styles[`product-layout--${viewMode}`]}`}>
                            {flattenedProducts.map((product: any, index: number) => {
                                const isLastElement = flattenedProducts.length === index + 1;

                                return (
                                    <article key={product._id} className={styles['product-card']} ref={isLastElement ? lastProductElementRef : null}>
                                        <Link to={`/product/${product.originalId}${product.displayColor ? `?color=${product.displayColor}` : ''}`} className={styles['product-card__link']}>
                                            <div className={styles['product-card__image-wrapper']} style={{ aspectRatio: '4/5', backgroundColor: '#f3f4f6', position: 'relative', overflow: 'hidden' }}>
                                                <img className={styles['product-card__image']} src={getThumbnail(product.images)} alt={`${product.productName}`} loading="lazy" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                {product.displayColor && <span className={styles['product-card__badge']} style={{ backgroundColor: 'var(--color-neutral-800)', top: '10px', right: '10px', left: 'auto', zIndex: 2 }}>{product.displayColor}</span>}
                                                {viewMode === 'grid' && (
                                                    <div className={styles['product-card__overlay']} style={{ zIndex: 2 }}>
                                                        <span className="btn btn--primary btn--full" style={{ width: '100%', display: 'inline-block', textAlign: 'center' }}>
                                                            View Details
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles['product-card__info']}>
                                                <span className={styles['product-card__brand']}>{product.brand?.name || 'Exclusive'}</span>
                                                <h2 className={styles['product-card__title']}>{product.productName}</h2>
                                                {viewMode === 'list' && <p className={styles['product-card__description']}>{product.description || `Premium quality product.`}</p>}
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

                    {loading && (
                        <div className={styles['state-container']} style={{ padding: '2rem 0' }}>
                            <div className="spinner" aria-label="Loading more products..."></div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default HomePage;