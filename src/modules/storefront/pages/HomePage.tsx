import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { listStorefrontProducts } from '../../../store/actions/storefront/productActions';
import { getPublicFilters } from '../../../store/actions/storefront/filterActions';
import { addToCart } from '../../../store/actions/user/cartActions'; // <-- Imported addToCart
import { RootState } from '../../../store/reducers';
import Rating from '../../../common/components/Rating'; // <-- Imported Rating Component

import styles from '../../../schemas/css/HomePage.module.css';

const HomePage: React.FC = () => {
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [pageNumber, setPageNumber] = useState(1);
    const [allProducts, setAllProducts] = useState<any[]>([]);

    const [draftFilters, setDraftFilters] = useState<Record<string, string[]>>({});
    const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});

    // --- QUICK ADD TO CART MODAL STATES ---
    const [isCartModalOpen, setIsCartModalOpen] = useState(false);
    const [selectedProductForCart, setSelectedProductForCart] = useState<any>(null);
    const [modalColor, setModalColor] = useState('');
    const [modalSize, setModalSize] = useState('');
    const [modalQty, setModalQty] = useState(1);

    // --- REDUX STATES ---
    const storefrontProductList = useSelector((state: RootState) => state.storefrontProductList || {} as any);
    const { loading, error, products, pages } = storefrontProductList;

    const publicFilters = useSelector((state: RootState) => state.publicFilters || {} as any);
    const { filterStructure = [], filterOptions = {} } = publicFilters;

    useEffect(() => { dispatch(getPublicFilters()); }, [dispatch]);

    useEffect(() => {
        dispatch(listStorefrontProducts(pageNumber, appliedFilters));
    }, [dispatch, pageNumber, appliedFilters]);

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

    const handleFilterChange = (filterType: string, id: string) => {
        setDraftFilters(prev => {
            const currentSelections = prev[filterType] || [];
            const isSelected = currentSelections.includes(id);
            const newSelections = isSelected ? currentSelections.filter(itemId => itemId !== id) : [...currentSelections, id];
            return { ...prev, [filterType]: newSelections };
        });
    };

    const handleApplyFilters = () => { setAppliedFilters(draftFilters); setPageNumber(1); setAllProducts([]); };
    const handleClearFilters = () => { setDraftFilters({}); setAppliedFilters({}); setPageNumber(1); setAllProducts([]); };

    // --- QUICK ADD TO CART HANDLERS ---
    const openCartModal = (e: React.MouseEvent, product: any) => {
        e.preventDefault(); // Stop Link navigation
        setSelectedProductForCart(product);
        
        // Find default available variant
        const availableVariants = product.variants?.filter((v:any) => v.stock > 0) || product.variants || [];
        const defaultVariant = availableVariants[0] || {};

        setModalColor(product.displayColor || defaultVariant.color || '');
        setModalSize(defaultVariant.size || '');
        setModalQty(1);
        setIsCartModalOpen(true);
    };

    const closeCartModal = () => {
        setIsCartModalOpen(false);
        setSelectedProductForCart(null);
    };

    const submitAddToCart = () => {
        if (!selectedProductForCart) return;
        
        const currentVariant = selectedProductForCart.variants.find(
            (v: any) => v.color === modalColor && v.size === modalSize
        );

        if (!currentVariant) return alert("Please select a valid color and size.");
        if (currentVariant.stock < modalQty) return alert(`Only ${currentVariant.stock} items available in this variant.`);

        // --- FIX: Restore the real database ID before sending to the backend ---
        const cleanProduct = {
            ...selectedProductForCart,
            _id: selectedProductForCart.originalId || selectedProductForCart._id
        };

        dispatch(addToCart(cleanProduct, currentVariant, modalQty, navigate));
        closeCartModal();
    };

    // Derived values for the modal
    const uniqueModalColors = selectedProductForCart ? Array.from(new Set(selectedProductForCart.variants.map((v: any) => v.color))) as string[] : [];
    const uniqueModalSizes = selectedProductForCart ? Array.from(new Set(selectedProductForCart.variants.map((v: any) => v.size))) as string[] : [];
    const isModalSizeAvailable = (size: string) => {
        const variant = selectedProductForCart?.variants.find((v: any) => v.color === modalColor && v.size === size);
        return variant ? variant.stock > 0 : false;
    };
    const activeModalVariant = selectedProductForCart?.variants.find((v: any) => v.color === modalColor && v.size === modalSize);

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
                const colorImages = product.images?.filter((img: any) => img.color && img.color.toLowerCase().trim() === color.toLowerCase().trim());

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

                <aside className={styles['sidebar-filter']}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0 }}>Filters</h3>
                    </div>

                    {filterStructure.map((tab: any) => {
                        const options = filterOptions[tab.id] || [];
                        if (options.length === 0) return null;
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

                    {filterStructure.length > 0 && (
                        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button className="btn btn--primary btn--full" style={{ padding: '10px' }} onClick={handleApplyFilters}>Apply Filters</button>
                            <button className="btn btn--outline btn--full" style={{ padding: '10px' }} onClick={handleClearFilters}>Clear All</button>
                        </div>
                    )}
                </aside>

                <div style={{ flexGrow: 1 }}>
                    <header className={styles['page-header']}>
                        <div className={styles['page-header__info']}>
                            <h1 className={styles['page-header__title']}>All Products</h1>
                            {flattenedProducts.length > 0 && <span className={styles['page-header__count']}>{flattenedProducts.length} Items Displayed</span>}
                        </div>

                        <div className={styles['view-controls']}>
                            <button className={`${styles['view-controls__btn']} ${viewMode === 'grid' ? styles['view-controls__btn--active'] : ''}`} onClick={() => setViewMode('grid')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button className={`${styles['view-controls__btn']} ${viewMode === 'list' ? styles['view-controls__btn--active'] : ''}`} onClick={() => setViewMode('list')}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>
                    </header>

                    {error ? (
                        <div className={`${styles['state-container']} ${styles['state-container--error']}`}><p className={styles['state-message']}>{error}</p></div>
                    ) : flattenedProducts.length === 0 && !loading ? (
                        <div className={`${styles['state-container']} ${styles['state-container--empty']}`}><p className={styles['state-message']}>No products match your selected filters.</p></div>
                    ) : (
                        <section className={`${styles['product-layout']} ${styles[`product-layout--${viewMode}`]}`}>
                            {flattenedProducts.map((product: any, index: number) => {
                                const isLastElement = flattenedProducts.length === index + 1;

                                return (
                                    <article key={product._id} className={styles['product-card']} ref={isLastElement ? lastProductElementRef : null}>
                                        <Link to={`/product/${product.originalId}${product.displayColor ? `?color=${product.displayColor}` : ''}`} className={styles['product-card__link']}>
                                            <div className={styles['product-card__image-wrapper']}>
                                                <img className={styles['product-card__image']} src={getThumbnail(product.images)} alt={`${product.productName}`} loading="lazy" />
                                                {product.displayColor && <span className={styles['product-card__badge']}>{product.displayColor}</span>}
                                                
                                                {/* --- HOVER ACTIONS (Grid Mode) --- */}
                                                {viewMode === 'grid' && (
                                                    <div className={styles['product-card__overlay']}>
                                                        <button className="btn btn--primary btn--full" style={{ marginBottom: '8px' }} onClick={(e) => openCartModal(e, product)}>
                                                            Add to Cart
                                                        </button>
                                                        <span className="btn btn--outline btn--full" style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}>
                                                            View Details
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className={styles['product-card__info']}>
                                                <span className={styles['product-card__brand']}>{product.brand?.name || 'Exclusive'}</span>
                                                <h2 className={styles['product-card__title']}>{product.productName}</h2>
                                                
                                                {/* --- RATING DISPLAY --- */}
                                                <div style={{ margin: '4px 0 8px 0', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Rating value={product.rating || 0} /> 
                                                    <span style={{ color: 'var(--color-neutral-500)', fontSize: '12px' }}>({product.numReviews || 0})</span>
                                                </div>

                                                {viewMode === 'list' && <p className={styles['product-card__description']}>{product.description || `Premium quality product.`}</p>}
                                                
                                                <div className={styles['product-card__price-wrapper']}>
                                                    <span className={styles['product-card__price']}>{getDisplayPrice(product)}</span>
                                                    
                                                    {/* --- LIST MODE QUICK ADD BUTTON --- */}
                                                    {viewMode === 'list' && (
                                                        <button className="btn btn--primary" onClick={(e) => openCartModal(e, product)}>
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                                            Add to Cart
                                                        </button>
                                                    )}
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
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- ADD TO CART MODAL --- */}
            {isCartModalOpen && selectedProductForCart && (
                <div className={styles['cart-modal-backdrop']} onClick={closeCartModal}>
                    <div className={styles['cart-modal-content']} onClick={e => e.stopPropagation()}>
                        <div className={styles['cart-modal-header']}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Add to Cart</h3>
                            <button onClick={closeCartModal} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            <img src={getThumbnail(selectedProductForCart.images)} alt={selectedProductForCart.productName} style={{ width: '80px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
                            <div>
                                <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{selectedProductForCart.productName}</h4>
                                <span style={{ color: 'var(--color-primary-600)', fontWeight: 'bold' }}>{getDisplayPrice(selectedProductForCart)}</span>
                            </div>
                        </div>

                        <div className={styles['modal-form-group']}>
                            <label>Color</label>
                            <div className={styles['modal-swatches']}>
                                {uniqueModalColors.map((color) => (
                                    <button key={color} type="button" className={`${styles['modal-swatch']} ${modalColor === color ? styles['modal-swatch--active'] : ''}`} onClick={() => setModalColor(color)} title={color}>
                                        <span style={{ backgroundColor: color.toLowerCase() === 'white' ? '#f8f9fa' : color.toLowerCase() }}></span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles['modal-form-group']}>
                            <label>Size</label>
                            <div className={styles['modal-swatches']}>
                                {uniqueModalSizes.map((size) => (
                                    <button key={size} type="button" disabled={!isModalSizeAvailable(size)} className={`${styles['modal-size-btn']} ${modalSize === size ? styles['modal-size-btn--active'] : ''}`} onClick={() => setModalSize(size)}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles['modal-form-group']}>
                            <label>Quantity</label>
                            <select value={modalQty} onChange={(e) => setModalQty(Number(e.target.value))} style={{ padding: '8px', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}>
                                {[...Array(Math.min(activeModalVariant?.stock || 10, 10)).keys()].map((x) => (
                                    <option key={x + 1} value={x + 1}>{x + 1}</option>
                                ))}
                            </select>
                        </div>

                        <button className="btn btn--primary btn--full" style={{ padding: '12px' }} onClick={submitAddToCart} disabled={!activeModalVariant || activeModalVariant.stock < 1}>
                            {activeModalVariant && activeModalVariant.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            )}
        </main>
    );
};

export default HomePage;