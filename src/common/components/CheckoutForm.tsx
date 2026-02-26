import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, Alert, Spinner } from 'react-bootstrap';

const CheckoutForm: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js hasn't yet loaded.
    }

    setIsProcessing(true);

    // This securely sends the card data directly to Stripe's servers
    const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          // --- CHANGE THIS LINE ---
          return_url: `${window.location.origin}/order-success`, 
        },
      });

    if (error) {
      setMessage(error.message || 'An unexpected error occurred.');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border p-4 rounded shadow-sm bg-white">
      <h3 className="fw-bold mb-4 text-center">Complete Your Payment</h3>
      
      {/* This renders the actual Credit Card input fields securely from Stripe */}
      <PaymentElement id="payment-element" />

      <Button 
        disabled={isProcessing || !stripe || !elements} 
        type="submit" 
        variant="dark" 
        size="lg" 
        className="w-100 mt-4 py-3 fw-bold shadow"
      >
        {isProcessing ? (
          <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Processing...</>
        ) : (
          "Pay Now"
        )}
      </Button>

      {message && <Alert variant="danger" className="mt-3">{message}</Alert>}
    </form>
  );
};

export default CheckoutForm;