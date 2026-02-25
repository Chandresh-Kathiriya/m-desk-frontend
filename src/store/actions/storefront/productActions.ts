import axios from 'axios';
import {
  STOREFRONT_PRODUCT_LIST_REQUEST,
  STOREFRONT_PRODUCT_LIST_SUCCESS,
  STOREFRONT_PRODUCT_LIST_FAIL,
} from '../../constants/storefront/productConstants';

export const listStorefrontProducts = () => async (dispatch: any) => {
  try {
    dispatch({ type: STOREFRONT_PRODUCT_LIST_REQUEST });

    // Hitting the new public route we just created!
    const { data } = await axios.get('/api/products/public');

    dispatch({
      type: STOREFRONT_PRODUCT_LIST_SUCCESS,
      payload: data.products,
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

    // Assuming your public route looks something like this based on your controller
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