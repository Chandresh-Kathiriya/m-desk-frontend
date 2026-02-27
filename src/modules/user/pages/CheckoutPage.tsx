import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import CheckoutForm from '../../../common/components/CheckoutForm';
import { saveShippingAddress } from '../../../store/actions/user/cartActions';
import { validateCoupon } from '../../../store/actions/user/couponActions';
// --- NEW IMPORTS ---
import { createStripeIntent } from '../../../store/actions/user/orderActions';
import { STRIPE_INTENT_RESET } from '../../../store/constants/user/orderConstants';
import { RootState } from '../../../store/reducers';

import styles from '../../../schemas/css/CheckoutPage.module.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch<any>();

    // --- REDUX DATA ---
    const cart = useSelector((state: RootState) => state.cart || {});
    const { cartItems, shippingAddress } = cart as any;

    const userAuth = useSelector((state: RootState) => state.userAuth || {});
    const { userInfo } = userAuth as any;

    // --- NEW: Grab Stripe Intent from Redux ---
    const stripeIntent = useSelector((state: RootState) => state.stripeIntent || {} as any);
    const { loading: intentLoading, success: intentSuccess, clientSecret, error: intentError } = stripeIntent;

    const couponValidate = useSelector((state: RootState) => state.couponValidate || {});
    const { loading: couponLoading, success: successCoupon, couponInfo, error: errorCoupon } = couponValidate as any;

    // --- LOCAL STATE ---
    const [address, setAddress] = useState<string>(shippingAddress?.address || '');
    const [city, setCity] = useState<string>(shippingAddress?.city || '');
    const [postalCode, setPostalCode] = useState<string>(shippingAddress?.postalCode || '');
    const [country, setCountry] = useState<string>(shippingAddress?.country || '');

    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [discountAmount, setDiscountAmount] = useState<number>(0);
    const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // This holds the exact details of the cart so we can send it to the DB *after* payment
    const [pendingOrderData, setPendingOrderData] = useState<any>(null);

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    // Listen for Intent Errors
    useEffect(() => {
        if (intentError) {
            alert(`Payment Gateway Error: ${intentError}`);
            dispatch({ type: STRIPE_INTENT_RESET });
        }
    }, [intentError, dispatch]);

    useEffect(() => {
        if (successCoupon && couponInfo) {
            setDiscountAmount(couponInfo.calculatedDiscount);
            setAppliedCoupon(couponInfo);
            setCouponMessage({ type: 'success', text: `Success! ${couponInfo.code} applied.` });
        }
        if (errorCoupon) {
            setDiscountAmount(0);
            setAppliedCoupon(null);
            setCouponMessage({ type: 'error', text: errorCoupon });
        }
    }, [successCoupon, couponInfo, errorCoupon]);

    // --- MATH CALCS ---
    const FREE_SHIPPING_THRESHOLD = 1000;
    const SHIPPING_COST = 50;
    const subtotal = cartItems.reduce((acc: number, item: any) => acc + item.price * item.qty, 0);
    const afterDiscountTotal = subtotal - discountAmount;
    const shippingPrice = afterDiscountTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const totalPrice = afterDiscountTotal + shippingPrice;

    const applyCouponHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponCode) return;
        setCouponMessage(null);
        dispatch(validateCoupon(couponCode, cartItems));
    };

    const removeCouponHandler = () => {
        setCouponCode('');
        setDiscountAmount(0);
        setAppliedCoupon(null);
        setCouponMessage(null);
    };

    // --- NEW: Handle Proceed to Payment (No order created!) ---
    const confirmShippingHandler = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedAddress = { address, city, postalCode, country };
        dispatch(saveShippingAddress(updatedAddress));

        // Package up what the order WILL look like
        const orderData = {
            orderItems: cartItems,
            shippingAddress: updatedAddress,
            paymentMethod: 'Stripe',
            itemsPrice: subtotal,
            shippingPrice,
            totalPrice,
        };

        setPendingOrderData(orderData); // Save locally for the Checkout Form

        // Dispatch to Redux to safely get the Stripe Secret
        dispatch(createStripeIntent(totalPrice));
    };

    // Allow user to go back and edit shipping
    const handleEditShipping = () => {
        dispatch({ type: STRIPE_INTENT_RESET });
        setPendingOrderData(null);
    }

    return (
        <main className={styles['checkout-page']}>
            <div className={styles['checkout-page__container']}>
                <header className={styles['checkout-header']}>
                    <Link to="/" className={styles['checkout-header__brand']}>Storefront</Link>
                    <nav className={styles['checkout-breadcrumbs']}>
                        <Link to="/cart" className={styles['checkout-breadcrumbs__link']}>Cart</Link>
                        <svg className={styles['checkout-breadcrumbs__icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        <span className={`${styles['checkout-breadcrumbs__current']} ${!intentSuccess ? styles['checkout-breadcrumbs__current--active'] : ''}`}>Shipping</span>
                        <svg className={styles['checkout-breadcrumbs__icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        <span className={`${styles['checkout-breadcrumbs__current']} ${intentSuccess ? styles['checkout-breadcrumbs__current--active'] : ''}`}>Payment</span>
                    </nav>
                </header>

                <div className={styles['checkout-layout']}>
                    <section className={styles['checkout-main']}>
                        {intentSuccess && clientSecret ? (
                            <div className={`${styles['checkout-step']} ${styles['animate-fade-in']}`}>
                                <div className={styles['checkout-summary-box']}>
                                    <div className={styles['checkout-summary-box__row']}>
                                        <span className={styles['checkout-summary-box__label']}>Contact</span>
                                        <span className={styles['checkout-summary-box__value']}>{userInfo?.user?.email || 'Guest'}</span>
                                    </div>
                                    <div className={styles['checkout-summary-box__divider']}></div>
                                    <div className={styles['checkout-summary-box__row']}>
                                        <span className={styles['checkout-summary-box__label']}>Ship to</span>
                                        <span className={styles['checkout-summary-box__value']}>{address}, {city}, {postalCode}, {country}</span>
                                        <button type="button" className={styles['checkout-summary-box__edit']} onClick={handleEditShipping}>Change</button>
                                    </div>
                                </div>

                                <h2 className={styles['checkout-step__title']}>Payment</h2>
                                <p className={styles['checkout-step__subtitle']}>All transactions are secure and encrypted.</p>

                                <div className={styles['checkout-stripe-container']}>
                                    {/* Pass the pending order down to the form component! */}
                                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                                        <CheckoutForm pendingOrderData={pendingOrderData} />
                                    </Elements>
                                </div>
                            </div>
                        ) : (
                            <div className={`${styles['checkout-step']} ${styles['animate-fade-in']}`}>
                                <h2 className={styles['checkout-step__title']}>Shipping address</h2>
                                <form onSubmit={confirmShippingHandler} className={styles['checkout-form']}>
                                    <div className={`${styles['form-group']} ${styles['form-group--full']}`}>
                                        <label htmlFor="country" className={styles['form-label']}>Country/Region</label>
                                        <input id="country" type="text" className={styles['form-input']} placeholder="e.g. India" value={country} required onChange={(e) => setCountry(e.target.value)} />
                                    </div>
                                    <div className={`${styles['form-group']} ${styles['form-group--full']}`}>
                                        <label htmlFor="address" className={styles['form-label']}>Address</label>
                                        <input id="address" type="text" className={styles['form-input']} placeholder="House number and street name" value={address} required onChange={(e) => setAddress(e.target.value)} />
                                    </div>
                                    <div className={styles['form-row']}>
                                        <div className={styles['form-group']}>
                                            <label htmlFor="city" className={styles['form-label']}>City</label>
                                            <input id="city" type="text" className={styles['form-input']} placeholder="e.g. Mumbai" value={city} required onChange={(e) => setCity(e.target.value)} />
                                        </div>
                                        <div className={styles['form-group']}>
                                            <label htmlFor="postalCode" className={styles['form-label']}>Postal code</label>
                                            <input id="postalCode" type="text" className={styles['form-input']} placeholder="e.g. 400001" value={postalCode} required onChange={(e) => setPostalCode(e.target.value)} />
                                        </div>
                                    </div>

                                    <div className={styles['checkout-form__actions']}>
                                        <Link to="/cart" className={styles['checkout-form__back']}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>
                                            Return to cart
                                        </Link>
                                        <button type="submit" className={`${styles.btn} ${styles['btn--primary']} ${styles['checkout-form__submit']}`} disabled={intentLoading}>
                                            {intentLoading ? <span className={`${styles.spinner} ${styles['spinner--small']}`}></span> : "Continue to payment"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </section>

                    {/* RIGHT COLUMN: Sidebar Summary (Kept unchanged for brevity) */}
                    <aside className={styles['checkout-sidebar']}>
                        <div className={styles['checkout-sidebar__inner']}>
                            <div className={styles['checkout-sidebar__items']}>
                                {cartItems.map((item: any) => (
                                    <div key={item.sku} className={styles['checkout-item']}>
                                        <div className={styles['checkout-item__image-wrapper']}>
                                            <img src={item.image || 'https://via.placeholder.com/64'} alt={item.name} className={styles['checkout-item__image']} />
                                            <span className={styles['checkout-item__qty']}>{item.qty}</span>
                                        </div>
                                        <div className={styles['checkout-item__info']}>
                                            <span className={styles['checkout-item__name']}>{item.name}</span>
                                            <span className={styles['checkout-item__variant']}>{item.color} / {item.size}</span>
                                        </div>
                                        <span className={styles['checkout-item__price']}>₹{(item.price * item.qty).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <hr className={styles['checkout-divider']} />

                            {/* Promo Code Input */}
                            {!intentSuccess && (
                                <div className={styles['checkout-promo']}>
                                    <form onSubmit={applyCouponHandler} className={styles['checkout-promo__form']}>
                                        <input type="text" className={`${styles['form-input']} ${styles['checkout-promo__input']}`} placeholder="Discount code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} disabled={appliedCoupon !== null} />
                                        {appliedCoupon ? (
                                            <button type="button" className={`${styles.btn} ${styles['btn--secondary']} ${styles['checkout-promo__btn']}`} onClick={removeCouponHandler}>Remove</button>
                                        ) : (
                                            <button type="submit" className={`${styles.btn} ${styles['btn--secondary']} ${styles['checkout-promo__btn']}`} disabled={couponLoading || !couponCode}>
                                                {couponLoading ? <span className={`${styles.spinner} ${styles['spinner--small']}`}></span> : "Apply"}
                                            </button>
                                        )}
                                    </form>
                                    {couponMessage && (
                                        <div className={`${styles['checkout-promo__message']} ${styles[`checkout-promo__message--${couponMessage.type}`]}`}>
                                            {couponMessage.text}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Totals */}
                            <div className={styles['checkout-totals']}>
                                <div className={styles['checkout-totals__row']}>
                                    <span className={styles['checkout-totals__label']}>Subtotal</span>
                                    <span className={styles['checkout-totals__value']}>₹{subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className={`${styles['checkout-totals__row']} ${styles['checkout-totals__row--discount']}`}>
                                        <span className={styles['checkout-totals__label']}>Discount <span className={styles['checkout-totals__tag']}>({appliedCoupon?.code})</span></span>
                                        <span className={styles['checkout-totals__value']}>- ₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className={styles['checkout-totals__row']}>
                                    <span className={styles['checkout-totals__label']}>Shipping</span>
                                    <span className={styles['checkout-totals__value']}>{shippingPrice === 0 ? 'Free' : `₹${shippingPrice.toFixed(2)}`}</span>
                                </div>
                                <div className={`${styles['checkout-totals__row']} ${styles['checkout-totals__row--grand']}`}>
                                    <span className={styles['checkout-totals__label']}>Total</span>
                                    <span className={styles['checkout-totals__value']}><span className={styles['checkout-totals__currency']}>INR</span> ₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    );
};

export default CheckoutPage;