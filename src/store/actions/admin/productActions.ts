import axios from 'axios';
import {
  PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAIL,
  PRODUCT_DETAILS_REQUEST, PRODUCT_DETAILS_SUCCESS, PRODUCT_DETAILS_FAIL,
  PRODUCT_CREATE_REQUEST, PRODUCT_CREATE_SUCCESS, PRODUCT_CREATE_FAIL,
  PRODUCT_UPDATE_REQUEST, PRODUCT_UPDATE_SUCCESS, PRODUCT_UPDATE_FAIL,
  PRODUCT_DELETE_REQUEST, PRODUCT_DELETE_SUCCESS, PRODUCT_DELETE_FAIL
} from '../../constants/admin/productConstants';
import { RootState } from '../../reducers'; // Import RootState to type getState

// Fetch all products for the Admin Panel
export const listAdminProducts = () => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: PRODUCT_LIST_REQUEST });

    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

    const { data } = await axios.get('/api/products/admin/all', config);

    dispatch({ type: PRODUCT_LIST_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({
      type: PRODUCT_LIST_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

// Fetch single product
export const listProductDetails = (id: string) => async (dispatch: any) => {
  try {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });
    // This is public/accessible for loading details into the edit form
    const { data } = await axios.get(`/api/products/${id}`);
    dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: data.product });
  } catch (error: any) {
    dispatch({
      type: PRODUCT_DETAILS_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

// Create Product
export const createProduct = (productData: any) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: PRODUCT_CREATE_REQUEST });

    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}`, 'Content-Type': 'application/json' } };

    const { data } = await axios.post('/api/products', productData, config);

    dispatch({ type: PRODUCT_CREATE_SUCCESS, payload: data.product });
  } catch (error: any) {
    dispatch({
      type: PRODUCT_CREATE_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

// Update Product
export const updateProduct = (productData: any) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: PRODUCT_UPDATE_REQUEST });

    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}`, 'Content-Type': 'application/json' } };

    const { data } = await axios.put(`/api/products/${productData._id}`, productData, config);

    dispatch({ type: PRODUCT_UPDATE_SUCCESS, payload: data.product });
  } catch (error: any) {
    dispatch({
      type: PRODUCT_UPDATE_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};

// Delete Product
export const deleteProduct = (id: string) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: PRODUCT_DELETE_REQUEST });

    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

    await axios.delete(`/api/products/${id}`, config);

    dispatch({ type: PRODUCT_DELETE_SUCCESS });
  } catch (error: any) {
    dispatch({
      type: PRODUCT_DELETE_FAIL,
      payload: error.response && error.response.data.message ? error.response.data.message : error.message,
    });
  }
};