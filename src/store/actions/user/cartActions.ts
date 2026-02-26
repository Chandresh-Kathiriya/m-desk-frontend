import axios from 'axios';

export const fetchUserCart = () => async (dispatch: any, getState: any) => {
    try {
      dispatch({ type: 'CART_SYNC_REQUEST' });
  
      // Safely grab the user info
      const state = getState();
      const userInfo = state.userAuth?.userInfo; // Adjust "userAuth" if your login state is named differently!
  
      if (!userInfo || !userInfo.token) return; 
  
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/cart', config);
  
      dispatch({
        type: 'CART_SYNC_SUCCESS',
        payload: data.items || [], 
      });
    } catch (error: any) {
      dispatch({ type: 'CART_SYNC_FAIL', payload: error.message });
    }
  };
  
  // --- ADD TO CART ---
export const addToCart = (product: any, variant: any, qty: number) => async (dispatch: any, getState: any) => {
  try {
    dispatch({ type: 'CART_SYNC_REQUEST' });

    const state = getState();
    const userInfo = state.userAuth?.userInfo;

    if (!userInfo || !userInfo.token) {
      alert("Please log in to add items to your cart!");
      return; 
    }

    const price = Number(variant.salesPrice) || 0;
    const tax = Number(variant.salesTax) || 0;
    const finalMrp = price + (price * (tax / 100));

    const colorImage = product.images?.find((img: any) => img.color?.toLowerCase() === variant.color.toLowerCase())?.url;
    // FIXED: Use a real placeholder URL if no image exists, because Mongoose will crash if this is an empty string!
    const fallbackImage = product.images?.length > 0 ? product.images[0].url : 'https://via.placeholder.com/150';

    const cartItemData = {
      product: product._id,
      sku: variant.sku,
      name: product.productName,
      image: colorImage || fallbackImage,
      price: finalMrp,
      color: variant.color,
      size: variant.size,
      qty: Number(qty),
      maxStock: variant.stock,
    };

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    const { data } = await axios.post('/api/cart', cartItemData, config);

    dispatch({
      type: 'CART_SYNC_SUCCESS',
      payload: data.items,
    });
  } catch (error: any) {
    // --- CAPTURE THE REAL BACKEND ERROR ---
    console.error("❌ BACKEND REJECTED THE REQUEST:", error.response?.data || error.message);
    dispatch({ type: 'CART_SYNC_FAIL', payload: error.response?.data?.message || error.message });
  }
};
  
  // --- REMOVE FROM CART ---
  export const removeFromCart = (sku: string) => async (dispatch: any, getState: any) => {
    try {
      const state = getState();
      const userInfo = state.userAuth?.userInfo;
      
      if (!userInfo || !userInfo.token) return;
  
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.delete(`/api/cart/${sku}`, config);
  
      dispatch({
        type: 'CART_SYNC_SUCCESS',
        payload: data.items,
      });
    } catch (error: any) {
      console.error("Failed to remove item", error);
    }
  };

  // --- UPDATE CART QUANTITY ---
export const updateCartQty = (sku: string, qty: number) => async (dispatch: any, getState: any) => {
  try {
    const state = getState();
    const userInfo = state.userAuth?.userInfo;
    
    if (!userInfo || !userInfo.token) return;

    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
    
    // Call the new PUT route we just created!
    const { data } = await axios.put(`/api/cart/${sku}`, { qty }, config);

    dispatch({
      type: 'CART_SYNC_SUCCESS',
      payload: data.items,
    });
  } catch (error: any) {
    console.error("Failed to update item quantity", error);
  }
};

export const savePaymentMethod = (data: string) => (dispatch: any) => {
  dispatch({
    type: 'CART_SAVE_PAYMENT_METHOD',
    payload: data,
  });

  localStorage.setItem('paymentMethod', JSON.stringify(data));
};

// --- SAVE SHIPPING ADDRESS ---
export const saveShippingAddress = (data: { address: string; city: string; postalCode: string; country: string }) => (dispatch: any) => {
  dispatch({
    type: 'CART_SAVE_SHIPPING_ADDRESS',
    payload: data,
  });

  // Save to local storage so they don't have to re-type it if they close the browser
  localStorage.setItem('shippingAddress', JSON.stringify(data));
};

export const clearUserCart = () => async (dispatch: any, getState: any) => {
  try {
      const state = getState();
      const userInfo = state.userAuth?.userInfo;
      
      if (!userInfo || !userInfo.token) return;

      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      
      // Clear cart in the backend database
      await axios.delete('/api/cart', config);

      // Clear cart in the Redux state (matches your existing CART_CLEAR case)
      dispatch({ type: 'CART_CLEAR' });
  } catch (error: any) {
      console.error("Failed to clear cart", error);
  }
};