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
      return {
        loading: false,
        products: action.payload.page === 1 || !action.payload.page
          ? action.payload.products
          : [...state.products, ...action.payload.products],
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case STOREFRONT_PRODUCT_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const storefrontProductDetailsReducer = (state = { product: { variants: [], images: [] } }, action: any) => {
  switch (action.type) {
    case 'STOREFRONT_PRODUCT_DETAILS_REQUEST':
      return { loading: true, ...state };
    case 'STOREFRONT_PRODUCT_DETAILS_SUCCESS':
      return { loading: false, product: action.payload };
    case 'STOREFRONT_PRODUCT_DETAILS_FAIL':
      return { loading: false, error: action.payload };
    case 'STOREFRONT_PRODUCT_DETAILS_RESET':
      return { product: {} }; // Resets the state back to empty
    default:
      return state;
  }
};