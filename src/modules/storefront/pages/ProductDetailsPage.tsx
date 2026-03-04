import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getStorefrontProductDetails, listSimilarProducts } from '../../../store/actions/storefront/productActions';
import { addToCart } from '../../../store/actions/user/cartActions';
import { listMyOrders } from '../../../store/actions/user/orderActions';
import { createReview, updateReview, deleteReview } from '../../../store/actions/storefront/reviewActions';
import { REVIEW_CREATE_RESET, REVIEW_UPDATE_RESET, REVIEW_VOTE_RESET, REVIEW_REPORT_RESET, REVIEW_DELETE_RESET } from '../../../store/constants/storefront/reviewConstants';
import { STOREFRONT_SIMILAR_PRODUCTS_RESET } from '../../../store/constants/storefront/productConstants';
import { RootState } from '../../../store/reducers';
import Rating from '../../../common/components/Rating';

// Import CSS Module
import styles from '../../../schemas/css/ProductDetailsPage.module.css';
import { showConfirmAlert, showToast } from '../../../common/utils/alertUtils';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();
  const location = useLocation();
  const navigate = useNavigate();

  // --- NEW: SCROLL REF FOR SIMILAR PRODUCTS ---
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- REDUX STATES ---
  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  const productDetails = useSelector((state: RootState) => state.storefrontProductDetails || {});
  const { loading, error, product } = productDetails as any;

  const storefrontSimilarProducts = useSelector((state: RootState) => state.storefrontSimilarProducts || {});
  const { products: similarProducts = [] } = storefrontSimilarProducts as any;

  const orderListMy = useSelector((state: RootState) => state.orderListMy || {});
  const { orders: myOrders } = orderListMy as any;

  const reviewCreate = useSelector((state: RootState) => state.reviewCreate || {});
  const { loading: loadingCreateReview, success: successCreateReview, error: errorCreateReview } = reviewCreate as any;

  const reviewUpdate = useSelector((state: RootState) => state.reviewUpdate || {});
  const { loading: loadingUpdateReview, success: successUpdateReview, error: errorUpdateReview } = reviewUpdate as any;

  const reviewVote = useSelector((state: RootState) => state.reviewVote || {});
  const { loadingId: loadingVoteId, success: successVote, error: errorVote } = reviewVote as any;

  const reviewReport = useSelector((state: RootState) => state.reviewReport || {});
  const { loadingId: loadingReportId, success: successReport, error: errorReport } = reviewReport as any;

  const reviewDelete = useSelector((state: RootState) => state.reviewDelete || {});
  const { loading: loadingDeleteReview, success: successDeleteReview, error: errorDeleteReview } = reviewDelete as any;

  // --- LOCAL UI STATES ---
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [qty, setQty] = useState<number>(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // 1. Initial Page Load
  useEffect(() => {
    if (id) {
      dispatch(getStorefrontProductDetails(id));
      window.scrollTo(0, 0);
    }
    return () => {
      dispatch({ type: 'STOREFRONT_PRODUCT_DETAILS_RESET' });
      dispatch({ type: STOREFRONT_SIMILAR_PRODUCTS_RESET });
    };
  }, [dispatch, id]);

  // 2. Fetch Similar Products using the Waterfall Strategy
  useEffect(() => {
    if (product && product._id) {
      // Safely extract the IDs based on how backend populated them
      const typeVal = product.productType?._id || product.productType || '';
      const categoryVal = product.productCategory?._id || product.productCategory || product.category?._id || product.category || '';
      const brandVal = product.brand?._id || product.brand || '';

      // Dispatch the action with all the data
      dispatch(listSimilarProducts(product._id, typeVal, categoryVal, brandVal));
    }
  }, [dispatch, product]);

  // Reviews logic
  useEffect(() => {
    if (successCreateReview) {
      showToast('Review submitted successfully!', 'success');
      setRating(0);
      setComment('');
      dispatch({ type: REVIEW_CREATE_RESET });
      if (id) dispatch(getStorefrontProductDetails(id));
    }

    if (successUpdateReview) {
      showToast('Review updated successfully!', 'success');
      setEditingReviewId(null);
      setRating(0);
      setComment('');
      dispatch({ type: REVIEW_UPDATE_RESET });
      if (id) dispatch(getStorefrontProductDetails(id));
    }

    if (successVote) {
      dispatch({ type: REVIEW_VOTE_RESET });
      if (id) dispatch(getStorefrontProductDetails(id));
    }

    if (successReport) {
      showToast('Review reported to administrators.', 'success');
      dispatch({ type: REVIEW_REPORT_RESET });
    }

    if (successDeleteReview) {
      showToast('Review deleted successfully!', 'success');
      dispatch({ type: REVIEW_DELETE_RESET });
      if (id) dispatch(getStorefrontProductDetails(id)); // Refetch the product to remove the review from the list
    }

    if (errorDeleteReview) {
      showToast(errorDeleteReview, 'error');
    }

    if (errorVote) {
      showToast(errorVote, 'error');
    }

    if (errorReport) {
      showToast(errorReport, 'error');
    }
  }, [dispatch, id, successCreateReview, successUpdateReview, successVote, successReport, successDeleteReview, errorDeleteReview, errorVote, errorReport]);

  // Purchase verification logic
  useEffect(() => {
    if (userInfo && userInfo.token && product?._id) {
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo, product]);

  useEffect(() => {
    if (myOrders && myOrders.length > 0 && product?._id) {
      const boughtIt = myOrders.some((order: any) =>
        order.isPaid && order.orderItems.some((item: any) => item.product === product._id)
      );
      setHasPurchased(boughtIt);
    }
  }, [myOrders, product]);

  // Variant matching logic
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const queryParams = new URLSearchParams(location.search);
      const urlColor = queryParams.get('color');

      let defaultColor = '';
      let defaultSize = '';

      if (urlColor) {
        const variantMatch = product.variants.find(
          (v: any) => v.color.toLowerCase().trim() === urlColor.toLowerCase().trim()
        );
        if (variantMatch) {
          defaultColor = variantMatch.color;
          defaultSize = variantMatch.size;
        }
      }

      if (!defaultColor) {
        const firstAvailable = product.variants.find((v: any) => v.stock > 0) || product.variants[0];
        defaultColor = firstAvailable.color;
        defaultSize = firstAvailable.size;
      }

      setSelectedColor(defaultColor);
      setSelectedSize(defaultSize);

      if (product.images && product.images.length > 0) {
        const matchingImg = product.images.find(
          (img: any) => img.color && img.color.toLowerCase().trim() === defaultColor.toLowerCase().trim()
        );
        setMainImage(matchingImg ? matchingImg.url : product.images[0].url);
      }
    }
  }, [product, location.search]);

  const filteredImages = product?.images?.filter(
    (img: any) => img.color && img.color.toLowerCase() === selectedColor.toLowerCase()
  ) || [];

  const displayImages = filteredImages.length > 0 ? filteredImages : (product?.images || []);

  useEffect(() => {
    if (displayImages.length > 0) {
      const isMainImageValid = displayImages.some((img: any) => img.url === mainImage);
      if (!isMainImageValid) setMainImage(displayImages[0].url);
    }
  }, [selectedColor, product, mainImage, displayImages]);

  // --- INTELLIGENT SIMILAR PRODUCTS COMPILER & SORTER ---
  const displaySimilarProducts = useMemo(() => {
    const list: any[] = [];

    // 1. PRIORITY #1: Other Colors of the CURRENT Product
    if (product && product.variants) {
      const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color))) as string[];
      uniqueColors.forEach(color => {
        if (color.toLowerCase().trim() !== selectedColor.toLowerCase().trim()) {
          const colorImages = product.images?.filter((img: any) => img.color && img.color.toLowerCase().trim() === color.toLowerCase().trim());
          list.push({
            ...product,
            _id: `${product._id}-${color}`,
            originalId: product._id,
            displayColor: color,
            images: colorImages?.length > 0 ? colorImages : product.images
          });
        }
      });
    }

    // 2. EXPLICIT FRONTEND SORTING: Split into Same Type vs Other Randoms
    let sortedSimilar: any[] = [];
    if (similarProducts && similarProducts.length > 0) {
      const targetTypeId = product.productType?._id || product.productType;

      const sameTypeProducts = similarProducts.filter((p: any) => {
        const pType = p.productType?._id || p.productType;
        return pType && targetTypeId && pType.toString() === targetTypeId.toString();
      });

      const otherProducts = similarProducts.filter((p: any) => {
        const pType = p.productType?._id || p.productType;
        return !pType || !targetTypeId || pType.toString() !== targetTypeId.toString();
      });

      // Priority #2: Same Product Types. Priority #3: Other Category Products
      sortedSimilar = [...sameTypeProducts, ...otherProducts];
    }

    // 3. Flatten the sorted Similar Products
    sortedSimilar.forEach((simProduct: any) => {
      const uniqueColors = Array.from(new Set(simProduct.variants?.map((v: any) => v.color))) as string[];

      if (!uniqueColors || uniqueColors.length === 0) {
        list.push({ ...simProduct, originalId: simProduct._id, displayColor: null });
      } else {
        uniqueColors.forEach(color => {
          const colorImages = simProduct.images?.filter((img: any) => img.color && img.color.toLowerCase().trim() === color.toLowerCase().trim());
          list.push({
            ...simProduct,
            _id: `${simProduct._id}-${color}`,
            originalId: simProduct._id,
            displayColor: color,
            images: colorImages?.length > 0 ? colorImages : simProduct.images
          });
        });
      }
    });

    // 4. Return up to 15 items for the horizontal scroll
    return list.slice(0, 15);
  }, [product, selectedColor, similarProducts]);

  // --- NEW: HORIZONTAL SCROLL HANDLER ---
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Pixels to scroll per click
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const isInitialLoading = loading || !product || product._id !== id;

  if (isInitialLoading) {
    return (
      <div className={styles['state-container']}>
        <div className={styles.spinner}></div>
        <p className={styles['loading-text']}>Loading Product Details...</p>
      </div>
    );
  }
  if (error) return <div className="container mt-8"><div className={`${styles['state-container']} ${styles['state-container--error']}`}><p className={styles['state-message']}>{error}</p></div></div>;
  if (!product || !product._id || product._id !== id) return <div className={styles['state-container']}><div className={styles.spinner}></div></div>;
  if (!product || !product._id) return null;

  const uniqueColors = Array.from(new Set(product.variants.map((v: any) => v.color))) as string[];
  const uniqueSizes = Array.from(new Set(product.variants.map((v: any) => v.size))) as string[];

  const currentVariant = product.variants.find(
    (v: any) => v.color === selectedColor && v.size === selectedSize
  );

  const getVariantPrice = (variant: any) => {
    if (!variant) return 0;
    const price = Number(variant.salesPrice) || 0;
    const tax = Number(variant.salesTax) || 0;
    return (price + (price * (tax / 100))).toFixed(2);
  };

  const isSizeAvailableForColor = (size: string) => {
    const variant = product.variants.find((v: any) => v.color === selectedColor && v.size === size);
    return variant ? variant.stock > 0 : false;
  };

  const addToCartHandler = () => {
    if (currentVariant) {
      dispatch(addToCart(product, currentVariant, qty, navigate));

      // --- UPGRADED: Success Toast ---
      showToast(`${product.productName} added to cart!`, 'success');

      if (userInfo && userInfo.token) {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
      }
    }
  };

  const submitReviewHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReviewId) dispatch(updateReview(product._id, editingReviewId, { rating, comment }));
    else dispatch(createReview(product._id, { rating, comment }));
  };

  const sortedReviews = product?.reviews ? [...product.reviews].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];

  const userId = userInfo?.user?._id || userInfo?.user?.id || userInfo?._id || userInfo?.id;

  // Check if this specific user ID exists in the reviews array
  const userExistingReview = userId ? sortedReviews.find((r: any) =>
    r.user === userId || (r.user && r.user._id === userId) || (r.user && r.user.id === userId)
  ) : null;

  const hasReviewed = !!userExistingReview;

  const handleEditReviewClick = (review: any) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);

    // Smoothly scroll down to the review form
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteReviewClick = async (reviewId: string) => {
    // Await the user's choice from the SweetAlert dialog
    const isConfirmed = await showConfirmAlert(
      'Delete Review?',
      'Are you sure you want to delete your review? This action cannot be undone.',
      'Yes, Delete'
    );

    // If they clicked "Yes, Delete", fire the dispatch!
    if (isConfirmed) {
      dispatch(deleteReview(product._id, reviewId));

      // Safely close the edit form if they happen to be editing the review they just deleted
      if (editingReviewId === reviewId) {
        setEditingReviewId(null);
        setRating(0);
        setComment('');
      }
    }
  };

  return (
    <main className={styles['product-page']}>
      <div className={`container ${styles['product-page__container']}`}>

        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles['breadcrumb__link']}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Shop
          </Link>
          <span className={styles['breadcrumb__divider']}>/</span>
          {/* Display category name fallback if productCategory isn't populated */}
          <span className={styles['breadcrumb__current']}>{product.category?.name || product.productCategory?.name || 'Product'}</span>
        </nav>

        <div className={styles['product-layout']}>
          <section className={styles['product-gallery']}>
            <figure className={styles['product-gallery__main-wrapper']}>
              <img src={mainImage || 'https://via.placeholder.com/600x750?text=No+Image'} alt={product.productName} className={styles['product-gallery__main-img']} />
            </figure>

            {displayImages && displayImages.length > 1 && (
              <div className={styles['product-gallery__thumbnails']}>
                {displayImages.map((img: any, idx: number) => (
                  <button key={idx} className={`${styles['product-gallery__thumb-btn']} ${mainImage === img.url ? styles['product-gallery__thumb-btn--active'] : ''}`} onClick={() => setMainImage(img.url)}>
                    <img src={img.url} alt={`${selectedColor} view`} className={styles['product-gallery__thumb-img']} />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles['product-meta']}>
            <div className={styles['product-meta__header']}>
              <span className={styles['product-meta__brand']}>{product.brand?.name || 'Exclusive Brand'}</span>
              <h1 className={styles['product-meta__title']}>{product.productName}</h1>

              <div className={styles['product-meta__price-row']}>
                <span className={styles['product-meta__price']}>
                  ₹{currentVariant ? getVariantPrice(currentVariant) : '---'}
                </span>
                <div className={styles['product-meta__rating']}>
                  <Rating value={product.rating} />
                  <span className={styles['product-meta__review-count']}>({product.numReviews})</span>
                </div>
              </div>
            </div>

            <p className={styles['product-meta__material']}>
              <span className={styles['product-meta__label']}>Material:</span> {product.material}
            </p>
            <hr className={styles.divider} />

            <div className={styles['variant-section']}>
              <div className={styles['variant-section__header']}>
                <span className={styles['variant-section__title']}>Color</span>
                <span className={styles['variant-section__selected-value']}>{selectedColor}</span>
              </div>
              <div className={styles['variant-list']}>
                {uniqueColors.map((color) => (
                  <button key={color} className={`${styles['variant-swatch']} ${selectedColor === color ? styles['variant-swatch--active'] : ''}`} onClick={() => setSelectedColor(color)} title={color}>
                    <span className={styles['variant-swatch__inner']} style={{ backgroundColor: color.toLowerCase() === 'white' ? '#f8f9fa' : color.toLowerCase(), boxShadow: color.toLowerCase() === 'white' ? 'inset 0 2px 4px rgba(0,0,0,0.06)' : 'none' }}></span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles['variant-section']}>
              <div className={styles['variant-section__header']}>
                <span className={styles['variant-section__title']}>Size</span>
                <span className={styles['variant-section__selected-value']}>{selectedSize}</span>
              </div>
              <div className={styles['variant-list']}>
                {uniqueSizes.map((size) => {
                  const isAvailable = isSizeAvailableForColor(size);
                  return (
                    <button key={size} className={`${styles['variant-size']} ${selectedSize === size ? styles['variant-size--active'] : ''}`} disabled={!isAvailable} onClick={() => setSelectedSize(size)}>
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles['product-actions']}>
              <div className={styles['product-actions__status']}>
                {currentVariant && currentVariant.stock > 0 ? (
                  <span className={`${styles['status-text']} ${styles['status-text--success']}`}>Available in Stock</span>
                ) : (
                  <span className={`${styles['status-text']} ${styles['status-text--error']}`}>Out of Stock</span>
                )}
              </div>

              {currentVariant && currentVariant.stock > 0 ? (
                <div className={styles['product-actions__cart-row']}>
                  <div className={styles['custom-select-wrapper']}>
                    <select value={qty} onChange={(e) => setQty(Number(e.target.value))} className={styles['custom-select']}>
                      {[...Array(Math.min(currentVariant.stock, 10)).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>{x + 1}</option>
                      ))}
                    </select>
                    <svg className={styles['custom-select-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>

                  <button
                    className={`btn ${addedToCart ? 'btn--success' : 'btn--primary'} btn--full ${styles['product-actions__add-btn']}`}
                    onClick={addToCartHandler}
                    disabled={addedToCart}
                    style={{ transition: 'all 0.3s ease', backgroundColor: addedToCart ? '#10b981' : '' }}
                  >
                    {addedToCart ? 'Added to Cart! ✅' : 'Add to Cart'}
                  </button>

                </div>
              ) : (
                <button className={`btn btn--primary btn--full ${styles['product-actions__add-btn']}`} disabled>
                  Currently Unavailable
                </button>
              )}

              <p className={styles['product-meta__secure-text']}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Secure checkout & easy returns
              </p>
            </div>
          </section>
        </div>

        {/* --- PRODUCT REVIEWS SECTION --- */}
        <section className={styles['reviews-section']} id="review-form">
          <header className={styles['reviews-section__header']}>
            <h2 className={styles['reviews-section__title']}>Customer Reviews</h2>
          </header>

          <div className={styles['reviews-layout']}>
            <div className={styles['reviews-list-container']}>
              {sortedReviews.length === 0 && (
                <div className={`${styles['state-container']} ${styles['state-container--empty']} p-4`}>
                  <p className={styles['state-message']}>No reviews yet. Be the first to review this product!</p>
                </div>
              )}

              <ul className={styles['review-list']}>
                {sortedReviews.map((review: any) => {
                  const isOwner = userId && (
                    review.user === userId ||
                    review.user?._id === userId ||
                    review.user?.id === userId
                  );

                  return (
                    <li key={review._id} className={styles['review-card']}>
                      <div className={styles['review-card__header']}>

                        <div className={styles['review-card__author-group']}>
                          <div className={styles['review-card__avatar']}>
                            {review.name ? review.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className={styles['review-card__author-info']}>
                            <div className={styles['review-card__name-row']}>
                              <strong className={styles['review-card__name']}>{review.name}</strong>
                              {review.isVerifiedPurchase && (
                                <span className={styles['verified-badge']}>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className={styles['review-card__rating']}><Rating value={review.rating} /></div>
                          </div>
                        </div>

                        <div className={styles['review-card__meta']}>
                          <span className={styles['review-card__date']}>
                            {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          {review.isEdited && <span className={styles['review-card__edited']}>(Edited)</span>}

                          {/* --- UPGRADED: EDIT BUTTON --- */}
                          {/* --- UPGRADED: EDIT & DELETE BUTTONS --- */}
                          {isOwner && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', marginTop: '4px' }}>

                              {/* EDIT BUTTON */}
                              <button
                                onClick={() => handleEditReviewClick(review)}
                                className={styles['review-card__edit-btn']}
                                aria-label="Edit Review"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                                Edit
                              </button>

                              {/* DELETE BUTTON */}
                              <button
                                onClick={() => handleDeleteReviewClick(review._id)}
                                className={styles['review-card__delete-btn']}
                                disabled={loadingDeleteReview}
                                aria-label="Delete Review"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                {loadingDeleteReview ? '...' : 'Delete'}
                              </button>

                            </div>
                          )}
                        </div>
                      </div>

                      <p className={styles['review-card__comment']}>{review.comment}</p>

                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className={styles['review-form-container']}>
              {/* --- UPGRADED: DYNAMIC EDITING STYLES --- */}
              <div className={`${styles['review-form-card']} ${editingReviewId ? styles['review-form-card--editing'] : ''}`}>
                <div className={styles['review-form-header']}>
                  <h3 className={styles['review-form-card__title']}>{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h3>
                  {editingReviewId && <span className={styles['editing-badge']}>Editing</span>}
                </div>

                {!userInfo ? (
                  <p className={styles['state-message']} style={{ textAlign: 'left', padding: 0 }}>Please <Link to="/login" style={{ color: 'var(--color-primary-600)', fontWeight: 'bold' }}>sign in</Link> to write a review.</p>
                ) : !hasPurchased ? (
                  <div className={styles['empty-state-box']}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    <p>Only verified buyers can review this item.</p>
                  </div>
                ) : hasReviewed && !editingReviewId ? (
                  <div className={styles['success-state-box']}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    <h4>Review Submitted</h4>
                    <p>You have already given your review for this product.</p>
                  </div>
                ) : (
                  <form onSubmit={submitReviewHandler} className={styles['review-form']}>
                    {errorCreateReview && <div className={`${styles['state-container']} ${styles['state-container--error']} mb-3`}><p className={styles['state-message']}>{errorCreateReview}</p></div>}
                    {errorUpdateReview && <div className={`${styles['state-container']} ${styles['state-container--error']} mb-3`}><p className={styles['state-message']}>{errorUpdateReview}</p></div>}

                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Rating</label>
                      <div className={styles['interactive-rating']}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`${styles['interactive-rating__star']} ${star <= (hover || rating) ? styles['interactive-rating__star--active'] : ''}`} viewBox="0 0 24 24" onClick={() => setRating(star)} onMouseEnter={() => setHover(star)} onMouseLeave={() => setHover(0)}>
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                          </svg>
                        ))}
                      </div>
                    </div>

                    <div className={styles['form-group']}>
                      <label htmlFor="comment" className={styles['form-label']}>Review</label>
                      <textarea id="comment" rows={4} value={comment} onChange={(e) => setComment(e.target.value)} required className={styles['form-input']} placeholder="Tell us what you think..."></textarea>
                    </div>

                    {/* --- UPGRADED: ACTIONS LAYOUT --- */}
                    <div className={styles['review-form__actions']}>
                      <button disabled={loadingCreateReview || loadingUpdateReview} type="submit" className="btn btn--primary btn--full">
                        {loadingCreateReview || loadingUpdateReview ? 'Processing...' : (editingReviewId ? "Update Review" : "Submit Review")}
                      </button>

                      {editingReviewId && (
                        <button type="button" className="btn btn--secondary btn--full" onClick={() => { setEditingReviewId(null); setRating(0); setComment(''); }}>
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* --- HORIZONTAL SCROLL SIMILAR PRODUCTS SECTION --- */}
        {displaySimilarProducts.length > 0 && (
          <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>You Might Also Like</h2>

            {/* WRAPPER FOR SCROLL BUTTONS */}
            <div style={{ position: 'relative' }}>

              {/* LEFT SCROLL BUTTON */}
              <button
                onClick={(e) => { e.preventDefault(); handleScroll('left'); }}
                style={{
                  position: 'absolute', left: '0px', top: 'calc(50% - 20px)', zIndex: 10,
                  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff',
                  border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
                aria-label="Scroll left"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
              </button>

              {/* THE SCROLLABLE CONTAINER */}
              <div
                ref={scrollRef}
                style={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '1.5rem',
                  paddingBottom: '1.5rem',
                  scrollSnapType: 'x mandatory',
                  scrollbarWidth: 'none', /* Hide scrollbar for cleaner look with buttons */
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {displaySimilarProducts.map((p: any) => (
                  <Link to={`/product/${p.originalId || p._id}${p.displayColor ? `?color=${p.displayColor}` : ''}`} key={p._id}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      flex: '0 0 220px',
                      scrollSnapAlign: 'start'
                    }}>
                    <div style={{ borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s', backgroundColor: '#fff', border: '1px solid #f3f4f6', height: '100%' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ aspectRatio: '4/5', backgroundColor: '#f3f4f6', position: 'relative' }}>
                        <img
                          src={p.images?.length > 0 ? p.images[0].url : 'https://via.placeholder.com/400x500?text=No+Image'}
                          alt={p.productName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                        />
                        {p.displayColor && (
                          <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#111827', color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '4px', zIndex: 2 }}>
                            {p.displayColor}
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                          {p.brand?.name || 'Exclusive'}
                        </div>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.productName}
                        </h3>
                        <div style={{ fontWeight: 'bold', color: '#111827' }}>
                          {(() => {
                            if (!p.variants || p.variants.length === 0) return '₹0.00';
                            const mrps = p.variants.map((v: any) => {
                              const pr = Number(v.salesPrice) || 0;
                              const tx = Number(v.salesTax) || 0;
                              return pr + (pr * (tx / 100));
                            });
                            return `From ₹${Math.min(...mrps).toFixed(2)}`;
                          })()}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* RIGHT SCROLL BUTTON */}
              <button
                onClick={(e) => { e.preventDefault(); handleScroll('right'); }}
                style={{
                  position: 'absolute', right: '0px', top: 'calc(50% - 20px)', zIndex: 10,
                  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff',
                  border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}
                aria-label="Scroll right"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </button>

            </div>
          </section>
        )}

      </div>
    </main>
  );
};

export default ProductDetailsPage;