import axios from 'axios';
import { RootState } from '../../reducers';
import {
  MASTER_DATA_LIST_REQUEST, MASTER_DATA_LIST_SUCCESS, MASTER_DATA_LIST_FAIL,
  MASTER_DATA_CREATE_REQUEST, MASTER_DATA_CREATE_SUCCESS, MASTER_DATA_CREATE_FAIL,
  MASTER_DATA_DELETE_REQUEST, MASTER_DATA_DELETE_SUCCESS, MASTER_DATA_DELETE_FAIL,
  MASTER_DATA_UPDATE_REQUEST, MASTER_DATA_UPDATE_SUCCESS, MASTER_DATA_UPDATE_FAIL
} from '../../constants/admin/masterDataConstants';

// 1. Fetch List (Dynamic by dataType)
export const listMasterData = (dataType: string, search = '') => async (dispatch: any) => {
  try {
    dispatch({ type: MASTER_DATA_LIST_REQUEST, payload: { dataType } });

    // Hits /api/brands, /api/colors, etc.
    const { data } = await axios.get(`/api/${dataType}?search=${search}`);

    dispatch({ type: MASTER_DATA_LIST_SUCCESS, payload: { dataType, data: data.records } });
  } catch (error: any) {
    dispatch({
      type: MASTER_DATA_LIST_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// 2. Create Record (Protected Admin Route)
export const createMasterData = (dataType: string, recordData: any) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: MASTER_DATA_CREATE_REQUEST });

    const { adminAuth: { adminInfo } } = getState() as any;
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

    await axios.post(`/api/${dataType}`, recordData, config);

    dispatch({ type: MASTER_DATA_CREATE_SUCCESS });
  } catch (error: any) {
    dispatch({
      type: MASTER_DATA_CREATE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// 3. Delete Record (Protected Admin Route)
export const deleteMasterData = (dataType: string, id: string) => async (dispatch: any, getState: () => RootState) => {
  try {
    dispatch({ type: MASTER_DATA_DELETE_REQUEST });

    const { adminAuth: { adminInfo } } = getState() as any;
    const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };

    await axios.delete(`/api/${dataType}/${id}`, config);

    dispatch({ type: MASTER_DATA_DELETE_SUCCESS });
  } catch (error: any) {
    dispatch({
      type: MASTER_DATA_DELETE_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// 4. Update Record
export const updateMasterData = (dataType: string, id: string, recordData: any) => async (dispatch: any, getState: () => RootState) => {
    try {
      dispatch({ type: MASTER_DATA_UPDATE_REQUEST });
      const { adminAuth: { adminInfo } } = getState() as any;
      const config = { headers: { Authorization: `Bearer ${adminInfo.token}` } };
  
      await axios.put(`/api/${dataType}/${id}`, recordData, config);
  
      dispatch({ type: MASTER_DATA_UPDATE_SUCCESS });
    } catch (error: any) {
      dispatch({
        type: MASTER_DATA_UPDATE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };