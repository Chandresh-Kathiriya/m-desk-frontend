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

export const listSimilarProducts = (categoryId: string, currentProductId: string) => async (dispatch: any) => {
  try {
      dispatch({ type: STOREFRONT_SIMILAR_PRODUCTS_REQUEST });

      const { data } = await axios.get(`/api/products/public?categories=${categoryId}`);
      
      // Filter out the current product and grab only the top 4
      const filteredProducts = data.products
          .filter((p: any) => p._id !== currentProductId)
          .slice(0, 4);

      dispatch({ type: STOREFRONT_SIMILAR_PRODUCTS_SUCCESS, payload: filteredProducts });
  } catch (error: any) {
      dispatch({
          type: STOREFRONT_SIMILAR_PRODUCTS_FAIL,
          payload: error.response?.data?.message || error.message,
      });
  }
};