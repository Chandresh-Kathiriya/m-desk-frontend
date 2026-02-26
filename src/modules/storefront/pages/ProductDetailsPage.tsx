import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button, Badge, Form, ListGroup } from 'react-bootstrap';
import { getStorefrontProductDetails } from '../../../store/actions/storefront/productActions';
import { addToCart } from '../../../store/actions/user/cartActions';
import { listMyOrders } from '../../../store/actions/user/orderActions';
import { createReview, updateReview, voteReview, reportReview } from '../../../store/actions/storefront/reviewActions';
import { REVIEW_CREATE_RESET, REVIEW_UPDATE_RESET, REVIEW_VOTE_RESET, REVIEW_REPORT_RESET } from '../../../store/constants/storefront/reviewConstants';
import { RootState } from '../../../store/reducers';
import Rating from '../../../common/components/Rating';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // Redux State
  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  const productDetails = useSelector((state: RootState) => state.storefrontProductDetails || {});
  const { loading, error, product } = productDetails as any;

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

  // Local UI State
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [mainImage, setMainImage] = useState<string>('');
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('latest');
  const [hasPurchased, setHasPurchased] = useState(false);
  const [qty, setQty] = useState<number>(1);

  // Fetch Product
  useEffect(() => {
    if (id) {
      dispatch(getStorefrontProductDetails(id));
    }
  }, [dispatch, id]);

  // Handle Review Successes to Refresh Data
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
    // Handle Errors gracefully
    if (errorVote) alert(errorVote);
    if (errorReport) alert(errorReport);
  }, [dispatch, id, successCreateReview, successUpdateReview, successVote, successReport, errorVote, errorReport]);

  // Fetch My Orders to verify purchase
  useEffect(() => {
    if (userInfo && userInfo.token && product?._id) {
      dispatch(listMyOrders());
    }
  }, [dispatch, userInfo, product]);

  // Evaluate Purchase History
  useEffect(() => {
    if (myOrders && myOrders.length > 0 && product?._id) {
      const boughtIt = myOrders.some((order: any) =>
        order.isPaid && order.orderItems.some((item: any) => item.product === product._id)
      );
      setHasPurchased(boughtIt);
    }
  }, [myOrders, product]);

  // Auto-select the first available variant when the product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
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

  const displayImages = filteredImages.length > 0 ? filteredImages : (product?.images || []);

  useEffect(() => {
    if (displayImages.length > 0) {
      const isMainImageValid = displayImages.some((img: any) => img.url === mainImage);
      if (!isMainImageValid) {
        setMainImage(displayImages[0].url);
      }
    }
  }, [selectedColor, product, mainImage, displayImages]);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Container className="mt-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!product || !product._id) return null;

  // --- SMART UI HELPERS ---
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
      navigate('/cart');
    }
  };

  const submitReviewHandler = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReviewId) {
      dispatch(updateReview(product._id, editingReviewId, { rating, comment }));
    } else {
      dispatch(createReview(product._id, { rating, comment }));
    }
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
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const sortedReviews = product?.reviews ? [...product.reviews].sort((a: any, b: any) => {
    if (sortBy === 'highest') return b.rating - a.rating;
    if (sortBy === 'helpful') return b.helpfulVotes - a.helpfulVotes;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); 
  }) : [];

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

          <div className="mb-3">
            <Rating value={product.rating} text={`${product.numReviews} reviews`} />
          </div>

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

          {/* Quantity & Add to Cart */}
          {currentVariant && currentVariant.stock > 0 ? (
            <Row className="mt-4 align-items-center">
              <Col xs={4} md={3}>
                <Form.Select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="py-3 fw-bold text-center"
                >
                  {[...Array(Math.min(currentVariant.stock, 10)).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col xs={8} md={9}>
                <Button
                  variant="dark"
                  size="lg"
                  className="w-100 py-3 fw-bold text-uppercase"
                  onClick={addToCartHandler}
                >
                  Add to Cart
                </Button>
              </Col>
            </Row>
          ) : (
            <Button
              variant="secondary"
              size="lg"
              className="w-100 py-3 mt-4 fw-bold text-uppercase"
              disabled
            >
              Currently Unavailable
            </Button>
          )}
        </Col>
      </Row>

      {/* --- PRODUCT REVIEWS SECTION --- */}
      <Row className="mt-5 g-5 border-top pt-5">
        <Col md={7}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0">Customer Reviews</h3>
            <Form.Select
              size="sm"
              style={{ width: '180px' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="shadow-sm border-0 bg-light"
            >
              <option value="latest">Sort by Latest</option>
              <option value="helpful">Sort by Most Helpful</option>
              <option value="highest">Sort by Highest Rating</option>
            </Form.Select>
          </div>

          {sortedReviews.length === 0 && (
            <div className="alert alert-info shadow-sm">No reviews yet. Be the first to review this product!</div>
          )}

          <ListGroup variant="flush">
            {sortedReviews.map((review: any) => {
              const isOwner = userInfo && (userInfo._id === review.user || userInfo.id === review.user);

              return (
                <ListGroup.Item key={review._id} className="px-0 py-4 bg-transparent border-bottom">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong className="fs-5 me-2">{review.name}</strong>
                      {review.isVerifiedPurchase && (
                        <Badge bg="success" className="bg-opacity-75 rounded-pill fw-normal shadow-sm">
                          <i className="bi bi-patch-check-fill me-1"></i>Verified Purchase
                        </Badge>
                      )}
                    </div>
                    <div className="text-end">
                      <span className="text-muted small d-block">{new Date(review.createdAt).toLocaleDateString()}</span>
                      {review.isEdited && <span className="text-muted small fst-italic">(Edited)</span>}
                    </div>
                  </div>

                  <Rating value={review.rating} />
                  <p className="mt-3 mb-3 text-secondary lh-lg">{review.comment}</p>

                  <div className="d-flex align-items-center small mt-2">
                    <span className="text-muted me-3">Was this helpful?</span>

                    <button
                      className="btn btn-sm btn-outline-success border-0 me-2"
                      onClick={() => handleVote(review._id, 'helpful')}
                      disabled={isOwner || loadingVoteId === review._id}
                    >
                      <i className="bi bi-hand-thumbs-up me-1"></i> {review.helpfulVotes || 0}
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger border-0 me-4"
                      onClick={() => handleVote(review._id, 'unhelpful')}
                      disabled={isOwner || loadingVoteId === review._id}
                    >
                      <i className="bi bi-hand-thumbs-down me-1"></i> {review.unhelpfulVotes || 0}
                    </button>

                    <span className="text-muted me-3">|</span>

                    <button
                      className="btn btn-sm btn-link text-muted text-decoration-none p-0 me-3"
                      onClick={() => handleReport(review._id)}
                      disabled={isOwner || loadingReportId === review._id}
                    >
                      <i className="bi bi-flag me-1"></i> Report
                    </button>

                    {isOwner && (
                      <button
                        className="btn btn-sm btn-link text-primary text-decoration-none p-0"
                        onClick={() => handleEditClick(review)}
                      >
                        <i className="bi bi-pencil-square me-1"></i> Edit
                      </button>
                    )}
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Col>

        {/* --- WRITE / EDIT REVIEW FORM --- */}
        {!userInfo && (
          <div className="alert alert-warning shadow-sm mb-0">
            Please <Link to="/login" className="fw-bold text-dark">sign in</Link> to write a review.
          </div>
        )}

        {userInfo && !hasPurchased && (
          <div className="alert alert-info shadow-sm mb-0">
            <i className="bi bi-lock-fill me-2"></i>
            Only verified buyers can review this item. Purchase this product to unlock reviews!
          </div>
        )}

        {userInfo && hasPurchased && (
          <Form onSubmit={submitReviewHandler}>
            {errorCreateReview && <Alert variant="danger">{errorCreateReview}</Alert>}
            {errorUpdateReview && <Alert variant="danger">{errorUpdateReview}</Alert>}
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-muted small text-uppercase d-block mb-2">
                Your Rating
              </Form.Label>
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`bi ${star <= (hover || rating) ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
                    style={{ fontSize: '1.8rem', cursor: 'pointer', marginRight: '8px', transition: 'color 0.2s' }}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                  ></i>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-4" controlId="comment">
              <Form.Label className="fw-bold text-muted small text-uppercase">Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                placeholder="What did you like or dislike about this product?"
                className="border-0 shadow-sm"
              ></Form.Control>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button disabled={loadingCreateReview || loadingUpdateReview} type="submit" variant="dark" className="w-100 py-2 fw-bold text-uppercase shadow-sm">
                {loadingCreateReview || loadingUpdateReview ? <Spinner animation="border" size="sm" /> : (editingReviewId ? "Update Review" : "Submit Review")}
              </Button>

              {editingReviewId && (
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="py-2 fw-bold"
                  onClick={() => { setEditingReviewId(null); setRating(0); setComment(''); }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        )}
      </Row>
    </Container>
  );
};

export default ProductDetailsPage;