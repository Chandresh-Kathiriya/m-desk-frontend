import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { removeFromCart, fetchUserCart, updateCartQty } from '../../../store/actions/user/cartActions';
import { RootState } from '../../../store/reducers';

// Import CSS Module
import styles from '../../../schemas/css/CartPage.module.css';

const CartPage: React.FC = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const cart = useSelector((state: RootState) => state.cart || {});
  const { cartItems = [], loading, error } = cart as any;

  const userAuth = useSelector((state: RootState) => state.userAuth || {});
  const { userInfo } = userAuth as any;

  useEffect(() => {
    if (userInfo && userInfo.token) {
      dispatch(fetchUserCart());
    }
  }, [dispatch, userInfo]);

  const removeFromCartHandler = (sku: string) => {
    if (window.confirm('Remove this item from your cart?')) {
      dispatch(removeFromCart(sku));
    }
  };

  const handleQtyChange = (item: any, newQty: number) => {
    if (newQty < 1) {
      removeFromCartHandler(item.sku);
    } else if (newQty > item.maxStock) {
      alert(`Sorry, we only have ${item.maxStock} of these left in stock!`);
    } else {
      dispatch(updateCartQty(item.sku, newQty));
    }
  };

  const checkoutHandler = () => {
    navigate('/checkout');
  };

  // Math Helpers
  const FREE_SHIPPING_THRESHOLD = 1000;
  const SHIPPING_COST = 50;

  const totalItems = cartItems.reduce((acc: number, item: any) => acc + item.qty, 0);
  const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.qty * item.price, 0);

  const shippingPrice = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const amountNeededForFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;
  const orderTotal = subtotal + shippingPrice;

  // Calculate percentage for progress bar (capped at 100%)
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  return (
    <main className={styles['cart-page']}>
      {/* Assuming 'container' is handled globally. If not, use styles.container */}
      <div className="container">
        <header className={styles['cart-page__header']}>
          <h1 className={styles['cart-page__title']}>Shopping Cart</h1>
          {cartItems.length > 0 && (
            <span className={styles['cart-page__count']}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
          )}
        </header>

        {loading ? (
          <div className={styles['state-container']}>
            <div className={styles.spinner} aria-label="Loading cart..."></div>
          </div>
        ) : error ? (
          <div className={`${styles['state-container']} ${styles['state-container--error']}`}>
            <p className={styles['state-message']}>{error}</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className={`${styles['state-container']} ${styles['state-container--empty']} ${styles['cart-empty']}`}>
            <svg className={styles['cart-empty__icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2 className={styles['cart-empty__title']}>Your cart is empty</h2>
            <p className={styles['cart-empty__text']}>Looks like you haven't added anything yet.</p>
            <Link to="/" className={`${styles.btn} ${styles['btn--primary']} ${styles['cart-empty__btn']}`}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className={styles['cart-layout']}>

            {/* LEFT COLUMN: Cart Items List */}
            <section className={styles['cart-items']}>
              {cartItems.map((item: any) => (
                <article key={item.sku} className={styles['cart-item']}>

                  <div className={styles['cart-item__image-wrapper']}>
                    <img
                      src={item.image || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className={styles['cart-item__image']}
                    />
                  </div>

                  <div className={styles['cart-item__details']}>
                    <div className={styles['cart-item__header']}>
                      <Link to={`/product/${item.product}`} className={styles['cart-item__title-link']}>
                        <h3 className={styles['cart-item__title']}>{item.name}</h3>
                      </Link>
                      <button
                        className={styles['cart-item__remove']}
                        onClick={() => removeFromCartHandler(item.sku)}
                        aria-label="Remove item"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>

                    <div className={styles['cart-item__variants']}>
                      <span className={styles['cart-item__variant-label']}>Color: <strong className={styles['cart-item__variant-value']}>{item.color}</strong></span>
                      <span className={styles['cart-item__variant-divider']}>|</span>
                      <span className={styles['cart-item__variant-label']}>Size: <strong className={styles['cart-item__variant-value']}>{item.size}</strong></span>
                    </div>

                    <div className={styles['cart-item__delivery']}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                        <rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle>
                      </svg>
                      Est. Delivery: {getEstimatedDelivery()}
                    </div>

                    <div className={styles['cart-item__actions']}>
                      <div className={styles['qty-control']}>
                        <button
                          className={styles['qty-control__btn']}
                          onClick={() => handleQtyChange(item, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <span className={styles['qty-control__value']}>{item.qty}</span>
                        <button
                          className={styles['qty-control__btn']}
                          onClick={() => handleQtyChange(item, item.qty + 1)}
                          disabled={item.qty >= item.maxStock}
                          aria-label="Increase quantity"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                      </div>

                      <div className={styles['cart-item__price']}>
                        ₹{item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                </article>
              ))}
            </section>

            {/* RIGHT COLUMN: Order Summary */}
            <aside className={styles['cart-sidebar']}>
              <div className={styles['summary-card']}>
                <h2 className={styles['summary-card__title']}>Order Summary</h2>

                {/* Upsell Progress Bar */}
                <div className={styles['summary-card__upsell']}>
                  {subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? (
                    <>
                      <p className={styles['summary-card__upsell-text']}>
                        Add <strong className={styles['summary-card__upsell-amount']}>₹{amountNeededForFreeShipping.toFixed(2)}</strong> more to get FREE shipping!
                      </p>
                      <div className={styles['progress-bar']}>
                        <div className={styles['progress-bar__fill']} style={{ width: `${freeShippingProgress}%` }}></div>
                      </div>
                    </>
                  ) : subtotal >= FREE_SHIPPING_THRESHOLD ? (
                    <div className={styles['summary-card__success']}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      You've unlocked FREE shipping!
                    </div>
                  ) : null}
                </div>

                <div className={styles['summary-card__details']}>
                  <div className={styles['summary-card__row']}>
                    <span className={styles['summary-card__label']}>Total Items</span>
                    <span className={styles['summary-card__value']}>{totalItems}</span>
                  </div>
                  <div className={styles['summary-card__row']}>
                    <span className={styles['summary-card__label']}>Subtotal</span>
                    <span className={styles['summary-card__value']}>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles['summary-card__row']}>
                    <span className={styles['summary-card__label']}>Shipping</span>
                    <span className={styles['summary-card__value']}>
                      {shippingPrice === 0 ? <span className={styles['summary-card__value--free']}>Free</span> : `₹${shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className={styles['summary-card__total-row']}>
                  <span className={styles['summary-card__total-label']}>Total</span>
                  <span className={styles['summary-card__total-value']}>₹{orderTotal.toFixed(2)}</span>
                </div>

                {/* Combines local summary button class with module button base classes */}
                <button
                  className={`btn btn--primary btn--full ${styles['summary-card__btn']}`}
                  onClick={checkoutHandler}
                  disabled={cartItems.length === 0}
                >
                  Proceed to Checkout
                </button>

                <div className={styles['summary-card__secure-badge']}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Secure Checkout
                </div>

              </div>
            </aside>

          </div>
        )}
      </div>
    </main>
  );
};

export default CartPage;