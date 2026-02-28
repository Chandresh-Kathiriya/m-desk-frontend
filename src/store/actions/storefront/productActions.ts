import axios from 'axios';
import {
  STOREFRONT_PRODUCT_LIST_REQUEST,
  STOREFRONT_PRODUCT_LIST_SUCCESS,
  STOREFRONT_PRODUCT_LIST_FAIL,
} from '../../constants/storefront/productConstants';

// --- NEW: Added pageNumber parameter with a default of 1 ---
export const listStorefrontProducts = (pageNumber = 1) => async (dispatch: any) => {
  try {
    dispatch({ type: STOREFRONT_PRODUCT_LIST_REQUEST });

    // --- NEW: Pass the page parameter in the query string ---
    const { data } = await axios.get(`/api/products/public?page=${pageNumber}`);

    dispatch({
      type: STOREFRONT_PRODUCT_LIST_SUCCESS,
      payload: data, // <-- CRUCIAL: Pass the whole data object so reducer gets `pages` info!
    });
  } catch (error: any) {
    dispatch({
      type: STOREFRONT_PRODUCT_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const getStorefrontProductDetails = (id: string) => async (dispatch: any) => {
  try {
    dispatch({ type: 'STOREFRONT_PRODUCT_DETAILS_REQUEST' });

    const { data } = await axios.get(`/api/products/public/${id}`);

    dispatch({
      type: 'STOREFRONT_PRODUCT_DETAILS_SUCCESS',
      payload: data.product,
    });
  } catch (error: any) {
    dispatch({
      type: 'STOREFRONT_PRODUCT_DETAILS_FAIL',
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};