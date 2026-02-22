import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  salesPrice: number;
  salesTax: number;
  image: string;
}

export interface CartState {
  items: CartItem[];
  couponCode?: string;
  discountAmount: number;
}

const initialState: CartState = {
  items: localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart') || '[]') : [],
  couponCode: undefined,
  discountAmount: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find((item) => item.productId === action.payload.productId);
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((item) => item.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    applyCoupon: (state, action: PayloadAction<{ code: string; discountAmount: number }>) => {
      state.couponCode = action.payload.code;
      state.discountAmount = action.payload.discountAmount;
    },
    clearCart: (state) => {
      state.items = [];
      state.couponCode = undefined;
      state.discountAmount = 0;
      localStorage.removeItem('cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, applyCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
