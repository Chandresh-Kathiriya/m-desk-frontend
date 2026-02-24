import {
    STOREFRONT_PRODUCT_LIST_REQUEST,
    STOREFRONT_PRODUCT_LIST_SUCCESS,
    STOREFRONT_PRODUCT_LIST_FAIL,
  } from '../../constants/storefront/productConstants';
  
  export const storefrontProductListReducer = (state = { products: [] }, action: any) => {
    switch (action.type) {
      case STOREFRONT_PRODUCT_LIST_REQUEST:
        return { loading: true, products: [] };
      case STOREFRONT_PRODUCT_LIST_SUCCESS:
        return { loading: false, products: action.payload };
      case STOREFRONT_PRODUCT_LIST_FAIL:
        return { loading: false, error: action.payload };
      default:
        return state;
    }
  };