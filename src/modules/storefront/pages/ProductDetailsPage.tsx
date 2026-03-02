import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getStorefrontProductDetails, listSimilarProducts } from '../../../store/actions/storefront/productActions';
import { addToCart } from '../../../store/actions/user/cartActions';
import { listMyOrders } from '../../../store/actions/user/orderActions';
import { createReview, updateReview, voteReview, reportReview } from '../../../store/actions/storefront/reviewActions';
import { REVIEW_CREATE_RESET, REVIEW_UPDATE_RESET, REVIEW_VOTE_RESET, REVIEW_REPORT_RESET } from '../../../store/constants/storefront/reviewConstants';
import { STOREFRONT_SIMILAR_PRODUCTS_RESET } from '../../../store/constants/storefront/productConstants';
import { RootState } from '../../../store/reducers';
import Rating from '../../../common/components/Rating';

// Import CSS Module
import styles from '../../../schemas/css/ProductDetailsPage.module.css';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();
  const location = useLocation();

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

  // 2. Fetch Similar Products once category is known
  useEffect(() => {
    if (product?.productCategory?._id && product?._id) {
      dispatch(listSimilarProducts(product.productCategory._id, product._id));
    }
  }, [dispatch, product]);

  // Reviews logic
  useEffect(() => {
    if (successCreateReview) {
      alert('Review submitted successfully!');
      setRating(0);
      setComment('');
      dispatch({ type: REVIEW_CREATE_RESET });
      if (id) dispatch(getStorefrontProductDetails(id));
    }
    if (successUpdateReview) {
      alert('Review updated successfully!');
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
      alert('Review reported to administrators.');
      dispatch({ type: REVIEW_REPORT_RESET });
    }
    if (errorVote) alert(errorVote);
    if (errorReport) alert(errorReport);
  }, [dispatch, id, successCreateReview, successUpdateReview, successVote, successReport, errorVote, errorReport]);

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

  if (loading) return <div className={styles['state-container']}><div className={styles.spinner}></div></div>;
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
      dispatch(addToCart(product, currentVariant, qty));
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 2500);
    }
  };

  const submitReviewHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReviewId) dispatch(updateReview(product._id, editingReviewId, { rating, comment }));
    else dispatch(createReview(product._id, { rating, comment }));
  };

  const handleVote = (reviewId: string, voteType: 'helpful' | 'unhelpful') => {
    if (!userInfo) return alert("Please log in to vote.");
    dispatch(voteReview(product._id, reviewId, voteType));
  };

  const handleReport = (reviewId: string) => {
    if (!userInfo) return alert("Please log in to report.");
    if (window.confirm("Are you sure you want to report this review for abuse?")) {
      dispatch(reportReview(product._id, reviewId));
    }
  };

  const handleEditClick = (review: any) => {
    setEditingReviewId(review._id);
    setRating(review.rating);
    setComment(review.comment);
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const sortedReviews = product?.reviews ? [...product.reviews].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : [];

  return (
    <main className={styles['product-page']}>
      <div className={`container ${styles['product-page__container']}`}>

        <nav className={styles.breadcrumb}>
          <Link to="/" className={styles['breadcrumb__link']}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Shop
          </Link>
          <span className={styles['breadcrumb__divider']}>/</span>
          <span className={styles['breadcrumb__current']}>{product.productCategory?.name}</span>
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
                  const isOwner = userInfo && (userInfo._id === review.user || userInfo.id === review.user);
                  return (
                    <li key={review._id} className={styles['review-card']}>
                      <div className={styles['review-card__header']}>
                        <div className={styles['review-card__author']}>
                          <strong className={styles['review-card__name']}>{review.name}</strong>
                          {review.isVerifiedPurchase && (
                            <span className={styles['verified-badge']}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className={styles['review-card__meta']}>
                          <span className={styles['review-card__date']}>{new Date(review.createdAt).toLocaleDateString()}</span>
                          {review.isEdited && <span className={styles['review-card__edited']}>(Edited)</span>}
                        </div>
                      </div>

                      <div className={styles['review-card__rating']}><Rating value={review.rating} /></div>
                      <p className={styles['review-card__comment']}>{review.comment}</p>

                      <div className={styles['review-card__actions']}>
                        <button className={`${styles['review-btn']} ${styles['review-btn--vote']}`} onClick={() => handleVote(review._id, 'helpful')} disabled={isOwner || loadingVoteId === review._id}>
                          Helpful ({review.helpfulVotes || 0})
                        </button>
                        <span className={styles['review-card__actions-divider']}>·</span>
                        <button className={`${styles['review-btn']} ${styles['review-btn--text']}`} onClick={() => handleReport(review._id)} disabled={isOwner || loadingReportId === review._id}>Report</button>
                        {isOwner && (
                          <button className={`${styles['review-btn']} ${styles['review-btn--text']} ${styles['review-btn--edit']}`} onClick={() => handleEditClick(review)}>Edit</button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <aside className={styles['review-form-container']}>
              <div className={styles['review-form-card']}>
                <h3 className={styles['review-form-card__title']}>{editingReviewId ? 'Edit Your Review' : 'Write a Review'}</h3>
                {!userInfo ? (
                  <p className="text-muted text-sm">Please <Link to="/login" className="text-primary fw-bold">sign in</Link> to write a review.</p>
                ) : !hasPurchased ? (
                  <p className="text-muted text-sm">Only verified buyers can review this item.</p>
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
                      <textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} required className={styles['form-input']}></textarea>
                    </div>

                    <div className={styles['review-form__actions']}>
                      <button disabled={loadingCreateReview || loadingUpdateReview} type="submit" className={`${styles.btn} ${styles['btn--primary']} ${styles['btn--full']}`}>
                        {loadingCreateReview || loadingUpdateReview ? 'Processing...' : (editingReviewId ? "Update" : "Submit")}
                      </button>
                      {editingReviewId && (
                        <button type="button" className={`${styles.btn} ${styles['btn--secondary']} ${styles['btn--full']} mt-2`} onClick={() => { setEditingReviewId(null); setRating(0); setComment(''); }}>Cancel</button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* --- SIMILAR PRODUCTS SECTION --- */}
        {similarProducts.length > 0 && (
          <section style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '1.5rem', color: '#111827' }}>You Might Also Like</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {similarProducts.map((p: any) => (
                <Link to={`/product/${p._id}`} key={p._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s', backgroundColor: '#fff', border: '1px solid #f3f4f6' }} 
                       onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
                       onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ aspectRatio: '4/5', backgroundColor: '#f3f4f6', position: 'relative' }}>
                      <img 
                        src={p.images?.length > 0 ? p.images[0].url : 'https://via.placeholder.com/400x500?text=No+Image'} 
                        alt={p.productName} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
                      />
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {p.brand?.name || 'Exclusive'}
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {p.productName}
                      </h3>
                      <div style={{ fontWeight: 'bold', color: '#111827' }}>
                        {/* Calculate the minimum price to display "From ₹X" */}
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
          </section>
        )}

      </div>
    </main>
  );
};

export default ProductDetailsPage;