// 1. Pull saved data from localStorage (if it exists) so it survives page refreshes!
const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress') as string)
  : {};

const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
  ? JSON.parse(localStorage.getItem('paymentMethod') as string)
  : 'Stripe';

// 2. Expand your initial state
const initialState = { 
  cartItems: [], 
  loading: false, // (Change this to true if you want the spinner on first load like we discussed earlier!)
  error: null,
  shippingAddress: shippingAddressFromStorage, // <-- Added
  paymentMethod: paymentMethodFromStorage      // <-- Added
};

// 3. Your updated Reducer
export const cartReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'CART_SYNC_REQUEST':
      return { ...state, loading: true };
      
    case 'CART_SYNC_SUCCESS':
      // The backend returns the perfectly updated array, so we just overwrite it!
      return { 
        ...state, 
        loading: false, 
        cartItems: action.payload,
        error: null
      };
      
    case 'CART_SYNC_FAIL':
      return { ...state, loading: false, error: action.payload };

    // --- NEW: SAVE SHIPPING ADDRESS ---
    case 'CART_SAVE_SHIPPING_ADDRESS':
      return { 
        ...state, 
        shippingAddress: action.payload 
      };

    // --- NEW: SAVE PAYMENT METHOD ---
    case 'CART_SAVE_PAYMENT_METHOD':
      return { 
        ...state, 
        paymentMethod: action.payload 
      };
      
    case 'CART_CLEAR':
      // Call this after a successful Stripe payment!
      return { ...state, cartItems: [] };
      
    default:
      return state;
  }
};