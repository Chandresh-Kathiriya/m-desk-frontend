import React, { useState, useEffect } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { createOrder } from '../../store/actions/user/orderActions';
import { ORDER_CREATE_RESET, STRIPE_INTENT_RESET } from '../../store/constants/user/orderConstants';
import { RootState } from '../../store/reducers';
import styles from '../../schemas/css/CheckoutForm.module.css';

interface CheckoutFormProps {
    pendingOrderData: any; 
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ pendingOrderData }) => {
    const stripe = useStripe();
    const elements = useElements();
    const dispatch = useDispatch<any>();
    const navigate = useNavigate();

    // Listen to Redux for the final Order Creation success
    const orderCreate = useSelector((state: RootState) => state.orderCreate || {});
    const { loading: isCreatingOrder, success: successOrder, error: errorOrder } = orderCreate as any;

    const [message, setMessage] = useState<string | null>(null);
    const [isProcessingStripe, setIsProcessingStripe] = useState(false);

    // Watch for successful order creation to redirect
    useEffect(() => {
        console.log("🛠️ [CheckoutForm] Order State Changed:", { successOrder, errorOrder });

        if (successOrder) {
            console.log("✅ [CheckoutForm] Order successful! Initiating cleanup...");
            
            // 1. Reset Order State
            dispatch({ type: ORDER_CREATE_RESET });
            
            // 2. Reset Stripe State
            dispatch({ type: STRIPE_INTENT_RESET }); 
            
            // 3. WIPE THE COUPON STATE!
            console.log("🧹 [CheckoutForm] Wiping Coupon from Redux...");
            dispatch({ type: 'COUPON_VALIDATE_RESET' }); 

            // 4. (Optional but recommended) If your cart items aren't clearing properly, dispatch this too:
            // dispatch({ type: 'CART_CLEAR_ITEMS' });

            console.log("🚀 [CheckoutForm] Navigating to /order-success...");
            navigate('/order-success');
        }
        
        if (errorOrder) {
            console.error("❌ [CheckoutForm] Order Creation Failed:", errorOrder);
            setMessage(errorOrder);
        }
    }, [successOrder, errorOrder, navigate, dispatch]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements || !pendingOrderData) {
            console.warn("⚠️ [CheckoutForm] Missing stripe, elements, or pendingOrderData");
            return;
        }

        setIsProcessingStripe(true);
        setMessage(null);
        console.log("⏳ [CheckoutForm] Processing Stripe Payment...");

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/order-success`,
            },
            redirect: 'if_required', 
        });

        if (error) {
            console.error("❌ [CheckoutForm] Stripe Error:", error.message);
            setMessage(error.message || 'An unexpected error occurred.');
            setIsProcessingStripe(false);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log("✅ [CheckoutForm] Stripe Payment Succeeded!", paymentIntent.id);
            
            const finalOrderData = {
                ...pendingOrderData,
                paymentResult: {
                    id: paymentIntent.id,
                    status: paymentIntent.status,
                    email_address: paymentIntent.receipt_email || '',
                }
            };

            console.log("📦 [CheckoutForm] Dispatching createOrder to Backend...", finalOrderData);
            dispatch(createOrder(finalOrderData));
            setIsProcessingStripe(false);
        }
    };

    const isBusy = isProcessingStripe || isCreatingOrder;

    return (
        <form onSubmit={handleSubmit} className={styles['stripe-form']}>
            <div className={styles['stripe-form__header']}>
                <h3 className={styles['stripe-form__title']}>Complete Your Payment</h3>
                <p className={styles['stripe-form__subtitle']}>Enter your details below to securely finalize your order.</p>
            </div>
            
            <div className={styles['stripe-form__element-wrapper']}>
                <PaymentElement id="payment-element" />
            </div>

            {message && (
                <div className={styles['stripe-form__error']} role="alert">
                    <svg className={styles['stripe-form__error-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {message}
                </div>
            )}

            <button 
                disabled={isBusy || !stripe || !elements} 
                type="submit" 
                className={`${styles.btn} ${styles['btn--primary']} ${styles['stripe-form__submit']}`}
            >
                {isBusy ? (
                    <span className={`${styles.spinner} ${styles['spinner--small']}`}></span>
                ) : (
                    <>
                        <svg className={styles['stripe-form__btn-icon']} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Pay Now
                    </>
                )}
            </button>
        </form>
    );
};

export default CheckoutForm;