import axios from 'axios';
import {
  CATEGORY_LIST_REQUEST, CATEGORY_LIST_SUCCESS, CATEGORY_LIST_FAIL,
  CATEGORY_DETAILS_REQUEST, CATEGORY_DETAILS_SUCCESS, CATEGORY_DETAILS_FAIL,
  CATEGORY_CREATE_REQUEST, CATEGORY_CREATE_SUCCESS, CATEGORY_CREATE_FAIL,
  CATEGORY_UPDATE_REQUEST, CATEGORY_UPDATE_SUCCESS, CATEGORY_UPDATE_FAIL,
  CATEGORY_DELETE_REQUEST, CATEGORY_DELETE_SUCCESS, CATEGORY_DELETE_FAIL
} from '../../constants/admin/categoryConstants';
import { RootState } from '../../reducers';

export const listCategories = () => async (dispatch: any) => {
  try {
    dispatch({ type: CATEGORY_LIST_REQUEST });
    const { data } = await axios.get('/api/categories');
    dispatch({ type: CATEGORY_LIST_SUCCESS, payload: data });
  } catch (error: any) {
    dispatch({ type: CATEGORY_LIST_FAIL, payload: error.response?.data.message || error.message });
  }
};

export const listCategoryDetails = (id: string) => async (dispatch: any) => {
  try {
    dispatch({ type: CATEGORY_DETAILS_REQUEST });
    const { data } = await axios.get(`/api/categories/${id}`);
    dispatch({ type: CATEGORY_DETAILS_SUCCESS, payload: data.category });
  } catch (error: any) {
    dispatch({ type: CATEGORY_DETAILS_FAIL, payload: error.response?.data.message || error.message });
  }
};

export const createCategory = (categoryData: any) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: CATEGORY_CREATE_REQUEST });
    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}`, 'Content-Type': 'application/json' } };
    
    const { data } = await axios.post('/api/categories', categoryData, config);
    dispatch({ type: CATEGORY_CREATE_SUCCESS, payload: data.category });
  } catch (error: any) {
    dispatch({ type: CATEGORY_CREATE_FAIL, payload: error.response?.data.message || error.message });
  }
};

export const updateCategory = (categoryData: any) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: CATEGORY_UPDATE_REQUEST });
    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}`, 'Content-Type': 'application/json' } };
    
    const { data } = await axios.put(`/api/categories/${categoryData._id}`, categoryData, config);
    dispatch({ type: CATEGORY_UPDATE_SUCCESS, payload: data.category });
  } catch (error: any) {
    dispatch({ type: CATEGORY_UPDATE_FAIL, payload: error.response?.data.message || error.message });
  }
};

export const deleteCategory = (id: string) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: CATEGORY_DELETE_REQUEST });
    const { adminAuth: { adminInfo } } = getState();
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
    
    await axios.delete(`/api/categories/${id}`, config);
    dispatch({ type: CATEGORY_DELETE_SUCCESS });
  } catch (error: any) {
    dispatch({ type: CATEGORY_DELETE_FAIL, payload: error.response?.data.message || error.message });
  }
};