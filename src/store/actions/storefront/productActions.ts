import axios from 'axios';
import {
  STOREFRONT_PRODUCT_LIST_REQUEST,
  STOREFRONT_PRODUCT_LIST_SUCCESS,
  STOREFRONT_PRODUCT_LIST_FAIL,
  STOREFRONT_SIMILAR_PRODUCTS_FAIL,
  STOREFRONT_SIMILAR_PRODUCTS_SUCCESS,
  STOREFRONT_SIMILAR_PRODUCTS_REQUEST,
  STOREFRONT_PRODUCT_DETAILS_REQUEST,
  STOREFRONT_PRODUCT_DETAILS_SUCCESS,
  STOREFRONT_PRODUCT_DETAILS_FAIL,
} from '../../constants/storefront/productConstants';

export const listStorefrontProducts = (pageNumber = 1, filters: Record<string, string[]> = {}) => async (dispatch: any) => {
  try {
      dispatch({ type: STOREFRONT_PRODUCT_LIST_REQUEST });

      // Build dynamic query string
      let queryString = `/api/products/public?page=${pageNumber}`;
      
      Object.entries(filters).forEach(([key, values]) => {
          if (values && values.length > 0) {
              queryString += `&${key}=${values.join(',')}`;
          }
      });

      const { data } = await axios.get(queryString);

      dispatch({
          type: STOREFRONT_PRODUCT_LIST_SUCCESS,
          payload: data,
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
    dispatch({ type: STOREFRONT_PRODUCT_DETAILS_REQUEST });

    const { data } = await axios.get(`/api/products/public/${id}`);

    dispatch({
      type: STOREFRONT_PRODUCT_DETAILS_SUCCESS,
      payload: data.product,
    });
  } catch (error: any) {
    dispatch({
      type: STOREFRONT_PRODUCT_DETAILS_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

// Update the parameters to accept all three values
export const listSimilarProducts = (productId: string, type: string, category: string, brand: string) => async (dispatch: any) => {
  try {
      dispatch({ type: 'STOREFRONT_SIMILAR_PRODUCTS_REQUEST' });

      // Build the query string dynamically
      let queryParams = new URLSearchParams();
      if (type) queryParams.append('type', type);
      if (category) queryParams.append('category', category);
      if (brand) queryParams.append('brand', brand);

      // Your API endpoint might differ slightly, adjust if needed (e.g., /api/products/similar/:id)
      const { data } = await axios.get(`/api/products/${productId}/similar?${queryParams.toString()}`);

      dispatch({
          type: 'STOREFRONT_SIMILAR_PRODUCTS_SUCCESS',
          payload: data,
      });
  } catch (error: any) {
      dispatch({
          type: 'STOREFRONT_SIMILAR_PRODUCTS_FAIL',
          payload: error.response && error.response.data.message ? error.response.data.message : error.message,
      });
  }
};